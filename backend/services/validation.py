import re
from datetime import datetime


def clean_value(value: str | None) -> str | None:
    if not value:
        return None

    value = re.sub(r"\s+", " ", value).strip(" :-;,.")

    if len(value) < 2:
        return None

    return value


def find_inline(text: str, patterns: list[str]) -> str | None:
    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.MULTILINE,
        )

        if match:
            return clean_value(match.group(1))

    return None


def find_after_label(text: str, labels: list[str]) -> str | None:
    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for i, line in enumerate(lines):
        lower = line.lower()

        for label in labels:
            if label in lower:
                # Value may be on the same line after the label
                remainder = re.sub(
                    rf"^\s*{re.escape(label)}\s*[:;\-]?\s*",
                    "",
                    line,
                    flags=re.IGNORECASE,
                ).strip()

                if remainder and remainder.lower() != label.lower():
                    return clean_value(remainder)

                # Or the value may be on the following line
                if i + 1 < len(lines):
                    next_line = lines[i + 1]

                    if next_line and not any(
                        x in next_line.lower()
                        for x in [
                            "net qty",
                            "lot no",
                            "pkg date",
                            "use by",
                            "mrp",
                            "nutrition",
                            "store",
                            "manufactured",
                            "manufacturing",
                        ]
                    ):
                        return clean_value(next_line)

    return None


def extract_product_name(text: str) -> str | None:
    # Strong explicit label
    value = find_inline(
        text,
        [
            r"(?:product\s*name|product)\s*[:\-]\s*([^\n]+)",
        ],
    )

    if value:
        return value

    # Common food-brand OCR: line containing "Soy", "Chunks", etc.
    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for line in lines:
        if re.search(
            r"\b(?:soy|soya|biscuit|biscuits|namkeen|noodles|chips|masala|atta|flour|rice|dal|spice|honey|juice|drink|chocolate)\b",
            line,
            re.IGNORECASE,
        ):
            if len(line) <= 80:
                return clean_value(line)

    return None


def extract_fields(text: str) -> dict:
    text = text.replace("\r", "\n")

    product_name = extract_product_name(text)

    batch_no = find_inline(
        text,
        [
            r"(?:batch|lot)\s*(?:no|number)?\s*[:;\-]?\s*([A-Z0-9][A-Z0-9/\-]*)",
        ],
    )

    if not batch_no:
        batch_no = find_after_label(
            text,
            [
                "lot no",
                "lot number",
                "batch no",
                "batch number",
            ],
        )

        if batch_no:
            # Avoid accidentally returning another field label
            if re.fullmatch(
                r"(?:pkg|package|date|mrp|usp|net\s*qty|use\s*by).*",
                batch_no,
                re.IGNORECASE,
            ):
                batch_no = None

    manufacturing_date = find_inline(
        text,
        [
            r"(?:mfg|mfd|manufactur(?:ing|ed)?)\s*(?:date)?\s*[:;\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})",
            r"(?:mfg|mfd|manufactur(?:ing|ed)?)\s*(?:date)?\s*[:;\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{2,4})",
        ],
    )

    if not manufacturing_date:
        manufacturing_date = find_after_label(
            text,
            [
                "mfg",
                "mfd",
                "mfg date",
                "pkg date",
                "package date",
                "manufacturing date",
            ],
        )

        if manufacturing_date:
            match = re.search(
                r"\b([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})\b",
                manufacturing_date,
            )
            manufacturing_date = (
                match.group(1) if match else None
            )

    expiry_date = find_inline(
        text,
        [
            r"(?:exp|expiry|use\s*by|best\s*before)\s*(?:date)?"
            r"\s*[:;\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})",
            r"(?:exp|expiry|use\s*by|best\s*before)\s*(?:date)?"
            r"\s*[:;\-]?\s*"
            r"([0-9]{1,2}[\/\-][0-9]{2,4})",
        ],
    )

    if not expiry_date:
        expiry_date = find_after_label(
            text,
            [
                "use by date",
                "use by",
                "expiry date",
                "expiry",
                "best before",
            ],
        )

        if expiry_date:
            match = re.search(
                r"\b([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})\b",
                expiry_date,
            )
            expiry_date = (
                match.group(1) if match else None
            )

    mrp = find_inline(
        text,
        [
            r"(?:mrp|mirp|m\.r\.p\.?|maximum\s*retail\s*price)"
            r"\s*[:;\-]?\s*"
            r"(?:₹|rs\.?|inr)?\s*"
            r"([0-9]+(?:\.[0-9]{1,2})?)",
        ],
    )

    if not mrp:
        mrp = find_after_label(
            text,
            [
                "mrp",
                "m.r.p",
                "mirp",
                "maximum retail price",
            ],
        )

        if mrp:
            match = re.search(
                r"(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)",
                mrp,
                re.IGNORECASE,
            )
            mrp = match.group(1) if match else None

    quantity = find_inline(
        text,
        [
            r"(?:net\s*(?:qty|quantity|weight|wt))"
            r"\s*[:;\-]?\s*"
            r"([0-9]+(?:\.[0-9]+)?)\s*"
            r"(g|kg|ml|l|pcs|pieces)\b",
        ],
    )

    if not quantity:
        quantity = find_after_label(
            text,
            [
                "net qty",
                "net quantity",
                "net weight",
                "net wt",
            ],
        )

        if quantity:
            match = re.search(
                r"([0-9]+(?:\.[0-9]+)?)\s*"
                r"(g|kg|ml|l|pcs|pieces)\b",
                quantity,
                re.IGNORECASE,
            )
            quantity = (
                f"{match.group(1)} {match.group(2)}"
                if match
                else None
            )

    manufacturer = find_inline(
        text,
        [
            r"(?:manufactured\s*(?:and\s*)?marketed\s*by)"
            r"\s*[:;\-]?\s*([^\n]+)",
            r"(?:manufactured\s*by|manufacturer|packer)"
            r"\s*[:;\-]?\s*([^\n]+)",
        ],
    )

    if not manufacturer:
        manufacturer = find_after_label(
            text,
            [
                "manufactured & marketed by",
                "manufactured and marketed by",
                "manufactured by",
                "manufacturer",
                "packer",
            ],
        )

    country_of_origin = find_inline(
        text,
        [
            r"(?:country\s*of\s*origin|made\s*in)"
            r"\s*[:;\-]?\s*([^\n]+)",
        ],
    )

    if not country_of_origin:
        country_of_origin = find_after_label(
            text,
            [
                "country of origin",
                "made in",
            ],
        )

    return {
        "product_name": clean_value(product_name),
        "batch_no": clean_value(batch_no),
        "manufacturing_date": clean_value(manufacturing_date),
        "expiry_date": clean_value(expiry_date),
        "mrp": clean_value(mrp),
        "quantity": clean_value(quantity),
        "manufacturer": clean_value(manufacturer),
        "country_of_origin": clean_value(country_of_origin),
    }


def validate(fields: dict) -> tuple[str, int, list[dict]]:
    required = [
        "batch_no",
        "expiry_date",
        "mrp",
        "quantity",
        "manufacturer",
    ]

    issues = []

    for name in required:
        if not fields.get(name):
            issues.append(
                {
                    "field": name.replace("_", " ").title(),
                    "message": f"Missing {name.replace('_', ' ')}",
                    "severity": "high",
                }
            )

    expiry = fields.get("expiry_date")

    if expiry:
        raw = expiry.replace("-", "/")

        for fmt in (
            "%d/%m/%Y",
            "%d/%m/%y",
            "%m/%Y",
            "%m/%y",
        ):
            try:
                expiry_value = datetime.strptime(
                    raw,
                    fmt,
                ).date()

                if expiry_value < datetime.now().date():
                    issues.append(
                        {
                            "field": "Expiry",
                            "message": "Product expiry date has passed",
                            "severity": "high",
                        }
                    )

                break

            except ValueError:
                continue

    issue_count = len(issues)

    score = max(
        0,
        100 - issue_count * 15,
    )

    if score >= 75:
        status = "PASS"
    elif score >= 50:
        status = "WARNING"
    else:
        status = "FAIL"

    return status, score, issues
