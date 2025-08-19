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
    image_url = db.Column(db.String(255), nullable=False)
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
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    budget = db.Column(db.Float, nullable=True)
    status = db.Column(SqlEnum(OfferStatus), default=OfferStatus.PENDING, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship("User", backref="offers")
    product = db.relationship("Product", backref="offers")




class BrandProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)

    brand_name = db.Column(db.String(120), nullable=False)
    slogan = db.Column(db.String(255), nullable=True)
    locations = db.Column(JSONEncodedList, nullable=True)  # Store as JSON
    sales_per_month = db.Column(db.String(20), nullable=True)
    product_count = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)

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
    avatar_url = db.Column(db.String(255), nullable=True)  # URL/path to profile image
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
    
    # Stats (could be updated periodically)
    follower_count = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('creator_profile', uselist=False))
    
