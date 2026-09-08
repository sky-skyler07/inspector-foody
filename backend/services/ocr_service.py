from pathlib import Path
import shutil

import pytesseract
from PIL import Image, ImageOps


def configure_tesseract():
    found = shutil.which("tesseract")

    if found:
        pytesseract.pytesseract.tesseract_cmd = found
        return

    paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]

    for path in paths:
        if Path(path).exists():
            pytesseract.pytesseract.tesseract_cmd = path
            return


configure_tesseract()


def prepare(image, scale=2):
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")
    image = image.resize(
        (image.width * scale, image.height * scale)
    )
    return image


def run_ocr(image, psm=6):
    return pytesseract.image_to_string(
        image,
        config=f"--psm {psm}",
    )


def extract_text(image_path: str) -> tuple[str, int]:
    try:
        image = Image.open(image_path)
        image = ImageOps.exif_transpose(image)

        width, height = image.size
        results = []

        # Full image
        full = prepare(image, scale=2)

        for psm in (6, 11):
            text = run_ocr(full, psm=psm)
            if text.strip():
                results.append(text)

        # Lower section where Net Qty / Lot / Date / MRP
        # are commonly printed
        lower = image.crop(
            (0, int(height * 0.45), width, height)
        )
        lower = prepare(lower, scale=3)

        for psm in (6, 11):
            text = run_ocr(lower, psm=psm)
            if text.strip():
                results.append(text)

        lines = []
        seen = set()

        for result in results:
            result = result.replace("\r", "\n")

            for line in result.splitlines():
                line = " ".join(line.strip().split())

                if len(line) < 2:
                    continue

                key = line.lower()

                if key in seen:
                    continue

                seen.add(key)
                lines.append(line)

        text = "\n".join(lines)[:12000]

        print(f"TESSERACT FOUND: {pytesseract.pytesseract.tesseract_cmd}")
        print(f"OCR IMAGE: {image.size}, mode={image.mode}")
        print(f"OCR TEXT LENGTH: {len(text)}")
        print(f"OCR TEXT: {text[:1500]}")

        if not text:
            return "", 0

        return text, 85

    except Exception as exc:
        print(
            f"OCR ERROR: {type(exc).__name__}: {exc}"
        )
        return "", 0
