from typing import Any
import pandas as pd
import numpy as np


def compute_correlations(df: pd.DataFrame, metric_cols: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Compute Pearson correlation matrix and classified correlation pairs
    strictly among meaningful numeric metrics (excluding IDs/constants).
    """
    # Filter valid metric column names
    valid_names = [c["name"] for c in metric_cols if c["is_metric"] and not c["is_identifier"]]

    if len(valid_names) < 2:
        return {
            "available": False,
            "message": "At least 2 meaningful numeric metrics are required for correlation analysis.",
            "columns": valid_names,
            "matrix": [],
            "pairs": []
        }

    # Extract numeric dataframe
    num_df = pd.DataFrame()
    for col in valid_names:
        if col in df.columns:
            num_df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop rows with all NaN or compute pairwise correlation
    corr_matrix = num_df.corr(method="pearson").round(3)

    # Format matrix for UI heatmaps
    columns = list(corr_matrix.columns)
    matrix_rows = []
    for col1 in columns:
        row_dict: dict[str, Any] = {"column": col1}
        for col2 in columns:
            val = corr_matrix.loc[col1, col2]
            row_dict[col2] = 0.0 if np.isnan(val) else float(val)
        matrix_rows.append(row_dict)

    # Extract distinct pairs
    pairs = []
    seen = set()
    for i, col1 in enumerate(columns):
        for j, col2 in enumerate(columns):
            if i < j:
                pair_key = tuple(sorted([col1, col2]))
                if pair_key in seen:
                    continue
                seen.add(pair_key)

                val = corr_matrix.loc[col1, col2]
                if np.isnan(val):
                    continue
                r_val = round(float(val), 3)

                if r_val >= 0.7:
                    strength = "Strong Positive"
                    badge_color = "emerald"
                elif r_val >= 0.3:
                    strength = "Moderate Positive"
                    badge_color = "teal"
                elif r_val <= -0.7:
                    strength = "Strong Negative"
                    badge_color = "rose"
                elif r_val <= -0.3:
                    strength = "Moderate Negative"
                    badge_color = "amber"
                else:
                    strength = "Weak / Neutral"
                    badge_color = "slate"

                pairs.append({
                    "col1": col1,
                    "col2": col2,
                    "correlation": r_val,
                    "strength": strength,
                    "badge_color": badge_color,
                    "description": f"{strength} linear association ({r_val:+.2f}) between {col1} and {col2}."
                })

    # Sort pairs by absolute correlation strength descending
    pairs.sort(key=lambda p: abs(p["correlation"]), reverse=True)

    return {
        "available": True,
        "columns": columns,
        "matrix": matrix_rows,
        "pairs": pairs
    }
