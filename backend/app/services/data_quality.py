from typing import Any
import pandas as pd


def assess_data_quality(
    df: pd.DataFrame,
    columns_intel: list[dict[str, Any]],
    outliers_report: list[dict[str, Any]]
) -> dict[str, Any]:
    """
    Calculate comprehensive data quality score (0-100) and actionable diagnostic checks.
    Evaluates missing values, duplicates, empty columns, constant fields, identifier density,
    and extreme outlier anomalies.
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    if total_rows == 0 or total_cols == 0:
        return {
            "score": 0,
            "rating": "Poor",
            "badge_color": "rose",
            "checks": [],
            "summary": "Empty dataset."
        }

    # 1. Missing values
    total_cells = total_rows * total_cols
    total_missing = int(df.isnull().sum().sum())
    missing_pct = round((total_missing / total_cells) * 100, 2) if total_cells > 0 else 0.0

    # 2. Duplicate rows
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

    # 3. Empty columns (100% missing)
    empty_cols = [c["name"] for c in columns_intel if c["missing_count"] == total_rows]

    # 4. Constant columns
    constant_cols = [c["name"] for c in columns_intel if c.get("is_constant")]

    # 5. Identifier columns
    identifier_cols = [c["name"] for c in columns_intel if c.get("is_identifier")]

    # 6. High cardinality columns
    high_card_cols = [
        c["name"] for c in columns_intel
        if not c.get("is_identifier") and c.get("unique_ratio", 0) > 0.85 and total_rows > 50
    ]

    # Calculate Deductions
    score = 100.0

    # Missing penalty: up to 30 points
    missing_penalty = min(30.0, missing_pct * 1.5)
    score -= missing_penalty

    # Duplicate penalty: up to 25 points
    dup_penalty = min(25.0, duplicate_pct * 2.0)
    score -= dup_penalty

    # Empty column penalty: 10 points each (max 20)
    empty_penalty = min(20.0, len(empty_cols) * 10.0)
    score -= empty_penalty

    # Extreme outlier penalty: 2 points per heavily outliered column (max 10)
    heavy_outliers = sum(1 for o in outliers_report if o.get("outlier_percentage", 0) > 15)
    score -= min(10.0, heavy_outliers * 2.0)

    score = max(0, min(100, int(round(score))))

    # Rating label & badge
    if score >= 90:
        rating = "Excellent"
        badge_color = "emerald"
    elif score >= 75:
        rating = "Good"
        badge_color = "teal"
    elif score >= 60:
        rating = "Fair"
        badge_color = "amber"
    else:
        rating = "Needs Attention"
        badge_color = "rose"

    # Diagnostic Checks
    checks = []

    # Missing check
    if total_missing == 0:
        checks.append({
            "status": "pass",
            "icon": "CheckCircle2",
            "type": "Missing Values",
            "message": "Complete dataset with zero missing cells (100% completeness)."
        })
    else:
        checks.append({
            "status": "warning" if missing_pct < 10 else "fail",
            "icon": "AlertTriangle" if missing_pct < 10 else "AlertCircle",
            "type": "Missing Values",
            "message": f"{total_missing:,} missing values detected across dataset ({missing_pct}% of total cells)."
        })

    # Duplicate check
    if duplicate_rows == 0:
        checks.append({
            "status": "pass",
            "icon": "CheckCircle2",
            "type": "Duplicate Rows",
            "message": "No duplicate records detected across rows."
        })
    else:
        checks.append({
            "status": "warning",
            "icon": "AlertTriangle",
            "type": "Duplicate Rows",
            "message": f"{duplicate_rows:,} duplicate rows found ({duplicate_pct}% of total rows)."
        })

    # Empty columns check
    if len(empty_cols) == 0:
        checks.append({
            "status": "pass",
            "icon": "CheckCircle2",
            "type": "Empty Columns",
            "message": "No completely empty columns found."
        })
    else:
        checks.append({
            "status": "fail",
            "icon": "AlertCircle",
            "type": "Empty Columns",
            "message": f"{len(empty_cols)} empty column(s) detected: {', '.join(empty_cols)}."
        })

    # Constant columns check
    if len(constant_cols) > 0:
        checks.append({
            "status": "info",
            "icon": "Info",
            "type": "Constant Metadata",
            "message": f"{len(constant_cols)} constant field(s) detected ({', '.join(constant_cols)})."
        })

    # Identifier check
    if len(identifier_cols) > 0:
        checks.append({
            "status": "info",
            "icon": "Info",
            "type": "Identifiers",
            "message": f"{len(identifier_cols)} identifier column(s) isolated ({', '.join(identifier_cols)})."
        })

    # High cardinality check
    if len(high_card_cols) > 0:
        checks.append({
            "status": "info",
            "icon": "Info",
            "type": "High Cardinality",
            "message": f"{len(high_card_cols)} column(s) with high cardinality ({', '.join(high_card_cols[:3])})."
        })

    return {
        "score": score,
        "rating": rating,
        "badge_color": badge_color,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "total_cells": total_cells,
        "total_missing": total_missing,
        "missing_percentage": missing_pct,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": duplicate_pct,
        "empty_columns_count": len(empty_cols),
        "empty_columns": empty_cols,
        "constant_columns_count": len(constant_cols),
        "constant_columns": constant_cols,
        "identifier_columns_count": len(identifier_cols),
        "identifier_columns": identifier_cols,
        "high_cardinality_columns_count": len(high_card_cols),
        "checks": checks
    }
