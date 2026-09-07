from pathlib import Path


def extract_text(image_path: str) -> tuple[str, int]:
    """Run OCR when Tesseract is installed; otherwise return a safe prototype fallback."""
    try:
        import pytesseract
        from PIL import Image
        text = pytesseract.image_to_string(Image.open(image_path))
        confidence = 85 if text.strip() else 0
        return text.strip(), confidence
    except Exception:
        return "", 0
