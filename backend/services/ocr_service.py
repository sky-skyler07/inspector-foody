import shutil

import pytesseract
from PIL import Image


def extract_text(image_path: str) -> tuple[str, int]:
    try:
        tesseract_path = shutil.which("tesseract")

        if not tesseract_path:
            print("TESSERACT NOT FOUND")
            return "", 0

        print(f"TESSERACT FOUND: {tesseract_path}")

        image = Image.open(image_path)
        print(f"OCR IMAGE: {image.size}, mode={image.mode}")

        text = pytesseract.image_to_string(image)

        print(f"OCR TEXT LENGTH: {len(text)}")
        print(f"OCR TEXT: {text[:1000]}")

        confidence = 85 if text.strip() else 0

        return text.strip(), confidence

    except Exception as exc:
        print(f"OCR ERROR: {type(exc).__name__}: {exc}")
        return "", 0
