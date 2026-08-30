"""
Image storage helper.

If Cloudinary credentials are set in .env, uploaded product images are sent
to Cloudinary and a permanent https:// URL is returned. This is required for
deployments with an ephemeral filesystem (Render, Railway, Fly.io, etc.),
where anything written to local disk is wiped on every restart/redeploy.

If Cloudinary is NOT configured, this falls back to saving files under
./uploads on local disk — useful for quick local development without
needing a Cloudinary account.
"""
import uuid
import shutil
from pathlib import Path

from core.config import settings

CLOUDINARY_ENABLED = bool(
    settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET
)

if CLOUDINARY_ENABLED:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
else:
    UPLOAD_DIR = Path("uploads")
    UPLOAD_DIR.mkdir(exist_ok=True)


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _save_image(upload_file, folder: str) -> str:
    """
    Internal helper — validates and saves ANY image, to a given Cloudinary
    folder (or local disk if Cloudinary isn't configured). Both
    save_product_image() and save_profile_image() below just call this with
    a different `folder`, so the validation logic only lives in one place.
    """
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError("Only JPEG, PNG, WEBP, or GIF images are allowed")

    upload_file.file.seek(0, 2)  # seek to end
    size = upload_file.file.tell()
    upload_file.file.seek(0)  # reset for actual read
    if size > MAX_IMAGE_SIZE_BYTES:
        raise ValueError("Image must be smaller than 5MB")

    if CLOUDINARY_ENABLED:
        result = cloudinary.uploader.upload(
            upload_file.file,
            folder=folder,
            resource_type="image",
        )
        return result["secure_url"]

    file_ext = upload_file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return f"/uploads/{filename}"


def save_product_image(upload_file) -> str:
    """Validates and saves a product image. See _save_image() above."""
    return _save_image(upload_file, folder="kisaanconnect/products")


def save_profile_image(upload_file) -> str:
    """Validates and saves a farmer/buyer profile photo. See _save_image() above."""
    return _save_image(upload_file, folder="kisaanconnect/profiles")