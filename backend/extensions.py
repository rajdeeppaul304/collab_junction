# backend/extensions.py
from flask_mail import Mail
# backend/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from authlib.integrations.flask_client import OAuth

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
oauth = OAuth()  # Initialize without app (will bind in app.py)
