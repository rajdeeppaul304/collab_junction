from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from utils.email import send_verification_email
from werkzeug.utils import secure_filename
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import uuid, json, os
from models import db, User, Product, CreatorInterest, Offer, OfferStatus, CreatorProfile, ProductView
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, make_response
from models import db, User, UserRole



creator = Blueprint('creator', __name__)


# GET /api/auth/me
@creator.route("/get_products", methods=["GET"])
@jwt_required()
def get_products():
    identity = int(get_jwt_identity())
    user = User.query.get(identity)

    if not user:
        return jsonify({"msg": "User not found"}), 404
    print(f"User found: {user.name} with role {user.user_role}")
    role = user.user_role.name if user.user_role else "unknown"
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role
    })

# @creator.route("/products", methods=["GET"])
# @jwt_required()
# def get_creator_products():
#     current_user_id = int(get_jwt_identity())
    
#     # Get query parameters
#     category = request.args.get("category")
#     search = request.args.get("search", "").lower()

#     # Base query
#     products_query = Product.query.filter(Product.status == "active")

#     # Apply filters
#     if category:
#         products_query = products_query.filter(Product.category.ilike(f"%{category}%"))
#     if search:
#         products_query = products_query.filter(Product.name.ilike(f"%{search}%"))

#     # Get products with their first image
#     products = []
#     for product in products_query.all():
#         product_data = {
#             "id": product.id,
#             "name": product.name,
#             "brand": product.brand.name if product.brand else "Unknown Brand",
#             "price": product.price,
#             "category": product.category,
#             "image": product.images[0].image_url if product.images else "/sample/default.jpg"
#         }
#         products.append(product_data)

#     return jsonify(products)



@creator.route("/products/categories", methods=["GET"])
@jwt_required()
def get_creator_product_categories():
    # Get distinct categories from products
    categories = db.session.query(Product.category.distinct()).filter(Product.status == "active").all()
    return jsonify([category[0] for category in categories])




# @creator.route("/products/popular", methods=["GET"])
# @jwt_required()
# def get_popular_products():
#     # Simulated popular products
#     # going to put the products with the most offers
#     popular_products = [
#         {"id": 1, "name": "Sony A6400", "brand": "Sony", "price": 68000, "image": "/sample/sony.jpg"},
#         {"id": 2, "name": "DJI Mini 2", "brand": "DJI", "price": 58000, "image": "/sample/dji.jpg"},
#         {"id": 3, "name": "GoPro HERO9", "brand": "GoPro", "price": 35000, "image": "/sample/gopro.jpg"},
#     ]
#     return jsonify(popular_products)


@creator.route("/stats", methods=["GET"])
@jwt_required()
def get_creator_stats():
    current_user_id = int(get_jwt_identity())
    
    # Count collaborations (accepted offers)
    collaborations = Offer.query.filter(
        Offer.creator_id == current_user_id,
        Offer.status == OfferStatus.ACCEPTED
    ).count()

    # Count pending offers
    pending_offers = Offer.query.filter(
        Offer.creator_id == current_user_id,
        Offer.status == OfferStatus.PENDING
    ).count()

    # Calculate earnings (sum of accepted offer budgets)
    earnings = db.session.query(
        db.func.sum(Offer.budget)
    ).filter(
        Offer.creator_id == current_user_id,
        Offer.status == OfferStatus.ACCEPTED
    ).scalar() or 0

    return jsonify({
        "collaborations": collaborations,
        "pendingOffers": pending_offers,
        "earnings": earnings,
        "profileViews": 215  # You'll need to implement tracking for this
    })




@creator.route("/offers", methods=["GET"])
@jwt_required()
def get_creator_offers():
    current_user_id = int(get_jwt_identity())
    limit = int(request.args.get("limit", 5))

    offers = (
        Offer.query
        .filter(Offer.creator_id == current_user_id)
        .join(Product)
        .join(User, Product.brand_id == User.id)
        .order_by(Offer.created_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for offer in offers:
        result.append({
            "id": offer.id,
            "name": offer.product.name,
            "brand": offer.product.brand.name,
            "status": offer.status.value,
            "budget": offer.budget,
            "created_at": offer.created_at.isoformat()
        })

    return jsonify(result)



@creator.route("/profile", methods=["GET"])
@jwt_required()
def get_creator_profile():
    
    current_user_id = int(get_jwt_identity())
    
    profile = CreatorProfile.query.filter_by(user_id=current_user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    # Convert languages_spoken string to list
    languages_list = profile.languages_spoken.split(", ") if profile.languages_spoken else []
    print('hi',languages_list)

    return jsonify({
        "id": current_user_id,
        "name": profile.display_name,
        "short_bio": profile.short_bio,
        "bio": profile.bio,
        "languages": languages_list,  # Send as an array
        "social": {
            "instagram": profile.instagram,
            "youtube": profile.youtube,
            "tiktok": profile.tiktok,
            "twitter": profile.twitter,
            "website": profile.portfolio_url
        },
        "phone": profile.phone_number,
        "followers": profile.follower_count,
        "avatar": profile.avatar_url
    })




@creator.route("/profile", methods=["PUT"])
@jwt_required()
def update_creator_profile():
    current_user_id = int(get_jwt_identity())
    
    profile = CreatorProfile.query.filter_by(user_id=current_user_id).first()
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    # Determine data and files depending on content type
    if request.content_type and 'multipart/form-data' in request.content_type:
        files = request.files

        # Get languages[] from form data as list
        languages_list = request.form.getlist("languages[]")
        # Get other fields as dict
        data = request.form.to_dict()

        # Merge parsed languages
        data['languages'] = languages_list
        print(data['languages'])
        # Parse social JSON field if sent
        if 'social' in data:
            try:
                data['social'] = json.loads(data['social'])
            except (json.JSONDecodeError, TypeError):
                data['social'] = {}
    else:
        data = request.get_json() or {}
        files = {}

    # Handle avatar image removal
    if data.get("image_deleted") == "true" and profile.avatar_url:
        old_file_path = profile.avatar_url.replace("/static/", "static/")
        if os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
            except OSError:
                pass
        profile.avatar_url = None

    # Handle avatar image upload
    image = files.get("image")
    if image and image.filename:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif','avif'}
        if '.' in image.filename and image.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
            filename = f"{uuid.uuid4().hex}_{secure_filename(image.filename)}"
            upload_dir = "static/avatars"
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, filename)
            image.save(path)
            profile.avatar_url = f"/static/avatars/{filename}"
        else:
            return jsonify({"error": "Invalid file type. Only PNG, JPG, JPEG, GIF, and AVIF are allowed."}), 400

    # Update text fields
    if 'name' in data:
        profile.display_name = data['name']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'short_bio' in data:
        profile.short_bio = data['short_bio']
    if 'phone' in data:
        profile.phone_number = data['phone']
    if 'followers' in data:
        profile.follower_count = data['followers']

    # Update languages
    if 'languages' in data:
        if isinstance(data['languages'], list):
            profile.languages_spoken = ", ".join(data['languages'])
        else:
            profile.languages_spoken = data['languages']

    # Update social media links
    social = data.get("social", {})
    if isinstance(social, dict):
        profile.instagram = social.get('instagram')
        profile.youtube = social.get('youtube')
        profile.tiktok = social.get('tiktok')
        profile.twitter = social.get('twitter')
        profile.portfolio_url = social.get('website')

    # Commit changes
    db.session.commit()

    # Return updated profile
    return jsonify({
        "message": "Profile updated successfully",
        "profile": {
            "id": current_user_id,
            "name": profile.display_name,
            "short_bio": profile.short_bio,
            "bio": profile.bio,
            "phone": profile.phone_number,
            "followers": profile.follower_count,
            "languages": profile.languages_spoken,
            "avatar_url": profile.avatar_url,
            "social": {
                "instagram": profile.instagram,
                "youtube": profile.youtube,
                "tiktok": profile.tiktok,
                "twitter": profile.twitter,
                "website": profile.portfolio_url
            }
        }
    }), 200





@creator.route("/collaborations", methods=["GET"])
@jwt_required()
def get_creator_collaborations():
    current_user_id = int(get_jwt_identity())
    
    collaborations = (
        Offer.query
        .filter(
            Offer.creator_id == current_user_id,
            Offer.status.in_([OfferStatus.ACCEPTED, OfferStatus.COMPLETED])
        )
        .join(Product)
        .join(User, Product.brand_id == User.id)
        .order_by(Offer.created_at.desc())
        .all()
    )

    result = []
    for offer in collaborations:
        result.append({
            "id": offer.id,
            "brand": offer.product.brand.name,
            "status": offer.status.value,
            "product_name": offer.product.name,
            "budget": offer.budget,
            "created_at": offer.created_at.isoformat()
        })

    return jsonify(result)


@creator.route("/products/brands", methods=["GET"])
@jwt_required()
def get_product_brands():
    """Get distinct brands from products"""
    try:
        # Assuming you have a Brand model or brand field in Product
        brands = db.session.query(Product.brand.distinct()).filter(Product.status == "active").all()
        brand_names = [brand[0] for brand in brands if brand[0]]
        return jsonify(brand_names)
    except Exception as e:
        print(f"Error fetching brands: {e}")
        # Return some default brands if query fails
        return jsonify(["Sony", "Canon", "Nikon", "Apple", "Samsung", "DJI", "GoPro"])


@creator.route("/products/colors", methods=["GET"])
@jwt_required()
def get_product_colors():
    """Get distinct colors from products"""
    try:
        # If you have a color field in your Product model
        colors = db.session.query(Product.color.distinct()).filter(Product.status == "active").all()
        color_names = [color[0] for color in colors if color[0]]
        return jsonify(color_names)
    except Exception as e:
        print(f"Error fetching colors: {e}")
        # Return some default colors if query fails
        return jsonify(["Black", "White", "Silver", "Gold", "Blue", "Red", "Green"])


@creator.route("/products/types", methods=["GET"])
@jwt_required()
def get_product_types():
    """Get distinct product types"""
    try:
        # If you have a product_type field in your Product model
        types = db.session.query(Product.product_type.distinct()).filter(Product.status == "active").all()
        type_names = [ptype[0] for ptype in types if ptype[0]]
        return jsonify(type_names)
    except Exception as e:
        print(f"Error fetching types: {e}")
        # Return some default types if query fails
        return jsonify(["Camera", "Lens", "Accessory", "Drone", "Audio", "Lighting", "Tripod"])


# Updated products route with better filtering
@creator.route("/products", methods=["GET"])
@jwt_required()
def get_creator_products():
    current_user_id = int(get_jwt_identity())
    
    # Get query parameters
    category = request.args.get("category")
    brand = request.args.get("brand")
    color = request.args.get("color")
    product_type = request.args.get("type")
    price_range = request.args.get("price")
    search = request.args.get("search", "").lower()

    # Base query
    products_query = Product.query.filter(Product.status == "active")

    # Apply filters
    if category and category != "all":
        products_query = products_query.filter(Product.category.ilike(f"%{category}%"))
    
    if brand and brand != "all":
        products_query = products_query.filter(Product.brand.ilike(f"%{brand}%"))
    
    if color and color != "all":
        # Assuming you have a color field
        try:
            products_query = products_query.filter(Product.color.ilike(f"%{color}%"))
        except AttributeError:
            pass  # If color field doesn't exist, skip this filter
    
    if product_type and product_type != "all":
        # Assuming you have a product_type field
        try:
            products_query = products_query.filter(Product.product_type.ilike(f"%{product_type}%"))
        except AttributeError:
            pass  # If product_type field doesn't exist, skip this filter
    
    if price_range and price_range != "all":
        if price_range == "Under 10k":
            products_query = products_query.filter(Product.price < 10000)
        elif price_range == "10k-50k":
            products_query = products_query.filter(Product.price.between(10000, 50000))
        elif price_range == "50k-100k":
            products_query = products_query.filter(Product.price.between(50000, 100000))
        elif price_range == "Above 100k":
            products_query = products_query.filter(Product.price > 100000)
    
    if search:
        products_query = products_query.filter(
            db.or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%") if hasattr(Product, 'description') else Product.name.ilike(f"%{search}%")
            )
        )

    # Get products with their first image
    products = []
    for product in products_query.all():
        # Handle brand - could be a relationship or direct field
        brand_name = "Unknown Brand"
        try:
            if hasattr(product, 'brand') and product.brand:
                if hasattr(product.brand, 'name'):
                    brand_name = product.brand.name
                else:
                    brand_name = str(product.brand)
        except Exception:
            brand_name = "Unknown Brand"

        product_data = {
            "id": product.id,
            "name": product.name,
            "brand": brand_name,
            "price": product.price,
            "category": product.category,
            "image": product.images[0].image_url if product.images else "/sample/default.jpg"
        }
        products.append(product_data)

    return jsonify(products)


# Updated popular products with real data
@creator.route("/products/popular", methods=["GET"])
@jwt_required()
def get_popular_products():
    """Get popular products based on offer count or other metrics"""
    try:
        # Get products with most offers
        popular_query = (
            db.session.query(Product, db.func.count(Offer.id).label('offer_count'))
            .outerjoin(Offer)
            .filter(Product.status == "active")
            .group_by(Product.id)
            .order_by(db.desc('offer_count'))
            .limit(5)
        )
        
        popular_products = []
        for product, offer_count in popular_query.all():
            # Handle brand name
            brand_name = "Unknown Brand"
            try:
                if hasattr(product, 'brand') and product.brand:
                    if hasattr(product.brand, 'name'):
                        brand_name = product.brand.name
                    else:
                        brand_name = str(product.brand)
            except Exception:
                brand_name = "Unknown Brand"

            popular_products.append({
                "id": product.id,
                "name": product.name,
                "brand": brand_name,
                "price": product.price,
                "image": product.images[0].image_url if product.images else "/sample/default.jpg",
                "offer_count": offer_count
            })
        
        # If no products found, return some sample data
        if not popular_products:
            popular_products = [
                {"id": 1, "name": "Sony A6400", "brand": "Sony", "price": 68000, "image": "/sample/sony.jpg"},
                {"id": 2, "name": "DJI Mini 2", "brand": "DJI", "price": 58000, "image": "/sample/dji.jpg"},
                {"id": 3, "name": "GoPro HERO9", "brand": "GoPro", "price": 35000, "image": "/sample/gopro.jpg"},
            ]
        
        return jsonify(popular_products)
        
    except Exception as e:
        print(f"Error fetching popular products: {e}")
        # Return fallback data
        popular_products = [
            {"id": 1, "name": "Sony A6400", "brand": "Sony", "price": 68000, "image": "/sample/sony.jpg"},
            {"id": 2, "name": "DJI Mini 2", "brand": "DJI", "price": 58000, "image": "/sample/dji.jpg"},
            {"id": 3, "name": "GoPro HERO9", "brand": "GoPro", "price": 35000, "image": "/sample/gopro.jpg"},
        ]
        return jsonify(popular_products)
    


@creator.route("/products/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product_detail(product_id):
    """Get detailed information about a specific product"""
    try:
        product = Product.query.filter_by(id=product_id, status="active").first()
        
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Handle brand name
        brand_name = "Unknown Brand"
        try:
            if hasattr(product, 'brand') and product.brand:
                if hasattr(product.brand, 'name'):
                    brand_name = product.brand.name
                else:
                    brand_name = str(product.brand)
        except Exception:
            brand_name = "Unknown Brand"

        # Get all product images
        images = []
        if product.images:
            images = [img.image_url for img in product.images]
        
        product_data = {
            "id": product.id,
            "name": product.name,
            "brand": brand_name,
            "price": product.price,
            "originalPrice": getattr(product, 'original_price', None),
            "category": product.category,
            "description": getattr(product, 'description', None),
            "specifications": getattr(product, 'specifications', None),
            "image": images[0] if images else "/sample/default.jpg",
            "images": images,
            "status": product.status,
            "options": product.options or [],  # Include product options
            "created_at": product.created_at.isoformat() if hasattr(product, 'created_at') else None
        }

        return jsonify(product_data)
        
    except Exception as e:
        print(f"Error fetching product detail: {e}")
        return jsonify({"error": "Failed to fetch product details"}), 500

        
@creator.route("/products/<int:product_id>/interest", methods=["GET"])
@jwt_required()
def check_product_interest(product_id):
    """Check if current user has expressed interest in a product"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Check if product exists
        product = Product.query.filter_by(id=product_id, status="active").first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Check if user has expressed interest
        interest = CreatorInterest.query.filter_by(
            creator_id=current_user_id,
            product_id=product_id
        ).first()

        return jsonify({
            "isInterested": interest is not None,
            "product_id": product_id
        })
        
    except Exception as e:
        print(f"Error checking product interest: {e}")
        return jsonify({"error": "Failed to check interest"}), 500
    

# @creator.route("/interests", methods=["GET"])
# @jwt_required()
# def get_creator_interests():
#     """Get all products the creator has shown interest in"""
#     try:
#         current_user_id = int(get_jwt_identity())

#         interests = (
#             CreatorInterest.query
#             .join(Product, CreatorInterest.product_id == Product.id)
#             .join(User, Product.brand_id == User.id)
#             .filter(CreatorInterest.creator_id == current_user_id)
#             .order_by(CreatorInterest.created_at.desc())
#             .all()
#         )

#         interest_data = []
#         for interest in interests:
#             product = interest.product
#             brand = product.brand

#             interest_data.append({
#                 "id": interest.id,
#                 "productId": product.id,
#                 "productName": product.name,
#                 "price": product.price,
#                 "brandName": brand.name,
#                 "image": product.images[0],  # Make sure `image` is a URL
#                 "interestedAt": interest.created_at.isoformat()
#             })
#         # print(product.images[0])
#         return jsonify(interest_data)

#     except Exception as e:
#         print(f"Error fetching creator interests: {e}")
#         return jsonify({"error": "Failed to fetch interests"}), 500



@creator.route("/products/<int:product_id>/interest", methods=["POST"])
@jwt_required()
def express_product_interest(product_id):
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        print("Received interest data:", data)  # Log dynamic data

        product = Product.query.filter_by(id=product_id, status="active").first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        user = User.query.get(current_user_id)
        if not user or (user.user_role and user.user_role.name != "CREATOR"):
            return jsonify({"error": "Only creators can express interest"}), 403

        existing_interest = CreatorInterest.query.filter_by(
            creator_id=current_user_id,
            product_id=product_id
        ).first()

        if existing_interest:
            return jsonify({"message": "Interest already expressed"}), 200

        new_interest = CreatorInterest(
            creator_id=current_user_id,
            product_id=product_id,
            data=data  # store all received fields here
        )
        
        db.session.add(new_interest)
        db.session.commit()

        return jsonify({
            "message": "Interest expressed successfully",
            "isInterested": True
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error expressing product interest: {e}")
        return jsonify({"error": "Failed to express interest"}), 500






@creator.route("/products/<int:product_id>/interest", methods=["DELETE"])
@jwt_required()
def remove_product_interest(product_id):
    """Remove interest in a product"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Find and remove the interest record
        interest = CreatorInterest.query.filter_by(
            creator_id=current_user_id,
            product_id=product_id
        ).first()

        if not interest:
            return jsonify({"message": "No interest found to remove"}), 404

        db.session.delete(interest)
        db.session.commit()

        return jsonify({
            "message": "Interest removed successfully",
            "isInterested": False
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing product interest: {e}")
        return jsonify({"error": "Failed to remove interest"}), 500


@creator.route("/products/<int:product_id>/view", methods=["POST"])
@jwt_required()
def track_view(product_id):
    print("view called")
    # Step 1: Get the product or 404
    product = Product.query.get_or_404(product_id)

    # Step 3: Create a new view log
    view = ProductView(
        product_id=product.id,
        viewed_at=datetime.now(timezone.utc),
    )

    # Step 4: Save to database
    db.session.add(view)
    db.session.commit()

    return jsonify({"message": "View recorded"}), 201




@creator.route("/products/<int:product_id>/related", methods=["GET"])
@jwt_required()
def get_related_products(product_id):
    """Get products related to the current product (same category)"""
    try:
        # Get the current product to find its category
        current_product = Product.query.filter_by(id=product_id, status="active").first()
        if not current_product:
            return jsonify({"error": "Product not found"}), 404

        # Get related products from the same category, excluding current product
        limit = int(request.args.get("limit", 4))
        
        related_products_query = Product.query.filter(
            Product.category == current_product.category,
            Product.id != product_id,
            Product.status == "active"
        ).limit(limit)

        related_products = []
        for product in related_products_query.all():
            # Handle brand name
            brand_name = "Unknown Brand"
            try:
                if hasattr(product, 'brand') and product.brand:
                    if hasattr(product.brand, 'name'):
                        brand_name = product.brand.name
                    else:
                        brand_name = str(product.brand)
            except Exception:
                brand_name = "Unknown Brand"

            product_data = {
                "id": product.id,
                "name": product.name,
                "brand": brand_name,
                "price": product.price,
                "category": product.category,
                "image": product.images[0].image_url if product.images else "/sample/default.jpg"
            }
            related_products.append(product_data)

        return jsonify(related_products)
        
    except Exception as e:
        print(f"Error fetching related products: {e}")
        return jsonify({"error": "Failed to fetch related products"}), 500


# Optional: Get user's interested products
@creator.route("/interests", methods=["GET"])
@jwt_required()
def get_user_interests():
    """Get all products the current user has expressed interest in"""
    try:
        current_user_id = int(get_jwt_identity())
        
        interests = (
            CreatorInterest.query
            .filter_by(creator_id=current_user_id)
            .join(Product)
            .filter(Product.status == "active")
            .all()
        )

        interested_products = []
        for interest in interests:
            product = interest.product
            
            # Handle brand name
            brand_name = "Unknown Brand"
            try:
                if hasattr(product, 'brand') and product.brand:
                    if hasattr(product.brand, 'name'):
                        brand_name = product.brand.name
                    else:
                        brand_name = str(product.brand)
            except Exception:
                brand_name = "Unknown Brand"

            product_data = {
                "id": product.id,
                "name": product.name,
                "brand": brand_name,
                "price": product.price,
                "category": product.category,
                "image": product.images[0].image_url if product.images else "/sample/default.jpg",
                "interested_at": interest.created_at.isoformat() if hasattr(interest, 'created_at') else None
            }
            interested_products.append(product_data)
        # print(interested_products)
        return jsonify(interested_products)
        
    except Exception as e:
        print(f"Error fetching user interests: {e}")
        return jsonify({"error": "Failed to fetch interests"}), 500


# Optional: Get interest statistics for a product (for brands)
@creator.route("/products/<int:product_id>/interest-stats", methods=["GET"])
@jwt_required()
def get_product_interest_stats(product_id):
    """Get interest statistics for a product"""
    try:
        # Check if product exists
        product = Product.query.filter_by(id=product_id, status="active").first()
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Count total interests
        total_interests = CreatorInterest.query.filter_by(product_id=product_id).count()

        return jsonify({
            "product_id": product_id,
            "total_interests": total_interests
        })
        
    except Exception as e:
        print(f"Error fetching interest stats: {e}")
        return jsonify({"error": "Failed to fetch interest statistics"}), 500