from flask import Blueprint, request, jsonify
from models import db, User, UserRole, CreatorProfile, BrandProfile
from werkzeug.security import generate_password_hash, check_password_hash
from utils.email import send_verification_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import uuid


from flask import Blueprint, request, jsonify, make_response
from models import db, User, UserRole, AuthProvider, NotRoleOAuth



auth = Blueprint('auth', __name__)
tokens = {}  # In-memory verification token store — use DB in production

@auth.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"msg": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400

    try:
        user_role = UserRole(role)
    except ValueError:
        return jsonify({"msg": "Invalid user role"}), 400

    hashed_password = generate_password_hash(password)
    user = User(
        name=name,
        email=email,
        password=hashed_password,
        user_role=user_role,
        is_verified=False
    )
    db.session.add(user)
    db.session.flush()  # Ensures user.id is populated before commit

    # Conditionally create profile based on role
    if user_role == UserRole.CREATOR:
        creator_profile = CreatorProfile(user_id=user.id, display_name=name)
        db.session.add(creator_profile)
    elif user_role == UserRole.BRAND:
        brand_profile = BrandProfile(user_id=user.id, brand_name=name)
        db.session.add(brand_profile)

    db.session.commit()

    # Generate email verification token
    token = str(uuid.uuid4())
    tokens[token] = email
    send_verification_email(email, token)

    return jsonify({
        "msg": "Signup successful. Please check your email to verify your account."
    }), 201



# GET /api/auth/verify/<token>
@auth.route("/auth/verify/<token>", methods=["GET"])
def verify_email(token):
    email = tokens.get(token)
    if not email:
        return jsonify({"msg": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.is_verified = True
    db.session.commit()
    return jsonify({"msg": "Email verified successfully"})


# POST /api/auth/signin
@auth.route("/auth/signin", methods=["POST"])
def signin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.password or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    if not user.is_verified:
        return jsonify({"msg": "Please verify your email before signing in."}), 403

    role = user.user_role.name if user.user_role else "unknown"
    jwt_token = create_access_token(identity={"id": user.id, "email": user.email, "role": role})

    return jsonify({
        "token": jwt_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role
        }
    })

# GET /api/auth/me
@auth.route("/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    print("error here")
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])

    if not user:
        return jsonify({"msg": "User not found"}), 404

    role = user.user_role.name if user.user_role else "unknown"
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role
    })


@auth.route('/set_role', methods=['POST'])
def set_role():
    data = request.get_json()
    github_id = data.get('github_id')
    user_role = data.get('user_role')

    if user_role not in ['CREATOR', 'BRAND']:
        return jsonify({"msg": "Invalid role selected."}), 400

    oauth_user = NotRoleOAuth.query.filter_by(github_id=github_id).first()
    if not oauth_user:
        return jsonify({"msg": "No OAuth data found. Please log in again."}), 400

    # Check if user already exists (edge case)
    existing_user = User.query.filter_by(email=oauth_user.email).first()
    if existing_user:
        return jsonify({"msg": "User already exists."}), 400

    # Create new user
    user = User(
        email=oauth_user.email,
        password=None,
        username=oauth_user.username,
        github_id=oauth_user.github_id,
        is_verified=True,
        profile_image=oauth_user.avatar,
        user_role=user_role,
        auth_provider=AuthProvider.GITHUB
    )
    db.session.add(user)
    db.session.delete(oauth_user)
    db.session.commit()

    # ✅ Generate JWT token like in signin
    token = create_access_token(identity={"email": user.email, "role": user.user_role.name})

    return jsonify({"msg": "User created and signed in.", "token": token})


from flask import Blueprint, jsonify, redirect, url_for
from extensions import db, oauth
from models import User, UserRole
from flask_jwt_extended import create_access_token


@auth.route('/login/github')
def github_login():
    redirect_uri = url_for('auth.github_callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri)

from flask import redirect, url_for

@auth.route('/login/callback')
def github_callback():
    token = oauth.github.authorize_access_token()
    github_user = oauth.github.get('user').json()

    github_id = str(github_user.get('id'))
    email = github_user.get('email')
    username = github_user.get('login')
    avatar = github_user.get('avatar_url')

    # If email is not public, fetch it
    if not email:
        emails = oauth.github.get('user/emails').json()
        email = next((e['email'] for e in emails if e['primary'] and e['verified']), None)
        if not email:
            return jsonify({"msg": "No verified email available."}), 400

    # Save user data to the not_role_oauth table
    existing_oauth_user = NotRoleOAuth.query.filter_by(github_id=github_id).first()

    if not existing_oauth_user:
        oauth_user = NotRoleOAuth(github_id=github_id, email=email, username=username, avatar=avatar)
        db.session.add(oauth_user)
        db.session.commit()

    # Redirect user to the frontend /set-role page with the github_id as a query parameter
    return redirect("http://localhost:3000/set-role?github_id=" + github_id)

