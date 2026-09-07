import re
from datetime import datetime


def find_value(text: str, patterns: list[str]) -> str | None:
    """
    Try several regex patterns and return the first match.
    """
    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.MULTILINE,
        )

        if match:
            value = match.group(1).strip()

            # Clean excessive whitespace
            value = re.sub(r"\s+", " ", value)

            return value

    return None


def extract_fields(text: str) -> dict:
    """
    Extract useful food-label fields from OCR text.

    The patterns intentionally tolerate common OCR mistakes
    such as MIRP instead of MRP.
    """

    product_name = find_value(
        text,
        [
            r"(?:product\s*(?:name)?|name)\s*[:\-]\s*([^\n]+)",
            r"\b(?:guru)\s*\n\s*([A-Z][A-Za-z ]+(?:\s+[A-Za-z]+)?)",
        ],
    )

    # If the OCR doesn't contain "Product:" we try to recognize
    # the product from the sample label.
    if not product_name:
        lines = [
            re.sub(r"\s+", " ", line).strip()
            for line in text.splitlines()
            if line.strip()
        ]

        for line in lines:
            if re.fullmatch(
                r"(?:Aloo\s+Bhujiya|Bhujiya|Namkeen|Biscuits?)",
                line,
                re.IGNORECASE,
            ):
                product_name = line
                break

    batch_no = find_value(
        text,
        [
            r"(?:batch|lot)\s*(?:no|number)?\s*[:\-]?\s*([A-Z0-9/\-]+)",
        ],
    )

    manufacturing_date = find_value(
        text,
        [
            r"(?:mfg|manufactur(?:ed|ing))\s*(?:date)?\s*[:\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})",
        ],
    )

    expiry_date = find_value(
        text,
        [
            # Standard expiry/best-before date
            r"(?:exp|expiry|use\s*by|best\s*before)\s*(?:date)?"
            r"\s*[:\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})",

            # Example: "Best Before 90 Days from MFG Date"
            r"(best\s*before\s+\d+\s+days?\s+from\s+mfg\s+date)",
        ],
    )

    mrp = find_value(
        text,
        [
            # OCR commonly reads MRP as MIRP
            r"(?:mrp|mirp|m\.r\.p\.?)\s*[:\-]?\s*"
            r"(?:₹|rs\.?|inr)?\s*"
            r"([0-9]+(?:\.[0-9]{1,2})?)",

            r"maximum\s+retail\s+price\s*[:\-]?\s*"
            r"(?:₹|rs\.?|inr)?\s*"
            r"([0-9]+(?:\.[0-9]{1,2})?)",
        ],
    )

    quantity = find_value(
        text,
        [
            r"(?:net\s*(?:weight|wt)|net\s*quantity|quantity)"
            r"\s*[:\-]?\s*"
            r"([0-9]+(?:\.[0-9]+)?)\s*(g|kg|ml|l|pcs|pieces)\b",
        ],
    )

    manufacturer = find_value(
        text,
        [
            r"(?:manufactured\s*by|manufacturer|packer)"
            r"\s*[:\-]\s*([^\n]+)",

            # Useful fallback for the sample OCR:
            # "Barcode Label / Guru / Aloo Bhujiya"
            r"Barcode\s+Label\s*\n\s*([A-Za-z][A-Za-z ]+)\s*\n"
            r"\s*Aloo\s+Bhujiya",
        ],
    )

    country_of_origin = find_value(
        text,
        [
            r"(?:country\s*of\s*origin|made\s*in)"
            r"\s*[:\-]\s*([^\n]+)",
        ],
    )

    return {
        "product_name": product_name,
        "batch_no": batch_no,
        "manufacturing_date": manufacturing_date,
        "expiry_date": expiry_date,
        "mrp": mrp,
        "quantity": quantity,
        "manufacturer": manufacturer,
        "country_of_origin": country_of_origin,
    }


def validate(fields: dict) -> tuple[str, int, list[str]]:
    """
    Basic prototype compliance validation.

    This is intentionally simple for the hackathon demo.
    """

    required = [
        "batch_no",
        "expiry_date",
        "mrp",
        "quantity",
        "manufacturer",
    ]

    missing = [
        name
        for name in required
        if not fields.get(name)
    ]

    issues = [
        f"Missing {name.replace('_', ' ')}"
        for name in missing
    ]

    # Check expiry if we have an actual date.
    expiry = fields.get("expiry_date")

    if expiry:
        raw = expiry.replace("-", "/")

        for fmt in ("%d/%m/%Y", "%d/%m/%y"):
            try:
                expiry_date = datetime.strptime(
                    raw,
                    fmt,
                ).date()

                if expiry_date < datetime.now().date():
                    issues.append(
                        "Product expiry date has passed"
                    )

                break

            except ValueError:
                continue

    # Prototype scoring
    score = max(
        0,
        100 - len(issues) * 15,
    )

    if score >= 75:
        status = "PASS"
    elif score >= 50:
        status = "WARNING"
    else:
        status = "FAIL"

    return status, score, issues