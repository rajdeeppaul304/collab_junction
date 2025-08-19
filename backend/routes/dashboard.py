from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

dashboard = Blueprint('dashboard', __name__)

@dashboard.route("/dashboard/creator", methods=["GET"])
@jwt_required()
def creator_dashboard():
    # identity = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    if role != "CREATOR":
        return jsonify({"msg": "Unauthorized"}), 403
    return jsonify({"msg": "Welcome Creator"})

@dashboard.route("/dashboard/brand", methods=["GET"])
@jwt_required()
def brand_dashboard():
    # identity = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    if role != "BRAND":
        return jsonify({"msg": "Unauthorized"}), 403
    return jsonify({"msg": "Welcome Brand"})
