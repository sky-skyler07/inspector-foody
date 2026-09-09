import cv2
import numpy as np
from pathlib import Path
from statistics import mean
from rapidocr_onnxruntime import RapidOCR
import sys
sys.stdout.reconfigure(encoding="utf-8")

_ocr=None
def get_ocr():
    global _ocr
    if _ocr is None:
        _ocr=RapidOCR()
    return _ocr
    
def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Preprocesses images for better OCR extraction on packaging:

    - Converts to grayscale
    - Enhances contrast using CLAHE
    - Applies subtle bilateral filtering to reduce noise while keeping edges sharp
    """
    # 1. Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
    # Improves readability of light text on dark backgrounds or dot-matrix prints
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 3. Bilateral Filter to remove noise while keeping text edges crisp
    denoised = cv2.bilateralFilter(enhanced, d=5, sigmaColor=75, sigmaSpace=75)

    # 4. Convert back to BGR since RapidOCR expects 3-channel images
    processed_bgr = cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)

    return processed_bgr

def extract_text(image_path: str) -> tuple[str, int]:
    """
    Returns:
        raw_text, confidence (0-100)
    """
    image_path = str(Path(image_path).resolve())
    try:
        ocr = get_ocr()
        image=cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not read image: {image_path}")
        processed_image = preprocess_image(image)
        result, _ = ocr(processed_image)

        if not result:
            return "", 0

        texts = []
        scores = []

        for item in result:
            if len(item) < 3:
                continue

            text = item[1]
            score = item[2]

            if not isinstance(text, str):
                continue

            text = text.strip()

            if not text:
                continue

            texts.append(text)

            try:
                scores.append(float(score))
            except (TypeError, ValueError):
                continue

        if not texts:
            return "", 0

        raw_text = "\n".join(texts)

        confidence = (round(mean(scores) * 100) if scores else 0)

        return raw_text, confidence

    except Exception as e:
        raise RuntimeError(f"RapidOCR failed: {type(e).__name__}: {e}") from e
images=["IMG-20260907-WA0008","IMG-20260907-WA0018","IMG-20260907-WA0019","IMG-20260907-WA0021","IMG-20260907-WA0022","IMG-20260907-WA0023",
"IMG-20260907-WA0024","IMG-20260907-WA0026"]
base_dir = Path(r"C:\Users\Aman\Desktop\OCR_testing")

for idx, img_name in enumerate(images, start=1):
    img_path = base_dir / f"{img_name}.jpg"
    try:
        text, conf = extract_text(str(img_path))
        print(f"{idx}: [Confidence: {conf}%]\n{text}\n{'-'*30}")
    except Exception as err:
        print(f"{idx}: Error processing {img_name}: {err}")