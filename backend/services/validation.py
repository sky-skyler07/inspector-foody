from datetime import date, datetime
from typing import Optional
import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from dotenv import load_dotenv
load_dotenv()


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# =========================================================
# STRUCTURED OUTPUT SCHEMA
# =========================================================

class ProductFields(BaseModel):
    """
    Information extracted from packaged commodity OCR.
    """

    batch_no: Optional[str] = Field(
        default=None,
        description=(
            "Batch number or lot number printed on the package. "
            "Do not confuse it with manufacturing date, barcode, "
            "license number, phone number, or registration number."
        ),
    )

    manufacturing_date: Optional[str] = Field(
        default=None,
        description=(
            "Manufacturing/MFD/MFG/PKD date exactly as printed. "
            "Preserve the printed precision such as DD/MM/YYYY "
            "or MM/YY. Never invent a day or year."
        ),
    )

    expiry_date: Optional[str] = Field(
        default=None,
        description=(
            "Expiry/use-by/best-before date exactly as printed. "
            "If the package says a shelf life such as "
            "'24 months from MFG', derive the expiry only when "
            "the manufacturing date is available and the relation "
            "is unambiguous."
        ),
    )

    mrp: Optional[str] = Field(
        default=None,
        description=(
            "Maximum Retail Price printed on the package. "
            "Do not confuse MRP with price per gram, price per ml, "
            "USP, sale price, or other unit pricing."
        ),
    )

    quantity: Optional[str] = Field(
        default=None,
        description=(
            "Net quantity, net weight, or net volume. "
            "Examples: 15 g, 500 g, 5 ml, 1 L."
        ),
    )

    manufacturer: Optional[str] = Field(
        default=None,
        description=(
            "Manufacturer/company responsible for manufacturing "
            "the product. Ignore manufacturing-unit addresses, "
            "license numbers, phone numbers, and registration numbers."
        ),
    )

    country_of_origin: Optional[str] = Field(
        default=None,
        description=(
            "Country of origin, usually from text such as "
            "'Made in India'. Return only the country."
        ),
    )


# =========================================================
# GEMINI EXTRACTION PROMPT
# =========================================================

EXTRACTION_PROMPT = """
Extract packaged-commodity label information from the OCR text.

Return these fields:
- batch_no
- manufacturing_date
- expiry_date
- mrp
- quantity
- manufacturer
- country_of_origin

RULES:
1. Batch/Lot labels identify the batch number.
2. MFG,MFD,PKG=D,Packed on,or Manufacturing Date identify the manufacturing/packing date.
3. Extract explicit expiry/use-by dates.
4. Uderstand shelf-life statements such as:
        "BEST BEFORE 12 MONTHS FROM PACKAGING" or "ExPIRY DATE: 24 MONTHS FROM THE DATE OF MFG".
        calculate the expiry date when the reference date is available.
5. Preserve the printed date precision. For example, "10/25 stays "10/25".
6. Extractt MRP only. DO not confuse MRP with USp or price-per-unit such rupess 2.33/g.
7. Extract Net Quantity/Net Weight such as "200 g" or "1 kg". Never treat a price-per-unit as quantity.
8. For manufacturer, prefer the company name, not its address.
9. Extract country of origin only when explicitly present.
10. Correct obvious OCR errors when the intended value is clear.
11. Return null when a field cannot reliably be determined. Never invent information.

Important:
- Use the surrounding label context, not isolated numbers.
- Product name is NOT extracted from OCR; it is supplied separately by the user.
"""


# =========================================================
# GEMINI EXTRACTION
# =========================================================

def extract_fields(
    raw_ocr: str,
    product_name: str | None = None,
) -> dict:
    """
    Extract product information from OCR using Gemini.

    Product name is supplied by the user and is NOT extracted
    from OCR.
    """

    if not raw_ocr or not raw_ocr.strip():
        return {
            "product_name": product_name,
            "batch_no": None,
            "manufacturing_date": None,
            "expiry_date": None,
            "mrp": None,
            "quantity": None,
            "manufacturer": None,
            "country_of_origin": None,
        }

    prompt = f"""
{EXTRACTION_PROMPT}

RAW OCR TEXT:
----------------
{raw_ocr}
----------------

Extract the structured product information now.
"""

    try:

        response = client.interactions.create(model="gemini-3.8-flash",input=prompt,response_format={"type": "text","mime_type": "application/json","schema": ProductFields.model_json_schema()})

        if response.output_text is None:
            return {
                "product_name": product_name,
                "batch_no": None,
                "manufacturing_date": None,
                "expiry_date": None,
                "mrp": None,
                "quantity": None,
                "manufacturer": None,
                "country_of_origin": None,
            }
        
        result = ProductFields.model_validate_json(response.output_text)

        fields = result.model_dump()

        # Product name ALWAYS comes from user.
        fields["product_name"] = product_name

        return fields
    except Exception as exc:
        print(f"[Gemini Extraction Error] {type(exc).__name__}: {exc}")
        raise


# =========================================================
# DATE PARSER FOR VALIDATION ONLY
# =========================================================

def _parse_date(
    value: str | None,
) -> Optional[date]:

    if not value:
        return None

    value = value.strip()

    formats = [
        "%d/%m/%Y",
        "%d/%m/%y",
        "%d-%m-%Y",
        "%d-%m-%y",
        "%d.%m.%Y",
        "%d.%m.%y",
        "%m/%Y",
        "%m/%y",
        "%m-%Y",
        "%m-%y",
        "%m.%Y",
        "%m.%y",
    ]

    for fmt in formats:

        try:
            return datetime.strptime(
                value,
                fmt,
            ).date()

        except ValueError:
            continue

    return None


# =========================================================
# VALIDATION
# =========================================================

def validate(
    fields: dict,
) -> tuple[str, int, list[str]]:

    issues = []

    # -----------------------------------------------------
    # Required fields
    # -----------------------------------------------------

    required_fields = [
        "batch_no",
        "expiry_date",
        "mrp",
        "quantity",
    ]

    for field in required_fields:

        if not fields.get(field):

            issues.append(
                f"Missing {field.replace('_', ' ')}"
            )

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

    manufacturing_date = _parse_date(
        fields.get("manufacturing_date")
    )

    if (
        fields.get("manufacturing_date")
        and manufacturing_date is None
    ):

        issues.append(
            "Manufacturing date format "
            "could not be verified"
        )

    # -----------------------------------------------------
    # Expiry date
    # -----------------------------------------------------

    expiry_date = _parse_date(
        fields.get("expiry_date")
    )

    if (
        fields.get("expiry_date")
        and expiry_date is None
    ):

        issues.append(
            "Expiry date format "
            "could not be verified"
        )

    # -----------------------------------------------------
    # MFG < EXP
    # -----------------------------------------------------

    if (
        manufacturing_date
        and expiry_date
    ):

        if expiry_date <= manufacturing_date:

            issues.append(
                "Expiry date must be after "
                "manufacturing date"
            )

    # -----------------------------------------------------
    # Expired product
    # -----------------------------------------------------

    if expiry_date:

        # For MM/YY we parse as first day of month.
        # This is only used for a conservative validation
        # check.
        if expiry_date < date.today():

            issues.append(
                "Product expiry date has passed"
            )

    # -----------------------------------------------------
    # MRP
    # -----------------------------------------------------

    if fields.get("mrp"):

        try:

            mrp_value = float(
                str(fields["mrp"])
                .replace("₹", "")
                .replace("Rs.", "")
                .replace("Rs", "")
                .strip()
            )

            if mrp_value <= 0:

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

        quantity = str(
            fields["quantity"]
        ).strip()

        if not any(
            unit in quantity.lower()
            for unit in [
                "g",
                "kg",
                "mg",
                "ml",
                "l",
                "pcs",
                "piece",
            ]
        ):

            issues.append(
                "Quantity format "
                "could not be verified"
            )

    # -----------------------------------------------------
    # Score
    # -----------------------------------------------------

    score = max(
        0,
        100 - (len(issues) * 15),
    )

    if score >= 75:
        status = "PASS"

    elif score >= 50:
        status = "WARNING"

    else:
        status = "FAIL"

    return status, score, issues