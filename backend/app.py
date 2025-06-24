# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt, mail, oauth
from datetime import timedelta

def create_app():
    app = Flask(__name__)
    
    # Configs...
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['SECRET_KEY'] = 'your-flask-session-secret-key'
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    app.config['MAIL_USERNAME'] = 'rajdeeppaul304@gmail.com'
    app.config['MAIL_PASSWORD'] = 'esqr iwoj afvr szie'
    app.config['MAIL_DEFAULT_SENDER'] = 'rajdeeppaul304@gmail.com'
    app.config['SESSION_COOKIE_NAME'] = 'your_session_cookie_name'
    app.config['SESSION_COOKIE_SECURE'] = True  # Ensure cookies are only sent over HTTPS (if deployed)
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent client-side JavaScript from accessing cookies
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Lax or Strict based on your requirements


    CORS(app, supports_credentials=True, 
     origins=["http://localhost:5173"],
     expose_headers=["Authorization"]) 

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    oauth.init_app(app)  # ✅ bind OAuth to app

    # Register GitHub OAuth
    oauth.register(
        name='github',
        client_id='Ov23liQ34iAOUBZQVIMf',
        client_secret='6df5231e363437e596f45716a878ef018dc5df09',
        authorize_url='https://github.com/login/oauth/authorize',
        access_token_url='https://github.com/login/oauth/access_token',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
    )

    # Blueprints
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
        db.create_all()
    app.run(debug=True)
