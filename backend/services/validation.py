from calendar import monthrange
from datetime import date, datetime, timedelta
import re


# =========================================================
# DATE PATTERNS
# =========================================================

DATE_RE = (
    r"\b\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{2,4}\b"
    r"|"
    r"\b\d{1,2}\s*[./-]\s*\d{2,4}\b"
)


# =========================================================
# TEXT CLEANING
# =========================================================

def _clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\r", "\n")

    text = (
        text.replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u00a0", " ")
        .replace("|", " ")
    )

    # Add spaces around common OCR punctuation where useful
    text = re.sub(r"[ \t]+", " ", text)

    # Do not destroy line information
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def _lines(text: str) -> list[str]:
    return [
        line.strip(" :-\t")
        for line in text.splitlines()
        if line.strip()
    ]


# =========================================================
# OCR NORMALIZATION
# =========================================================

def _normalise_ocr(text: str) -> str:
    """
    Normalize common OCR mistakes without aggressively
    changing actual product data.
    """

    replacements = {
        "M.R.P": "MRP",
        "M R P": "MRP",
        "MIRP": "MRP",
        "MRPR": "MRP",

        "NET WT": "NET WEIGHT",
        "NETWT": "NET WEIGHT",
        "NETW T": "NET WEIGHT",
        "NETWEIGHT": "NET WEIGHT",

        "USEBY": "USE BY",
        "BESTBEFORE": "BEST BEFORE",

        "EXPIRY": "EXPIRY",
        "EXP.": "EXP",

        "MFD.": "MFD",
        "MFG.": "MFG",

        "PACKED ON": "PKD",
        "PACKING DATE": "PKD",
    }

    for old, new in replacements.items():
        text = re.sub(
            re.escape(old),
            new,
            text,
            flags=re.IGNORECASE,
        )

    return text


# =========================================================
# GENERIC SEARCH
# =========================================================

def _search(
    patterns: list[str],
    text: str,
    flags=re.IGNORECASE | re.MULTILINE,
) -> str | None:

    for pattern in patterns:
        match = re.search(pattern, text, flags)

        if not match:
            continue

        value = (
            match.group(1)
            if match.groups()
            else match.group(0)
        )

        value = value.strip(" :.-")

        if value:
            return re.sub(
                r"\s+",
                " ",
                value,
            )

    return None


# =========================================================
# DATE HELPERS
# =========================================================

def _normalise_date(raw: str) -> str:
    raw = re.sub(r"\s+", "", raw)

    return (
        raw.replace(".", "/")
        .replace("-", "/")
    )


def _date_candidates(value: str) -> list[str]:
    if not value:
        return []

    # Only correct obvious OCR mistakes.
    value = (
        value.replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("|", "/")
    )

    return [
        _normalise_date(match.group(0))
        for match in re.finditer(
            DATE_RE,
            value,
        )
    ]


def _parse_date(raw: str) -> date | None:
    """
    Supports:

        DD/MM/YYYY
        DD/MM/YY
        MM/YYYY
        MM/YY
    """

    if not raw:
        return None

    raw = re.sub(
        r"[.\-]",
        "/",
        raw.replace(" ", ""),
    )

    parts = raw.split("/")

    # MM/YYYY or MM/YY
    if len(parts) == 2:
        raw = f"01/{raw}"

    for fmt in (
        "%d/%m/%Y",
        "%d/%m/%y",
    ):
        try:
            return datetime.strptime(
                raw,
                fmt,
            ).date()
        except ValueError:
            continue

    return None


# =========================================================
# FUSED DATES
# =========================================================

def _extract_fused_dates(
    text: str,
) -> tuple[str | None, str | None]:

    pattern = (
        r"(\d{2}[./-]\d{2}[./-]\d{2,4})"
        r"(\d{2}[./-]\d{2}[./-]\d{2,4})"
    )

    match = re.search(
        pattern,
        text,
    )

    if match:
        first = _normalise_date(
            match.group(1)
        )

        second = _normalise_date(
            match.group(2)
        )

        first_date = _parse_date(first)
        second_date = _parse_date(second)

        if (
            first_date
            and second_date
            and second_date > first_date
        ):
            return first, second

    return None, None


# =========================================================
# LABELED DATE
# =========================================================

def _label_date(
    text: str,
    labels: str,
) -> str | None:

    # First try same-line extraction.
    pattern = (
        rf"(?:{labels})"
        rf"[^\n]{{0,60}}?"
        rf"({DATE_RE})"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if match:
        candidates = _date_candidates(
            match.group(1)
        )

        for candidate in candidates:
            if _parse_date(candidate):
                return candidate

    # Then inspect nearby OCR lines.
    lines = _lines(text)

    for i, line in enumerate(lines):

        if not re.search(
            rf"(?:{labels})",
            line,
            re.IGNORECASE,
        ):
            continue

        window = " ".join(
            lines[i:i + 3]
        )

        candidates = _date_candidates(
            window
        )

        for candidate in candidates:
            if _parse_date(candidate):
                return candidate

    return None


# =========================================================
# SHELF LIFE
# =========================================================

def _word_to_int(
    word: str,
) -> int | None:

    words = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
        "twenty four": 24,
    }

    return words.get(
        word.lower().strip()
    )


def _add_months(
    original: date,
    months: int,
) -> date:

    month_index = (
        original.year * 12
        + original.month
        - 1
        + months
    )

    year = month_index // 12
    month = month_index % 12 + 1

    day = min(
        original.day,
        monthrange(year, month)[1],
    )

    return date(
        year,
        month,
        day,
    )


def _derive_expiry_from_shelf_life(
    text: str,
    manufacturing_date: str | None,
) -> str | None:

    if not manufacturing_date:
        return None

    number_pattern = (
        r"(?:"
        r"\d+|"
        r"ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|"
        r"EIGHT|NINE|TEN|ELEVEN|TWELVE|"
        r"THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|"
        r"SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY|"
        r"TWENTY\s+FOUR"
        r")"
    )

    unit_pattern = r"(MONTHS?|DAYS?|YEARS?)"

    label_pattern = (
        r"(?:"
        r"BEST\s*BEFORE"
        r"|USE\s*BEFORE"
        r"|USE\s*BY"
        r"|EXPIRY\s*DATE"
        r"|EXP"
        r")"
    )

    base_pattern = (
        r"(?:"
        r"PACK(?:ING|AGING)"
        r"|MFD"
        r"|MFG"
        r"|MANUFACTURE"
        r"|MANUFACTURING"
        r")"
    )

    pattern = (
        label_pattern
        + r"[^\n]{0,40}?"
        + number_pattern
        + r"\s*"
        + unit_pattern
        + r"\s*FROM\s*"
        + r"(?:THE\s*)?"
        + r"(?:DATE\s*OF\s*)?"
        + base_pattern
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if not match:
        return None

    raw_amount = match.group(1)

    amount = (
        int(raw_amount)
        if raw_amount.isdigit()
        else _word_to_int(raw_amount)
    )

    if not amount:
        return None

    unit = match.group(2).lower()

    base_date = _parse_date(
        manufacturing_date
    )

    if not base_date:
        return None

    if unit.startswith("month"):
        expiry = _add_months(
            base_date,
            amount,
        )

    elif unit.startswith("year"):
        expiry = _add_months(
            base_date,
            amount * 12,
        )

    else:
        expiry = (
            base_date
            + timedelta(days=amount)
        )

    return expiry.strftime(
        "%d/%m/%Y"
    )


# =========================================================
# PRODUCT NAME
# =========================================================

def _clean_product_name(
    product_name: str | None,
) -> str | None:

    if not product_name:
        return None

    product_name = product_name.strip()

    if len(product_name) < 2:
        return None

    return product_name


# =========================================================
# BATCH NUMBER
# =========================================================

def _extract_batch_number(
    text: str,
) -> str | None:

    # Explicit batch / lot labels have highest priority.
    batch = _search(
        [
            r"(?:BATCH\s*(?:NO\.?|NUMBER|#)?)"
            r"\s*[:\-#]?\s*"
            r"([A-Z0-9][A-Z0-9./\-]{1,30})",

            r"(?:LOT\s*(?:NO\.?|NUMBER|#)?)"
            r"\s*[:\-#]?\s*"
            r"([A-Z0-9][A-Z0-9./\-]{1,30})",
        ],
        text,
    )

    if batch:
        if batch.upper() not in {
            "NO",
            "NUMBER",
        }:
            return batch

    # Patterns like:
    #
    # #10/25 B016
    #
    # Do NOT treat 10/25 as the batch.
    # Prefer the alphanumeric token after the date.
    match = re.search(
        r"#\s*\d{1,2}[./-]\d{2,4}"
        r"\s*([A-Z][A-Z0-9]{2,15})\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return match.group(1)

    return None


# =========================================================
# MRP
# =========================================================

def _extract_mrp(
    text: str,
) -> str | None:

    # -----------------------------------------------------
    # 1. Explicit MRP
    # -----------------------------------------------------

    mrp = _search(
        [
            r"(?:MRP|M\.?\s*R\.?\s*P\.?)"
            r"\s*[:\-]?\s*"
            r"(?:₹|RS\.?|INR)?"
            r"\s*"
            r"([0-9]+(?:\.[0-9]{1,2})?)"
        ],
        text,
    )

    if mrp:
        return mrp

    # -----------------------------------------------------
    # 2. Currency amount
    # -----------------------------------------------------

    matches = re.finditer(
        r"(?:₹|RS\.?|INR)"
        r"\s*"
        r"([0-9]+(?:\.[0-9]{1,2})?)",
        text,
        re.IGNORECASE,
    )

    for match in matches:

        value = match.group(1)

        # Ignore price-per-unit values such as:
        # ₹2.33/g
        after = text[
            match.end():
            match.end() + 5
        ]

        if re.match(
            r"\s*/\s*(?:g|kg|ml|l)",
            after,
            re.IGNORECASE,
        ):
            continue

        return value

    return None


# =========================================================
# NET QUANTITY
# =========================================================

def _extract_quantity(
    text: str,
) -> str | None:

    # -----------------------------------------------------
    # 1. Explicit NET WEIGHT / NET VOLUME
    # -----------------------------------------------------

    quantity = _search(
        [
            r"(?:NET\s*(?:WEIGHT|WT|QUANTITY|VOLUME))"
            r"\s*[:\-]?\s*"
            r"([0-9]+(?:\.[0-9]+)?)"
            r"\s*"
            r"(g|kg|mg|ml|l|pcs|pieces)\b"
        ],
        text,
    )

    if quantity:
        return quantity

    # -----------------------------------------------------
    # 2. Handle OCR line separation
    #
    # Net Wt.
    # 15g
    # -----------------------------------------------------

    lines = _lines(text)

    for i, line in enumerate(lines):

        if re.search(
            r"\bNET\s*(?:WEIGHT|WT|QUANTITY|VOLUME)\b",
            line,
            re.IGNORECASE,
        ):
            window = " ".join(
                lines[i:i + 3]
            )

            match = re.search(
                r"([0-9]+(?:\.[0-9]+)?)"
                r"\s*"
                r"(g|kg|mg|ml|l|pcs|pieces)\b",
                window,
                re.IGNORECASE,
            )

            if match:
                return (
                    f"{match.group(1)} "
                    f"{match.group(2)}"
                )

    # -----------------------------------------------------
    # 3. Generic quantity fallback
    #
    # IMPORTANT:
    # Don't use numbers immediately followed by
    # /g, /kg, /ml etc.
    # This prevents:
    #
    # ₹2.337/g -> 337g
    # -----------------------------------------------------

    generic_matches = re.finditer(
        r"\b([0-9]+(?:\.[0-9]+)?)"
        r"\s*"
        r"(g|kg|mg|ml|l|pcs|pieces)\b",
        text,
        re.IGNORECASE,
    )

    for match in generic_matches:

        start = max(
            0,
            match.start() - 5,
        )

        context = text[start:match.start()]

        # Ignore numbers extracted from price-per-unit.
        if re.search(
            r"/\s*$",
            context,
        ):
            continue

        return (
            f"{match.group(1)} "
            f"{match.group(2)}"
        )

    return None


# =========================================================
# MANUFACTURER
# =========================================================

def _extract_manufacturer(
    text: str,
) -> str | None:

    # Explicit "Manufactured by"
    manufacturer = _search(
        [
            r"(?:MANUFACTURED\s*BY)"
            r"\s*[:\-]?\s*"
            r"([^\n]{3,120})",

            r"(?:MFG\.?\s*BY)"
            r"\s*[:\-]?\s*"
            r"([^\n]{3,120})",

            r"(?:MFD\.?\s*BY)"
            r"\s*[:\-]?\s*"
            r"([^\n]{3,120})",
        ],
        text,
    )

    if manufacturer:
        return manufacturer

    # -----------------------------------------------------
    # Handle OCR where "BY" and company name are split
    #
    # FACEWASH. MADE IN INDIA. MKTD
    # BY LIC. USER HINDUSTAN UNILEVER
    # LIMITED (HUL).
    # -----------------------------------------------------

    match = re.search(
        r"\bBY\s+"
        r"(?:LIC\.?\s*USER\s*)?"
        r"([A-Z][A-Z\s&.,()]{5,120}?"
        r"(?:LIMITED|LTD\.?|PVT\.?\s*LTD\.?|"
        r"PRIVATE\s+LIMITED|HUL))",
        text,
        re.IGNORECASE,
    )

    if match:
        manufacturer = match.group(1)

        manufacturer = re.sub(
            r"\s+",
            " ",
            manufacturer,
        ).strip(" .,")

        return manufacturer

    # -----------------------------------------------------
    # Fallback for explicit manufacturer keyword
    # -----------------------------------------------------

    manufacturer = _search(
        [
            r"(?:MANUFACTURER)"
            r"\s*[:\-]?\s*"
            r"([^\n]{3,120})"
        ],
        text,
    )

    return manufacturer


# =========================================================
# COUNTRY
# =========================================================

def _extract_country(
    text: str,
) -> str | None:

    match = re.search(
        r"(?:MADE\s*IN|COUNTRY\s*OF\s*ORIGIN)"
        r"\s*[:\-]?\s*"
        r"([A-Z][A-Z\s]{1,30})",
        text,
        re.IGNORECASE,
    )

    if not match:
        return None

    country = match.group(1)

    # Stop at common OCR sentence boundaries.
    country = re.split(
        r"\b(?:MKTD|MKT|MARKETED|BY)\b",
        country,
        flags=re.IGNORECASE,
    )[0]

    return country.strip(
        " .,:;-"
    )


# =========================================================
# MAIN EXTRACTION
# =========================================================

def extract_fields(
    text: str,
    product_name: str | None = None,
) -> dict:
    """
    Extract product information from OCR.

    Product name is intentionally supplied by the user.
    OCR is NOT used to guess the product name.
    """

    text = _normalise_ocr(
        _clean_text(text)
    )

    # -----------------------------------------------------
    # Product name
    # -----------------------------------------------------

    product_name = _clean_product_name(
        product_name
    )

    # -----------------------------------------------------
    # Batch
    # -----------------------------------------------------

    batch_no = _extract_batch_number(
        text
    )

    # -----------------------------------------------------
    # Dates
    # -----------------------------------------------------

    mfg_fused, exp_fused = (
        _extract_fused_dates(text)
    )

    if mfg_fused and exp_fused:

        manufacturing_date = mfg_fused
        expiry_date = exp_fused

    else:

        manufacturing_date = _label_date(
            text,
            r"MFG|MFD|PKD|PACKED|"
            r"PACKING|MANUFACTURED|"
            r"MANUFACTURING",
        )

        expiry_date = _label_date(
            text,
            r"EXP|EXPIRY|USE\s*BY|"
            r"USE\s*BEFORE|BEST\s*BEFORE|"
            r"VALID\s*UP\s*TO",
        )

    # -----------------------------------------------------
    # Special case:
    #
    # OCR:
    # #10/25 B016
    #
    # If no explicit MFG label exists, use the date
    # immediately before a batch-like code as a
    # manufacturing-date candidate.
    #
    # This is intentionally conservative.
    # -----------------------------------------------------

    if not manufacturing_date:

        match = re.search(
            r"#\s*"
            r"(\d{1,2}[./-]\d{2,4})"
            r"\s*"
            r"[A-Z]?[A-Z0-9]{2,15}\b",
            text,
            re.IGNORECASE,
        )

        if match:
            candidate = _normalise_date(
                match.group(1)
            )

            if _parse_date(candidate):
                manufacturing_date = candidate

    # -----------------------------------------------------
    # Derive expiry from shelf life
    # -----------------------------------------------------

    if not expiry_date:

        expiry_date = (
            _derive_expiry_from_shelf_life(
                text,
                manufacturing_date,
            )
        )

    # -----------------------------------------------------
    # MRP
    # -----------------------------------------------------

    mrp = _extract_mrp(text)

    # -----------------------------------------------------
    # Quantity
    # -----------------------------------------------------

    quantity = _extract_quantity(
        text
    )

    # -----------------------------------------------------
    # Manufacturer
    # -----------------------------------------------------

    manufacturer = _extract_manufacturer(
        text
    )

    # -----------------------------------------------------
    # Country
    # -----------------------------------------------------

    country_of_origin = _extract_country(
        text
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


# =========================================================
# VALIDATION
# =========================================================

def validate(
    fields: dict,
) -> tuple[str, int, list[str]]:
    """
    Validate extracted fields.

    Product name is supplied by the user, so it is not
    considered an OCR-required field here.
    """

    required = [
        "batch_no",
        "expiry_date",
        "mrp",
        "quantity",
    ]

    issues = [
        f"Missing {name.replace('_', ' ')}"
        for name in required
        if not fields.get(name)
    ]

    # -----------------------------------------------------
    # Manufacturer
    # -----------------------------------------------------

    if not fields.get("manufacturer"):
        issues.append(
            "Missing manufacturer information"
        )

    # -----------------------------------------------------
    # Manufacturing date
    # -----------------------------------------------------

    manufacturing = None

    if fields.get("manufacturing_date"):

        manufacturing = _parse_date(
            fields["manufacturing_date"]
        )

        if not manufacturing:
            issues.append(
                "Manufacturing date format "
                "could not be verified"
            )

    # -----------------------------------------------------
    # Expiry date
    # -----------------------------------------------------

    expiry = None

    if fields.get("expiry_date"):

        expiry = _parse_date(
            fields["expiry_date"]
        )

        if expiry:

            if expiry < date.today():
                issues.append(
                    "Product expiry date has passed"
                )

        else:
            issues.append(
                "Expiry date format "
                "could not be verified"
            )

    # -----------------------------------------------------
    # Manufacturing vs Expiry
    # -----------------------------------------------------

    if manufacturing and expiry:

        if expiry <= manufacturing:
            issues.append(
                "Expiry date must be after "
                "manufacturing date"
            )

    # -----------------------------------------------------
    # MRP
    # -----------------------------------------------------

    if fields.get("mrp"):

        try:

            numeric_mrp = float(
                re.sub(
                    r"[^0-9.]",
                    "",
                    str(fields["mrp"]),
                )
            )

            if numeric_mrp <= 0:
                issues.append(
                    "MRP must be greater than zero"
                )

        except ValueError:

            issues.append(
                "MRP could not be verified"
            )

    # -----------------------------------------------------
    # Quantity
    # -----------------------------------------------------

    if fields.get("quantity"):

        match = re.search(
            r"([0-9]+(?:\.[0-9]+)?)\s*"
            r"(g|kg|mg|ml|l|pcs|pieces)\b",
            str(fields["quantity"]),
            re.IGNORECASE,
        )

        if not match:

            issues.append(
                "Quantity format "
                "could not be verified"
            )

        else:

            try:

                numeric_quantity = float(
                    match.group(1)
                )

                if numeric_quantity <= 0:
                    issues.append(
                        "Quantity must be greater "
                        "than zero"
                    )

            except ValueError:

                issues.append(
                    "Quantity could not be verified"
                )

    # -----------------------------------------------------
    # Score
    # -----------------------------------------------------

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
