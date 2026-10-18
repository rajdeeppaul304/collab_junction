# backend/utils/uploader.py
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

_cloudinary_initialized = False


def _init_cloudinary():
    global _cloudinary_initialized
    if _cloudinary_initialized:
        return True

    cloud_name = current_app.config.get("CLOUDINARY_CLOUD_NAME") or os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = current_app.config.get("CLOUDINARY_API_KEY") or os.getenv("CLOUDINARY_API_KEY")
    api_secret = current_app.config.get("CLOUDINARY_API_SECRET") or os.getenv("CLOUDINARY_API_SECRET")

    # Cloudinary also supports CLOUDINARY_URL format
    cloudinary_url = current_app.config.get("CLOUDINARY_URL") or os.getenv("CLOUDINARY_URL")

    if (cloud_name and api_key and api_secret) or cloudinary_url:
        try:
            import cloudinary
            if cloudinary_url:
                cloudinary.config(cloudinary_url=cloudinary_url)
            else:
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret,
                    secure=True,
                )
            _cloudinary_initialized = True
            return True
        except Exception as exc:
            current_app.logger.warning(f"Failed to initialize Cloudinary: {exc}")
            return False

    return False


def upload_image(file_storage, folder="collab_junction/uploads", fallback_local_dir="static/uploads"):
    """Upload an image to Cloudinary if configured; otherwise save to local disk.

    Returns the public HTTPS URL (Cloudinary) or relative path (/static/...).
    Never throws - gracefully falls back to local storage if Cloudinary fails.
    """
    if not file_storage or not getattr(file_storage, "filename", None):
        return None

    # 1. Try Cloudinary
    if _init_cloudinary():
        try:
            import cloudinary.uploader
            file_storage.seek(0)
            result = cloudinary.uploader.upload(
                file_storage,
                folder=folder,
                resource_type="image",
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
            )
            secure_url = result.get("secure_url")
            if secure_url:
                current_app.logger.info(f"Image uploaded to Cloudinary: {secure_url}")
                return secure_url
        except Exception as exc:
            current_app.logger.warning(f"Cloudinary upload failed, falling back to local: {exc}")
            file_storage.seek(0)

    # 2. Local disk fallback
    os.makedirs(fallback_local_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{secure_filename(file_storage.filename)}"
    save_path = os.path.join(fallback_local_dir, filename)
    file_storage.save(save_path)

    # Ensure leading slash for web routing
    normalized_path = fallback_local_dir.replace("\\", "/").strip("/")
    return f"/{normalized_path}/{filename}"
