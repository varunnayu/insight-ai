from typing import Any
import pandas as pd
import numpy as np


def compute_numeric_statistics(df: pd.DataFrame, metric_cols: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Compute descriptive statistics for all genuine numeric metric columns.
    Excludes identifier columns.
    """
    stats_list = []
    for col_info in metric_cols:
        col_name = col_info["name"]
        if col_name not in df.columns:
            continue

        series = pd.to_numeric(df[col_name], errors="coerce").dropna()
        if len(series) == 0:
            continue

        count_val = int(len(series))
        sum_val = float(series.sum())
        mean_val = float(series.mean())
        median_val = float(series.median())
        min_val = float(series.min())
        max_val = float(series.max())
        std_val = float(series.std()) if count_val > 1 else 0.0
        var_val = float(series.var()) if count_val > 1 else 0.0
        q25_val = float(series.quantile(0.25))
        q75_val = float(series.quantile(0.75))
        iqr_val = q75_val - q25_val

        # Skewness calculation
        skew_val = float(series.skew()) if count_val > 2 else 0.0

        stats_list.append({
            "column": col_name,
            "semantic_type": col_info.get("semantic_type", "NUMERIC"),
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
            "iqr": round(iqr_val, 2),
            "skewness": round(skew_val, 2) if not np.isnan(skew_val) else 0.0,
        })

    return stats_list


def compute_categorical_breakdowns(df: pd.DataFrame, dim_cols: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Compute frequency breakdowns and distributions for categorical dimension columns.
    Excludes high-cardinality identifiers.
    """
    breakdowns = []
    total_rows = len(df)

    for col_info in dim_cols:
        col_name = col_info["name"]
        if col_name not in df.columns:
            continue

        series = df[col_name].dropna().astype(str)
        if len(series) == 0:
            continue

        val_counts = series.value_counts()
        unique_cnt = len(val_counts)
        top_val = str(val_counts.index[0]) if unique_cnt > 0 else "N/A"
        top_freq = int(val_counts.iloc[0]) if unique_cnt > 0 else 0
        top_pct = round((top_freq / total_rows) * 100, 2) if total_rows > 0 else 0.0

        least_val = str(val_counts.index[-1]) if unique_cnt > 0 else "N/A"
        least_freq = int(val_counts.iloc[-1]) if unique_cnt > 0 else 0

        # Top 10 items for charts
        top_items = []
        for val, count in val_counts.head(10).items():
            top_items.append({
                "label": str(val),
                "count": int(count),
                "percentage": round((int(count) / total_rows) * 100, 2) if total_rows > 0 else 0.0
            })

        breakdowns.append({
            "column": col_name,
            "semantic_type": col_info.get("semantic_type", "CATEGORICAL"),
            "unique_count": unique_cnt,
            "most_common": top_val,
            "most_common_count": top_freq,
            "most_common_pct": top_pct,
            "least_common": least_val,
            "least_common_count": least_freq,
            "distribution": top_items,
        })

    return breakdowns


def compute_histogram_bins(series: pd.Series, bins_count: int = 12) -> list[dict[str, Any]]:
    """Generate histogram frequency bins for numeric distribution exploration."""
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if len(clean) == 0:
        return []

    min_v = float(clean.min())
    max_v = float(clean.max())
    if min_v == max_v:
        return [{"range": f"{min_v}", "count": len(clean), "min": min_v, "max": max_v}]

    counts, bin_edges = np.histogram(clean, bins=bins_count)
    bins = []
    for i in range(len(counts)):
        b_min = float(bin_edges[i])
        b_max = float(bin_edges[i + 1])
        label = f"{b_min:.1f} - {b_max:.1f}" if max_v < 1000 else f"{int(b_min):,} - {int(b_max):,}"
        bins.append({
            "range": label,
            "count": int(counts[i]),
            "min": round(b_min, 2),
            "max": round(b_max, 2)
        })
    return bins


def compute_cross_category_performance(
    df: pd.DataFrame,
    cat_col: str,
    metric_col: str
) -> list[dict[str, Any]]:
    """Compute aggregate metric statistics grouped by a categorical column."""
    if cat_col not in df.columns or metric_col not in df.columns:
        return []

    df_clean = df[[cat_col, metric_col]].dropna().copy()
    df_clean[metric_col] = pd.to_numeric(df_clean[metric_col], errors="coerce")
    df_clean = df_clean.dropna()

    if len(df_clean) == 0:
        return []

    grouped = df_clean.groupby(cat_col)[metric_col].agg(["sum", "mean", "median", "count"]).reset_index()
    # Sort by total sum or count descending
    grouped = grouped.sort_values(by="sum", ascending=False).head(15)

    results = []
    for _, row in grouped.iterrows():
        results.append({
            "category": str(row[cat_col]),
            "sum": round(float(row["sum"]), 2),
            "mean": round(float(row["mean"]), 2),
            "median": round(float(row["median"]), 2),
            "count": int(row["count"])
        })
    return results
