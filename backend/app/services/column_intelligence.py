from typing import Any
import numpy as np
import pandas as pd
import re


# ==========================================================
# Universal Column Semantic Intelligence
# ==========================================================

IDENTIFIER_PATTERNS = [
    r"^id$",
    r"^index$",
    r"^idx$",
    r".*_id$",
    r"^id_.*",
    r"^ean.*",
    r"^sku.*",
    r"^barcode.*",
    r"^upc.*",
    r"^isbn.*",
    r"^uuid.*",
    r"^guid.*",
    r"^internal.*id.*",
    r"^product.*id.*",
    r"^customer.*id.*",
    r"^user.*id.*",
    r"^order.*id.*",
    r"^transaction.*id.*",
    r"^item.*id.*",
    r"^student.*id.*",
    r"^employee.*id.*",
    r"^ssn$",
    r"^tax.*id$",
    r"^phone.*",
    r"^zip.*",
    r"^postal.*",
]

PRICE_PATTERNS = [
    r".*price.*",
    r".*cost.*",
    r".*fee.*",
    r".*rate.*",
    r".*amount.*",
    r".*revenue.*",
    r".*sales.*",
    r".*profit.*",
    r".*salary.*",
    r".*wage.*",
    r".*compensation.*",
    r".*expense.*",
    r".*budget.*",
    r".*income.*",
    r".*balance.*",
    r".*mrp.*",
    r".*discount.*",
]

QUANTITY_PATTERNS = [
    r".*stock.*",
    r".*quantity.*",
    r"^qty.*",
    r".*_qty$",
    r".*units.*",
    r".*inventory.*",
    r".*volume.*",
    r".*count.*",
    r".*items.*",
    r".*capacity.*",
]

SCORE_PATTERNS = [
    r".*mark.*",
    r".*score.*",
    r".*grade.*",
    r".*gpa.*",
    r".*points.*",
    r".*rating.*",
    r".*attendance.*",
]

STATUS_PATTERNS = [
    r".*status.*",
    r".*state.*",
    r".*availability.*",
    r".*condition.*",
    r".*stage.*",
    r".*tier.*",
    r".*phase.*",
]

LOCATION_PATTERNS = [
    r".*city.*",
    r".*state.*",
    r".*country.*",
    r".*region.*",
    r".*area.*",
    r".*zone.*",
    r".*address.*",
    r".*location.*",
    r".*territory.*",
]


def matches_patterns(text: str, patterns: list[str]) -> bool:
    norm = text.lower().strip()
    return any(re.match(p, norm) for p in patterns)


def is_sequential_integers(series: pd.Series) -> bool:
    """Check if series consists of strictly sequential integers (e.g. 1, 2, 3, ...)."""
    try:
        s_clean = pd.to_numeric(series.dropna(), errors="coerce").dropna()
        if len(s_clean) < 10:
            return False
        # Check diff == 1
        diffs = s_clean.diff().dropna()
        return bool((diffs == 1).all() or (diffs == 1).mean() > 0.98)
    except Exception:
        return False


def detect_column_intelligence(df: pd.DataFrame, col_name: str) -> dict[str, Any]:
    series = df[col_name]
    total_rows = len(df)
    missing_count = int(series.isnull().sum())
    missing_pct = round((missing_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

    non_null_series = series.dropna()
    unique_count = int(series.nunique())
    unique_ratio = round((unique_count / total_rows), 4) if total_rows > 0 else 0.0

    raw_dtype = str(series.dtype)
    col_norm = col_name.lower().strip()

    # Default sample values (clean strings)
    sample_values = [str(x) for x in non_null_series.head(5).tolist()]

    # ---------------------------------------------------------
    # 1. Constant Column Check (Single Unique Value)
    # ---------------------------------------------------------
    if unique_count <= 1:
        return {
            "name": col_name,
            "dtype": raw_dtype,
            "semantic_type": "CURRENCY" if matches_patterns(col_norm, [r"^currency.*", r"^curr$"]) else "CATEGORICAL",
            "role": "metadata",
            "unique_count": unique_count,
            "unique_ratio": unique_ratio,
            "missing_count": missing_count,
            "missing_pct": missing_pct,
            "is_constant": True,
            "is_identifier": False,
            "is_metric": False,
            "is_dimension": False,
            "is_date": False,
            "sample_values": sample_values,
            "constant_value": sample_values[0] if sample_values else None,
        }

    # ---------------------------------------------------------
    # 2. Date / Datetime Detection
    # ---------------------------------------------------------
    is_date = False
    if pd.api.types.is_datetime64_any_dtype(series):
        is_date = True
    elif pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
        date_keywords = ["date", "time", "timestamp", "created_at", "updated_at", "order_date", "dob", "joined"]
        has_date_name = any(k in col_norm for k in date_keywords)
        # Only try date parsing if column name or values strongly indicate a date to avoid slowdowns & warnings
        if has_date_name or "year" in col_norm or "month" in col_norm or "day" in col_norm:
            sample_check = non_null_series.head(50)
            if len(sample_check) > 0:
                try:
                    parsed = pd.to_datetime(sample_check, errors="coerce", format="mixed")
                    valid_ratio = parsed.notna().mean()
                    if valid_ratio >= 0.6:
                        is_date = True
                except Exception:
                    is_date = False

    if is_date:
        return {
            "name": col_name,
            "dtype": raw_dtype,
            "semantic_type": "DATETIME" if "time" in col_norm else "DATE",
            "role": "temporal",
            "unique_count": unique_count,
            "unique_ratio": unique_ratio,
            "missing_count": missing_count,
            "missing_pct": missing_pct,
            "is_constant": False,
            "is_identifier": False,
            "is_metric": False,
            "is_dimension": False,
            "is_date": True,
            "sample_values": sample_values,
        }

    # ---------------------------------------------------------
    # 3. Identifier Detection (Critical)
    # ---------------------------------------------------------
    name_looks_like_id = matches_patterns(col_norm, IDENTIFIER_PATTERNS)
    is_numeric_type = bool(pd.api.types.is_numeric_dtype(series))
    is_seq_int = is_numeric_type and is_sequential_integers(series)
    is_high_cardinality = unique_ratio >= 0.90 and total_rows >= 30

    is_identifier = False
    if name_looks_like_id:
        # If name is Index/EAN/ID/Barcode/Internal ID, it's definitely an ID
        is_identifier = True
    elif is_seq_int:
        # Sequential index (1,2,3...N)
        is_identifier = True
    elif is_high_cardinality and (pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)):
        # Check if values look like barcodes, alphanumeric hashes, or keys
        avg_len = non_null_series.astype(str).str.len().mean()
        has_spaces = non_null_series.astype(str).str.contains(" ").mean()
        if avg_len >= 8 and has_spaces < 0.1:
            is_identifier = True

    if is_identifier:
        return {
            "name": col_name,
            "dtype": raw_dtype,
            "semantic_type": "IDENTIFIER",
            "role": "identifier",
            "unique_count": unique_count,
            "unique_ratio": unique_ratio,
            "missing_count": missing_count,
            "missing_pct": missing_pct,
            "is_constant": False,
            "is_identifier": True,
            "is_metric": False,
            "is_dimension": False,
            "is_date": False,
            "sample_values": sample_values,
        }

    # ---------------------------------------------------------
    # 4. Numeric Measures (Metrics)
    # ---------------------------------------------------------
    if is_numeric_type:
        num_s = pd.to_numeric(non_null_series, errors="coerce").dropna()
        count_val = int(len(num_s))
        sum_val = float(num_s.sum()) if count_val > 0 else 0.0
        mean_val = float(num_s.mean()) if count_val > 0 else 0.0
        median_val = float(num_s.median()) if count_val > 0 else 0.0
        min_val = float(num_s.min()) if count_val > 0 else 0.0
        max_val = float(num_s.max()) if count_val > 0 else 0.0
        std_val = float(num_s.std()) if count_val > 1 else 0.0
        var_val = float(num_s.var()) if count_val > 1 else 0.0
        q25_val = float(num_s.quantile(0.25)) if count_val > 0 else 0.0
        q75_val = float(num_s.quantile(0.75)) if count_val > 0 else 0.0

        # Sub-classify semantic numeric type
        if matches_patterns(col_norm, PRICE_PATTERNS):
            sem_type = "PRICE"
        elif matches_patterns(col_norm, QUANTITY_PATTERNS):
            sem_type = "QUANTITY"
        elif matches_patterns(col_norm, SCORE_PATTERNS):
            sem_type = "SCORE"
        elif "percent" in col_norm or "pct" in col_norm or "margin" in col_norm:
            sem_type = "PERCENTAGE"
        elif "year" in col_norm or "age" in col_norm or "experience" in col_norm or "duration" in col_norm:
            sem_type = "DURATION"
        else:
            sem_type = "NUMERIC"

        return {
            "name": col_name,
            "dtype": raw_dtype,
            "semantic_type": sem_type,
            "role": "metric",
            "unique_count": unique_count,
            "unique_ratio": unique_ratio,
            "missing_count": missing_count,
            "missing_pct": missing_pct,
            "is_constant": False,
            "is_identifier": False,
            "is_metric": True,
            "is_dimension": False,
            "is_date": False,
            "sample_values": sample_values,
            "stats": {
                "count": count_val,
                "sum": round(sum_val, 2),
                "mean": round(mean_val, 2),
                "median": round(median_val, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "std_dev": round(std_val, 2) if not np.isnan(std_val) else 0.0,
                "variance": round(var_val, 2) if not np.isnan(var_val) else 0.0,
                "q25": round(q25_val, 2),
                "q75": round(q75_val, 2),
            },
        }

    # ---------------------------------------------------------
    # 5. Categorical & Text Dimensions
    # ---------------------------------------------------------
    is_bool = bool(pd.api.types.is_bool_dtype(series) or unique_count == 2)
    if is_bool:
        sem_type = "BOOLEAN"
    elif matches_patterns(col_norm, STATUS_PATTERNS):
        sem_type = "STATUS"
    elif matches_patterns(col_norm, LOCATION_PATTERNS):
        sem_type = "LOCATION"
    elif matches_patterns(col_norm, [r".*email.*"]):
        sem_type = "EMAIL"
    elif matches_patterns(col_norm, [r".*url.*", r".*link.*", r".*website.*"]):
        sem_type = "URL"
    else:
        # Check text length for freeform description/text vs categorical
        avg_str_len = non_null_series.astype(str).str.len().mean() if len(non_null_series) > 0 else 0
        if avg_str_len > 40 or unique_count > 5000:
            sem_type = "TEXT"
        else:
            sem_type = "CATEGORICAL"

    is_dim = sem_type in ["CATEGORICAL", "STATUS", "LOCATION", "BOOLEAN"]
    is_text = sem_type == "TEXT"

    return {
        "name": col_name,
        "dtype": raw_dtype,
        "semantic_type": sem_type,
        "role": "text" if is_text else "dimension",
        "unique_count": unique_count,
        "unique_ratio": unique_ratio,
        "missing_count": missing_count,
        "missing_pct": missing_pct,
        "is_constant": False,
        "is_identifier": False,
        "is_metric": False,
        "is_dimension": is_dim,
        "is_date": False,
        "sample_values": sample_values,
    }


def analyze_all_columns(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Analyze semantic intelligence for every column in DataFrame."""
    return [detect_column_intelligence(df, col) for col in df.columns]
