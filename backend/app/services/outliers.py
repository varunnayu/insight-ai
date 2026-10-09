from typing import Any
import pandas as pd
import numpy as np


def detect_metric_outliers(df: pd.DataFrame, metric_cols: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Detect statistical outliers in genuine numeric metrics using the IQR rule.
    Excludes identifier columns and constant columns.
    """
    outliers_report = []
    total_rows = len(df)
    if total_rows == 0:
        return []

    for col_info in metric_cols:
        if col_info.get("is_identifier") or not col_info.get("is_metric"):
            continue

        col_name = col_info["name"]
        if col_name not in df.columns:
            continue

        series = pd.to_numeric(df[col_name], errors="coerce").dropna()
        if len(series) < 5:
            continue

        q25 = float(series.quantile(0.25))
        q75 = float(series.quantile(0.75))
        iqr = q75 - q25

        lower_bound = round(q25 - 1.5 * iqr, 2)
        upper_bound = round(q75 + 1.5 * iqr, 2)

        lower_outliers = series[series < lower_bound]
        upper_outliers = series[series > upper_bound]

        lower_count = int(len(lower_outliers))
        upper_count = int(len(upper_outliers))
        total_outliers = lower_count + upper_count
        outlier_pct = round((total_outliers / len(series)) * 100, 2)

        # Sample outlier values
        sample_lower = [round(float(x), 2) for x in lower_outliers.head(5).tolist()]
        sample_upper = [round(float(x), 2) for x in upper_outliers.head(5).tolist()]

        status = "Normal"
        if outlier_pct > 10:
            status = "High Outliers"
        elif outlier_pct > 0:
            status = "Moderate Outliers"

        outliers_report.append({
            "column": col_name,
            "semantic_type": col_info.get("semantic_type", "NUMERIC"),
            "total_analyzed": len(series),
            "outlier_count": total_outliers,
            "outlier_percentage": outlier_pct,
            "status": status,
            "q25": round(q25, 2),
            "q75": round(q75, 2),
            "iqr": round(iqr, 2),
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "lower_outliers_count": lower_count,
            "upper_outliers_count": upper_count,
            "sample_lower": sample_lower,
            "sample_upper": sample_upper,
        })

    # Sort columns with highest outlier percentage first
    outliers_report.sort(key=lambda x: x["outlier_percentage"], reverse=True)
    return outliers_report
