import shutil

import pytesseract
from PIL import Image, ImageOps


def configure_tesseract():
    found = shutil.which("tesseract")

    if found:
        pytesseract.pytesseract.tesseract_cmd = found
        return


configure_tesseract()


def extract_text(image_path: str) -> tuple[str, int]:
    try:
        image = Image.open(image_path)
        image = ImageOps.exif_transpose(image)

        print(f"TESSERACT FOUND: {shutil.which('tesseract')}")
        print(f"OCR IMAGE: {image.size}, mode={image.mode}")

        text = pytesseract.image_to_string(
            image,
            config="--psm 6",
        )

        print(f"OCR TEXT LENGTH: {len(text)}")
        print(f"OCR TEXT: {text[:1500]}")

        if not text.strip():
            return "", 0

        return text.strip(), 85

    except Exception as exc:
        print(f"OCR ERROR: {type(exc).__name__}: {exc}")
        return "", 0
