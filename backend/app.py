import os
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
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # -------------------
    # Database
    # -------------------
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # -------------------
    # JWT
    # -------------------
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 7)))
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # -------------------
    # Mail
    # -------------------
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # -------------------
    # Session Cookies
    # -------------------
    app.config['SESSION_COOKIE_NAME'] = 'your_session_cookie_name'
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # -------------------
    # CORS
    # -------------------
    origins = os.getenv("CORS_ORIGINS", "").split(",")
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
    # OAuth (GitHub)
    # -------------------
    oauth.register(
        name='github',
        client_id=os.getenv('GITHUB_CLIENT_ID'),
        client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
        authorize_url=os.getenv('GITHUB_AUTHORIZE_URL'),
        access_token_url=os.getenv('GITHUB_ACCESS_TOKEN_URL'),
        api_base_url=os.getenv('GITHUB_API_BASE_URL'),
        client_kwargs={'scope': os.getenv('GITHUB_SCOPE')}
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


if __name__ == "__main__":
    
    app = create_app()
    with app.app_context():
        # db.drop_all()
        db.create_all()
    app.run(debug=True)
