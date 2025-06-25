from flask import Blueprint, request, jsonify
from models import db, User, Product, ProductImage, ProductSize, CreatorInterest, Offer, CreatorProfile, BrandProfile
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid

brand = Blueprint('brand', __name__)

@brand.route("/get_products", methods=["GET"])
@jwt_required()
def get_products():
    current_user_id = get_jwt_identity().get("id")
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.user_role.value
    })




'''
static for now will implement in the future,
'''
@brand.route("/products/<int:product_id>/analytics", methods=["GET"])
@jwt_required()
def get_product_analytics(product_id):
    return jsonify({
        "views": 1234,
        "interestCount": 78,
        "conversionRate": 5.3
    })








# brand.py or similar
@brand.route("/brand-info", methods=["GET"])
@jwt_required()
def get_brand_info():
    user_id = get_jwt_identity()["id"]
    
    brand_profile = BrandProfile.query.filter_by(user_id=user_id).first()

    if not brand_profile:
        return jsonify({"error": "Brand profile not found"}), 404

    return jsonify({
        "user_id": brand_profile.user_id,
        "name": brand_profile.brand_name,
        "slogan": brand_profile.slogan,
        "locations": brand_profile.locations or [],
        "sales_per_month": brand_profile.sales_per_month,
        "product_count": brand_profile.product_count,
        "bio": brand_profile.description,
        "image_url": brand_profile.logo_url,
        "instagram": brand_profile.instagram,
        "instagram_handle": brand_profile.instagram_handle,
        "website": brand_profile.website,
        "email": brand_profile.contact_email,
        "owner_name": brand_profile.owner_name,
        "phone": brand_profile.phone_number,
        "role": "BRAND",
        "account_status": brand_profile.account_status,
        "joined_date": brand_profile.joined_date.strftime("%m/%d/%Y")
    })

@brand.route("/brand-info", methods=["PUT"])
@jwt_required()
def update_brand_info():
    user_id = get_jwt_identity()["id"]
    brand_profile = BrandProfile.query.filter_by(user_id=user_id).first()

    if not brand_profile:
        return jsonify({"error": "Brand profile not found"}), 404

    data = request.form
    files = request.files

    field_mapping = {
        "name": "brand_name",
        "slogan": "slogan",
        "instagram_handle": "instagram_handle",
        "bio": "description",
        "website": "website",
        "email": "contact_email",
        "owner_name": "owner_name",
        "phone": "phone_number"
    }

    for form_field, model_field in field_mapping.items():
        if form_field in data:
            setattr(brand_profile, model_field, data[form_field])

    # Handle locations (array)
    locations = request.form.getlist("locations[]")
    if locations:
        brand_profile.locations = locations

    # Handle image upload
    image = files.get("image")
    if image:
        filename = f"{uuid.uuid4().hex}_{secure_filename(image.filename)}"
        path = os.path.join("static", filename)
        image.save(path)
        brand_profile.logo_url = f"/static/{filename}"

    # Handle image removal
    if data.get("image_deleted") == "true":
        brand_profile.logo_url = None

    db.session.commit()

    return jsonify({"message": "Brand info updated successfully"})


@brand.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    print()
    current_user_id = get_jwt_identity().get("id")
    
    name = request.form.get("name")
    category = request.form.get("category")
    description = request.form.get("description")
    price = request.form.get("price")
    options_json = request.form.get("options")
    images = request.files.getlist("images")
    
    print(f"Name: {name}")
    print(f"Category: {category}")
    print(f"Description: {description}")
    print(f"Price: {price}")
    print(f"Options JSON: {options_json}")
    
    # Parse options JSON
    options = []
    if options_json:
        try:
            import json
            options = json.loads(options_json)
            print(f"Parsed Options: {options}")
            
            # Print each option in detail
            for i, option in enumerate(options):
                print(f"Option {i+1}:")
                print(f"  Name: {option.get('name')}")
                print(f"  Values: {option.get('values')}")
                
        except json.JSONDecodeError as e:
            print(f"Error parsing options JSON: {str(e)}")
            return jsonify({"message": "Invalid options format"}), 400

    if not all([name, category, description, price]):
        return jsonify({"message": "Missing required fields"}), 400

    if not options:
        return jsonify({"message": "At least one option is required"}), 400

    try:
        product = Product(
            name=name,
            category=category,
            description=description,
            price=float(price),
            brand_id=current_user_id,
            options=options  # Store options directly as JSON
        )
        db.session.add(product)
        db.session.flush()

        print(f"Product created with ID: {product.id}")
        print("Options saved to database:")
        for option in options:
            print(f"  - {option['name']}: {', '.join(option['values'])}")

        # Save images
        image_paths = []
        for img in images:
            if img.filename == '':
                continue
                
            filename = secure_filename(img.filename)
            save_path = os.path.join("static", "uploads", filename)
            img.save(save_path)
            url_path = f"/static/uploads/{filename}"
            db.session.add(ProductImage(image_url=url_path, product_id=product.id))
            image_paths.append(url_path)

        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "options": options,
                "images": image_paths
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating product: {str(e)}")
        return jsonify({"message": f"Error creating product: {str(e)}"}), 500


@brand.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def edit_product(product_id):
    current_user_id = get_jwt_identity().get("id")
    
    product = Product.query.filter_by(id=product_id, brand_id=current_user_id).first()
    if not product:
        return jsonify({"message": "Product not found"}), 404

    name = request.form.get("name")
    category = request.form.get("category")
    description = request.form.get("description")
    price = request.form.get("price")
    options_json = request.form.get("options")  # This will be a JSON string
    images = request.files.getlist("images")
    deleted_images = request.form.getlist("deleted_images[]")
    
    print(f"Name: {name}")
    print(f"Category: {category}")
    print(f"Description: {description}")
    print(f"Price: {price}")
    print(f"Options JSON: {options_json}")
    print(f"Deleted images: {deleted_images}")
    
    if not all([name, category, description, price]):
        return jsonify({"message": "Missing required fields"}), 400

    # Parse options JSON
    options = []
    if options_json:
        try:
            import json
            options = json.loads(options_json)
            print(f"Parsed Options: {options}")
            
            # Print each option in detail
            for i, option in enumerate(options):
                print(f"Option {i+1}:")
                print(f"  Name: {option.get('name')}")
                print(f"  Values: {option.get('values')}")
                
        except json.JSONDecodeError as e:
            print(f"Error parsing options JSON: {str(e)}")
            return jsonify({"message": "Invalid options format"}), 400

    if not options:
        return jsonify({"message": "At least one option is required"}), 400

    try:
        # Update basic fields
        product.name = name
        product.category = category
        product.description = description
        product.price = float(price)
        product.options = options  # Store options directly as JSON (JSONEncodedList handles the conversion)
        product.updated_at = datetime.utcnow()

        print(f"Product updated with ID: {product.id}")
        print("Options updated in database:")
        for option in options:
            print(f"  - {option['name']}: {', '.join(option['values'])}")

        # Delete selected images
        for url in deleted_images:
            image = ProductImage.query.filter_by(product_id=product.id, image_url=url).first()
            if image:
                file_path = os.path.join("static", "uploads", os.path.basename(url))
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")
                    except Exception as e:
                        print(f"Error deleting file {file_path}: {e}")
                db.session.delete(image)
                print(f"Deleted image record: {url}")

        # Append new images
        new_image_paths = []
        for img in images:
            if img.filename == '':
                continue
                
            filename = secure_filename(img.filename)
            save_path = os.path.join("static", "uploads", filename)
            img.save(save_path)
            url_path = f"/static/uploads/{filename}"
            db.session.add(ProductImage(image_url=url_path, product_id=product.id))
            new_image_paths.append(url_path)
            print(f"Added new image: {url_path}")

        db.session.commit()

        return jsonify({
            "message": "Product updated successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "options": options,
                "new_images": new_image_paths
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating product: {str(e)}")
        return jsonify({"message": f"Error updating product: {str(e)}"}), 500

        
@brand.route("/stats", methods=["GET"])
@jwt_required()
def brand_stats():
    current_user_id = get_jwt_identity().get("id")
    
    total_products = Product.query.filter_by(brand_id=current_user_id).count()

    # Count how many interests are shown on all this brand's products
    interests_count = CreatorInterest.query.join(Product).filter(
        Product.brand_id == current_user_id
    ).count()

    pending_requests = Offer.query.filter(
        Offer.product.has(brand_id=current_user_id),
        Offer.status == "pending"
    ).count()

    total_reach = 0  # Still a placeholder unless you compute from accepted Offers etc.

    return jsonify({
        "totalProducts": total_products,
        "interests": interests_count,
        "totalReach": total_reach,
        "pendingRequests": pending_requests
    })

@brand.route("/products", methods=["GET"])
@jwt_required()
def brand_products():

    current_user_id = get_jwt_identity().get("id")
    limit = int(request.args.get("limit", 10))
    
    products = Product.query.filter_by(brand_id=current_user_id).limit(limit).all()
    print(products)
    result = []
    for product in products:
        result.append({
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "description": product.description,
            "status": product.status,
            "price": product.price,
            # "sizes": [size.size for size in product.sizes],
            "images": [image.image_url for image in product.images]
        })
    print(result)
    return jsonify(result)

@brand.route("/recommended-creators", methods=["GET"])
@jwt_required()
def recommended_creators():
    limit = int(request.args.get("limit", 4))
    
    # Get creators who have shown interest in this brand's products
    creators = (
        db.session.query(CreatorProfile, User)
        .join(User, CreatorProfile.user_id == User.id)
        .join(CreatorInterest, CreatorInterest.creator_id == User.id)
        .join(Product, CreatorInterest.product_id == Product.id)
        .filter(Product.brand_id == get_jwt_identity().get("id"))
        .distinct()
        .limit(limit)
        .all()
    )
    
    result = []
    for profile, user in creators:
        result.append({
            "id": user.id,
            "name": profile.display_name or user.name,
            "category": profile.niche or "General",
            "followers": profile.follower_count or 0,
            "profile_picture": user.profile_image or "/static/default_creator.jpg"
        })
    
    return jsonify(result)

@brand.route("/interests", methods=["GET"])
@jwt_required()
def get_creator_interests():
    current_user_id = get_jwt_identity().get("id")

    interests = (
        CreatorInterest.query
        .join(Product, CreatorInterest.product_id == Product.id)
        .join(User, CreatorInterest.creator_id == User.id)
        .outerjoin(CreatorProfile, CreatorProfile.user_id == User.id)
        .filter(Product.brand_id == current_user_id)
        .order_by(CreatorInterest.created_at.desc())
        .all()
    )

    interest_data = []
    for interest in interests:
        creator = interest.creator
        profile = creator.creator_profile
        product = interest.product

        interest_data.append({
            "id": interest.id,
            "creatorId": creator.id,
            "creatorName": profile.display_name if profile else creator.name,
            "followers": profile.follower_count if profile and profile.follower_count else 0,
            "productId": product.id,
            "productName": product.name,
            "interestedAt": interest.created_at.isoformat(),
        })

    return jsonify(interest_data)

@brand.route("/creators/<int:creator_id>/profile", methods=["GET"])
@jwt_required()
def view_creator_profile(creator_id):
    """Allows a brand to view a specific creator's public profile"""
    try:
        # Optional: Confirm the user is a brand
        current_user = get_jwt_identity()
        user_id = current_user.get("id")
        user_role = current_user.get("role")
        if user_role != "BRAND":
            return jsonify({"error": "Access denied"}), 403

        profile = CreatorProfile.query.filter_by(user_id=creator_id).first()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify({
            "id": creator_id,
            "name": profile.display_name,
            "bio": profile.bio,
            "languages": [],  # Add in model if necessary
            "social": {
                "instagram": profile.instagram,
                "youtube": profile.youtube,
                "tiktok": profile.tiktok,
                "twitter": profile.twitter,
                "website": profile.portfolio_url
            },
            "phone": "add phone number"  # Add to schema if needed
        })
    except Exception as e:
        print(f"Error retrieving creator profile: {e}")
        return jsonify({"error": "Failed to fetch creator profile"}), 500

@brand.route("/interests/recent", methods=["GET"])
@jwt_required()
def get_recent_interests():
    current_brand_id = get_jwt_identity().get("id")

    try:
        # Get brand's products
        products = Product.query.filter_by(brand_id=current_brand_id).all()
        product_ids = [p.id for p in products]

        # Get recent interests (limit to 5 or 10)
        recent_interests = CreatorInterest.query \
            .filter(CreatorInterest.product_id.in_(product_ids)) \
            .order_by(CreatorInterest.created_at.desc()) \
            .limit(5) \
            .all()

        interests_data = []
        for interest in recent_interests:
            creator = interest.creator
            product = interest.product

            interests_data.append({
                "creator_id": creator.id,
                "creator_name": creator.name,
                "product_id": product.id,
                "product_name": product.name,
                "created_at": interest.created_at.isoformat()
            })

        return jsonify(interests_data)

    except Exception as e:
        print(f"Error fetching interests: {e}")
        return jsonify({"error": "Could not fetch interests"}), 500


@brand.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    current_user_id = get_jwt_identity().get("id")
    
    product = Product.query.filter_by(id=product_id, brand_id=current_user_id).first()
    if not product:
        return jsonify({"msg": "Product not found or not owned by you"}), 404
    
    try:
        # Delete will cascade to related ProductSize and ProductImage records
        db.session.delete(product)
        db.session.commit()
        return jsonify({"msg": f"Product {product_id} deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error deleting product: {str(e)}"}), 500

@brand.route("/products/<int:product_id>/status", methods=["PATCH"])
@jwt_required()
def update_product_status(product_id):
    current_user_id = get_jwt_identity().get("id")
    data = request.get_json()
    new_status = data.get("status")
    
    if not new_status:
        return jsonify({"msg": "Status is required"}), 400
    
    product = Product.query.filter_by(id=product_id, brand_id=current_user_id).first()
    if not product:
        return jsonify({"msg": "Product not found or not owned by you"}), 404
    
    product.status = new_status
    db.session.commit()
    
    return jsonify({
        "msg": f"Product {product_id} status updated to {new_status}",
        "product": {
            "id": product.id,
            "name": product.name,
            "status": product.status
        }
    }), 200

@brand.route("/products/<int:product_id>", methods=["GET"])
@jwt_required(optional=True)
def get_product_detail(product_id):
    current_user_id = get_jwt_identity().get("id")
    product = Product.query.filter_by(id=product_id, brand_id=current_user_id).first()
    print(product.options)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    # print(product)
    return jsonify({
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "description": product.description,
        "options": product.options or [],  # This will be automatically decoded from JSON
        "price": product.price,
        "status": product.status,
        "images": [image.image_url for image in product.images],
        "brand": {
            "id": product.brand.id,
            "name": product.brand.name
        }
    }), 200

@brand.route("/products/<int:product_id>/interest", methods=["GET"])
@jwt_required()
def check_product_interest(product_id):
    current_user_id = get_jwt_identity().get("id")
    
    # Check if current user (brand) has interest in their own product (probably not needed)
    # This endpoint might be better suited for creators to check their interest
    return jsonify({"isInterested": False}), 200

@brand.route("/products/<int:product_id>/interest", methods=["POST"])
@jwt_required()
def express_interest(product_id):
    # This endpoint might be better suited for creators
    # For brands, you might want to create offers to creators instead
    return jsonify({"msg": "Brands don't express interest in their own products"}), 400