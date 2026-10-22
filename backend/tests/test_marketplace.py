# backend/tests/test_marketplace.py
import pytest
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from extensions import db
from models import User, UserRole, Product, Offer, OfferStatus, PaymentTransaction, Message, Notification
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    os.environ["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app = create_app()
    app.config["TESTING"] = True
    app.config["JWT_SECRET_KEY"] = "test-secret"

    with app.app_context():
        db.create_all()

        # Seed Brand user
        brand = User(
            name="Apex Athletics",
            email="brand@apex.com",
            password=generate_password_hash("pass123"),
            user_role=UserRole.BRAND,
            is_verified=True,
        )
        # Seed Creator user
        creator = User(
            name="Alex Rivers",
            email="alex@creator.com",
            password=generate_password_hash("pass123"),
            user_role=UserRole.CREATOR,
            is_verified=True,
        )
        db.session.add_all([brand, creator])
        db.session.flush()

        product = Product(
            name="Pro Runner Shoes",
            category="Footwear",
            description="High performance shoes",
            price=4999.0,
            brand_id=brand.id,
            status="active",
        )
        db.session.add(product)
        db.session.commit()

        yield app.test_client(), brand.id, creator.id, product.id

        db.session.remove()
        db.drop_all()


def test_offer_state_machine(client):
    test_client, brand_id, creator_id, product_id = client

    # 1. Create tokens
    brand_token = create_access_token(identity=str(brand_id), additional_claims={"role": "BRAND"})
    creator_token = create_access_token(identity=str(creator_id), additional_claims={"role": "CREATOR"})

    brand_headers = {"Authorization": f"Bearer {brand_token}", "Content-Type": "application/json"}
    creator_headers = {"Authorization": f"Bearer {creator_token}", "Content-Type": "application/json"}

    # 2. Brand creates offer to creator
    res = test_client.post("/api/offers", json={
        "product_id": product_id,
        "creator_id": creator_id,
        "budget": 15000,
        "terms": "1 Instagram Reel + 2 Stories"
    }, headers=brand_headers)
    assert res.status_code == 201, res.json
    offer_id = res.json["offer"]["id"]
    assert res.json["offer"]["status"] == "pending"

    # 3. Creator counters the offer
    res = test_client.post(f"/api/offers/{offer_id}/counter", json={
        "budget": 20000,
        "notes": "Will include 1 YouTube Short as well"
    }, headers=creator_headers)
    assert res.status_code == 200, res.json
    assert res.json["offer"]["status"] == "countered"
    assert res.json["offer"]["budget"] == 20000

    # Guard check: Creator cannot counter again immediately without brand response
    res = test_client.post(f"/api/offers/{offer_id}/counter", json={"budget": 22000}, headers=creator_headers)
    assert res.status_code == 400

    # 4. Brand accepts creator's counter
    res = test_client.post(f"/api/offers/{offer_id}/accept", headers=brand_headers)
    assert res.status_code == 200
    assert res.json["offer"]["status"] == "accepted"

    # Guard check: Cannot accept an already accepted offer
    res = test_client.post(f"/api/offers/{offer_id}/accept", headers=brand_headers)
    assert res.status_code == 400

    # 5. Brand creates payment order (Idempotent)
    res = test_client.post("/api/payments/create-order", json={"offer_id": offer_id}, headers=brand_headers)
    assert res.status_code == 201
    order_id = res.json["order_id"]

    # Test idempotency: call again with same offer
    res2 = test_client.post("/api/payments/create-order", json={"offer_id": offer_id}, headers=brand_headers)
    assert res2.status_code == 201 or res2.status_code == 200

    # 6. Verify payment
    res = test_client.post("/api/payments/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_mock_123456",
        "razorpay_signature": "mock_sig"
    }, headers=brand_headers)
    assert res.status_code == 200
    assert res.json["offer"]["status"] == "paid"

    # 7. Complete offer
    res = test_client.post(f"/api/offers/{offer_id}/complete", headers=creator_headers)
    assert res.status_code == 200
    assert res.json["offer"]["status"] == "completed"

    # 8. Check audit trail length
    res = test_client.get(f"/api/offers/{offer_id}", headers=brand_headers)
    assert res.status_code == 200
    history = res.json["history"]
    actions = [h["action"] for h in history]
    assert actions == ["created", "countered", "accepted", "paid", "completed"]
    print("\nState Machine Audit Trail:", actions)
