import os
import sys

# Ensure backend directory is in python module search path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt, mail, oauth
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # -------------------
    # Flask Config
    # -------------------
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')

    # -------------------
    # Database
    # -------------------
    db_uri = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///users.db')
    if db_uri and db_uri.startswith('postgres://'):
        db_uri = db_uri.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # -------------------
    # JWT
    # -------------------
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 7)))
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # -------------------
    # Mail
    # -------------------
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER') or os.getenv('MAIL_USERNAME')
    # Mail is optional in local/dev - if it isn't configured we skip sending
    # instead of throwing (see utils/email.py).
    app.config['MAIL_SUPPRESS_SEND'] = not bool(os.getenv('MAIL_USERNAME'))

    # -------------------
    # Frontend URL (used for redirects/links, e.g. verification emails, OAuth)
    # -------------------
    app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # -------------------
    # Session Cookies
    # -------------------
    app.config['SESSION_COOKIE_NAME'] = 'collab_junction_session'
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # -------------------
    # CORS
    # -------------------
    origins = [o.strip() for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",") if o.strip()]
    CORS(app, supports_credentials=True,
         origins=origins,
         expose_headers=["Authorization"])

    # -------------------
    # Init extensions
    # -------------------
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    oauth.init_app(app)

    # -------------------
    # OAuth (GitHub) - optional, only registered if credentials are present
    # -------------------
    if os.getenv('GITHUB_CLIENT_ID') and os.getenv('GITHUB_CLIENT_SECRET'):
        oauth.register(
            name='github',
            client_id=os.getenv('GITHUB_CLIENT_ID'),
            client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
            authorize_url=os.getenv('GITHUB_AUTHORIZE_URL', 'https://github.com/login/oauth/authorize'),
            access_token_url=os.getenv('GITHUB_ACCESS_TOKEN_URL', 'https://github.com/login/oauth/access_token'),
            api_base_url=os.getenv('GITHUB_API_BASE_URL', 'https://api.github.com/'),
            client_kwargs={'scope': os.getenv('GITHUB_SCOPE', 'user:email')}
        )

    # -------------------
    # Blueprints
    # -------------------
    from routes.auth import auth
    app.register_blueprint(auth, url_prefix='/api')

    from routes.creator import creator
    app.register_blueprint(creator, url_prefix='/creator')

    from routes.brand import brand
    app.register_blueprint(brand, url_prefix='/brand')

    return app


@jwt.unauthorized_loader
def custom_unauthorized_response(err):
    print("❌ JWT unauthorized_loader triggered:", err)
    return jsonify({"error": "Missing or invalid Authorization header"}), 401

@jwt.invalid_token_loader
def custom_invalid_token_response(err):
    print("❌ JWT invalid_token_loader triggered:", err)
    return jsonify({"error": "Invalid token"}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("❌ JWT expired_token_loader triggered")
    return jsonify({"error": "Token expired"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    print("❌ JWT revoked_token_loader triggered")
    return jsonify({"error": "Token revoked"}), 401


app = create_app()

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print("db.create_all note:", e)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") == "development")
