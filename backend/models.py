from extensions import db
from enum import Enum
from sqlalchemy import Enum as SqlEnum
from datetime import datetime

class UserRole(Enum):
    CREATOR = "CREATOR"
    BRAND = "BRAND"

class AuthProvider(Enum):
    EMAIL = "email"
    GITHUB = "github"
    GOOGLE = "google"  # (if you add later)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Core Info
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=True)  # Optional GitHub username
    name = db.Column(db.String(100), nullable=True)     # ✅ NEW: For full name
    password = db.Column(db.Text, nullable=False) # ✅ Allow null for OAuth
    is_verified = db.Column(db.Boolean, default=False)
    user_role = db.Column(SqlEnum(UserRole), nullable=False)

    # OAuth-specific
    auth_provider = db.Column(SqlEnum(AuthProvider), default=AuthProvider.EMAIL, nullable=False)
    github_id = db.Column(db.String(64), unique=True, nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email} | {self.auth_provider}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.user_role.name,
            "is_verified": self.is_verified,
            "auth_provider": self.auth_provider.name,
            "created_at": self.created_at.isoformat()
        }


class NotRoleOAuth(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(120), unique=True, nullable=False)  # GitHub ID to associate with the user
    email = db.Column(db.String(120), unique=True, nullable=False)  # User's email
    username = db.Column(db.String(120), nullable=False)  # User's GitHub username
    avatar = db.Column(db.String(255), nullable=True)  # User's GitHub avatar
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Timestamp when OAuth details are saved

    def __init__(self, github_id, email, username, avatar):
        self.github_id = github_id
        self.email = email
        self.username = username
        self.avatar = avatar
from sqlalchemy.types import TypeDecorator, Text
import json


class JSONEncodedList(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return '[]'
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if not value:
            return []
        return json.loads(value)


from datetime import datetime, timezone

class ProductView(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    viewed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # ✅ timezone-aware

    product = db.relationship("Product", backref=db.backref("views", lazy=True))
    # user = db.relationship("User", backref=db.backref("viewed_products", lazy=True))


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    brand = db.relationship("User", backref=db.backref("products", lazy=True))

    # Store options as JSON instead of separate ProductSize table
    options = db.Column(JSONEncodedList, nullable=True)  # Store product options as JSON
    
    images = db.relationship("ProductImage", backref="product", cascade="all, delete-orphan")

class ProductImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(500), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)


class ProductSize(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(10), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)


class CreatorInterest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    data = db.Column(db.JSON, nullable=True)  # <-- store flexible fields here

    product = db.relationship("Product", backref=db.backref("interests", lazy=True))
    creator = db.relationship("User", backref=db.backref("interested_products", lazy=True))


class OfferStatus(Enum):
    PENDING = "pending"
    COUNTERED = "countered"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PAID = "paid"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    budget = db.Column(db.Float, nullable=False, default=0.0)
    terms = db.Column(db.Text, nullable=True)  # Deliverables / campaign scope / terms
    status = db.Column(SqlEnum(OfferStatus), default=OfferStatus.PENDING, nullable=False)
    last_action_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)  # User ID who made the latest proposal/counter
    version = db.Column(db.Integer, default=1, nullable=False)  # Optimistic concurrency lock
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship("User", foreign_keys=[creator_id], backref="offers")
    product = db.relationship("Product", backref="offers")
    last_actor = db.relationship("User", foreign_keys=[last_action_by])
    history = db.relationship("OfferHistory", backref="offer", cascade="all, delete-orphan", order_by="OfferHistory.created_at.asc()")
    payments = db.relationship("PaymentTransaction", backref="offer", cascade="all, delete-orphan", order_by="PaymentTransaction.created_at.desc()")
    messages = db.relationship("Message", backref="offer", cascade="all, delete-orphan", order_by="Message.created_at.asc()")

    def to_dict(self):
        brand_user = self.product.brand if self.product else None
        brand_profile = brand_user.brand_profile if brand_user else None
        creator_profile = self.creator.creator_profile if self.creator else None

        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else "Deleted Product",
            "product_image": self.product.images[0].image_url if self.product and self.product.images else "/sample/default.jpg",
            "creator_id": self.creator_id,
            "creator_name": creator_profile.display_name if creator_profile else (self.creator.name if self.creator else "Creator"),
            "creator_avatar": creator_profile.avatar_url if creator_profile else (self.creator.profile_image if self.creator else None),
            "brand_id": brand_user.id if brand_user else None,
            "brand_name": brand_profile.brand_name if brand_profile else (brand_user.name if brand_user else "Brand"),
            "brand_logo": brand_profile.logo_url if brand_profile else None,
            "budget": float(self.budget or 0),
            "terms": self.terms or "",
            "status": self.status.value,
            "last_action_by": self.last_action_by,
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "history_count": len(self.history) if self.history else 0,
        }


class OfferHistory(db.Model):
    """Immutable audit trail of all offer state transitions, counters, and proposals."""
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(db.Integer, db.ForeignKey("offer.id"), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 'created', 'countered', 'accepted', 'rejected', 'paid', 'completed', 'cancelled'
    previous_status = db.Column(db.String(50), nullable=True)
    new_status = db.Column(db.String(50), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    actor = db.relationship("User", foreign_keys=[actor_id])

    def to_dict(self):
        return {
            "id": self.id,
            "offer_id": self.offer_id,
            "actor_id": self.actor_id,
            "actor_name": self.actor.name if self.actor else "System",
            "action": self.action,
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "budget": float(self.budget),
            "notes": self.notes or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PaymentTransaction(db.Model):
    """Payment records linked to accepted offers, with idempotency and audit fields."""
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(db.Integer, db.ForeignKey("offer.id"), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="INR", nullable=False)
    status = db.Column(db.String(50), default="created", nullable=False)  # 'created', 'authorized', 'captured', 'failed', 'refunded'

    # Razorpay Gateway details
    razorpay_order_id = db.Column(db.String(120), unique=True, nullable=True)
    razorpay_payment_id = db.Column(db.String(120), unique=True, nullable=True)
    razorpay_signature = db.Column(db.String(255), nullable=True)

    # Idempotency token (prevent double charges)
    idempotency_key = db.Column(db.String(120), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payer = db.relationship("User", foreign_keys=[payer_id])

    def to_dict(self):
        return {
            "id": self.id,
            "offer_id": self.offer_id,
            "payer_id": self.payer_id,
            "amount": float(self.amount),
            "currency": self.currency,
            "status": self.status,
            "razorpay_order_id": self.razorpay_order_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WebhookEvent(db.Model):
    """Tracks received payment gateway webhooks for strict idempotency."""
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.String(150), unique=True, nullable=False)
    provider = db.Column(db.String(50), default="razorpay", nullable=False)
    event_type = db.Column(db.String(100), nullable=False)
    payload = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String(50), default="processed", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Message(db.Model):
    """In-app chat messages exchanged within an offer negotiation room."""
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(db.Integer, db.ForeignKey("offer.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User", foreign_keys=[sender_id])

    def to_dict(self):
        return {
            "id": self.id,
            "offer_id": self.offer_id,
            "sender_id": self.sender_id,
            "sender_name": self.sender.name if self.sender else "User",
            "sender_role": self.sender.user_role.value if self.sender and self.sender.user_role else None,
            "content": self.content,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    """Real-time & persistent user notifications."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'offer_new', 'offer_counter', 'offer_accepted', 'payment_success', 'message_new'
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("notifications", lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }





class BrandProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)

    brand_name = db.Column(db.String(120), nullable=False)
    slogan = db.Column(db.String(255), nullable=True)
    locations = db.Column(JSONEncodedList, nullable=True)  # Store as JSON
    sales_per_month = db.Column(db.String(20), nullable=True)
    product_count = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)

    instagram = db.Column(db.String(255), nullable=True)
    instagram_handle = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    contact_email = db.Column(db.String(120), nullable=True)
    owner_name = db.Column(db.String(120), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)

    account_status = db.Column(db.String(20), default='ACTIVE')
    joined_date = db.Column(db.DateTime, default=datetime.utcnow)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('brand_profile', uselist=False))


class CreatorProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    
    # Creator-specific information
    display_name = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)  # URL/path to profile image
    short_bio = db.Column(db.String(255), nullable=True)   # Brief summary
    bio = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    languages_spoken = db.Column(db.String(255), nullable=True)  # e.g., "English, Spanish"
    
    # Professional details
    niche = db.Column(db.String(100), nullable=True)  # e.g., fashion, tech, food
    experience_level = db.Column(db.String(50), nullable=True)  # beginner, intermediate, expert
    portfolio_url = db.Column(db.String(255), nullable=True)
    
    # Social media links
    instagram = db.Column(db.String(100), nullable=True)
    youtube = db.Column(db.String(100), nullable=True)
    tiktok = db.Column(db.String(100), nullable=True)
    twitter = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    
    # Stats (could be updated periodically)
    follower_count = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('creator_profile', uselist=False))
    
