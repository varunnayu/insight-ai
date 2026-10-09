from typing import Any
import pandas as pd
import numpy as np

from app.services.dataset_store import get_dataset, get_filename
from app.services.column_intelligence import analyze_all_columns
from app.services.dataset_classifier import classify_dataset_type
from app.services.kpi_engine import generate_domain_kpis, detect_currency_symbol
from app.services.statistics import (
    compute_numeric_statistics,
    compute_categorical_breakdowns,
    compute_histogram_bins,
    compute_cross_category_performance,
)
from app.services.correlations import compute_correlations
from app.services.outliers import detect_metric_outliers
from app.services.data_quality import assess_data_quality


def apply_dataset_filters(
    df: pd.DataFrame,
    filters: dict[str, Any] | None = None
) -> pd.DataFrame:
    """Apply dynamic multi-attribute filters to dataframe."""
    if not filters or df.empty:
        return df

    filtered_df = df.copy()

    # Categorical filters: { "col_name": ["Val1", "Val2"] or "Val1" }
    cat_filters = filters.get("categorical", {})
    for col, vals in cat_filters.items():
        if col in filtered_df.columns and vals:
            if isinstance(vals, list) and len(vals) > 0:
                filtered_df = filtered_df[filtered_df[col].astype(str).isin([str(v) for v in vals])]
            elif isinstance(vals, str) and vals.strip():
                filtered_df = filtered_df[filtered_df[col].astype(str) == str(vals)]

    # Numeric range filters: { "col_name": { "min": 10, "max": 500 } }
    num_filters = filters.get("numeric", {})
    for col, bounds in num_filters.items():
        if col in filtered_df.columns and isinstance(bounds, dict):
            num_series = pd.to_numeric(filtered_df[col], errors="coerce")
            if "min" in bounds and bounds["min"] is not None:
                filtered_df = filtered_df[num_series >= float(bounds["min"])]
            if "max" in bounds and bounds["max"] is not None:
                filtered_df = filtered_df[num_series <= float(bounds["max"])]

    # Date range filters: { "col_name": { "start": "2023-01-01", "end": "2023-12-31" } }
    date_filters = filters.get("date", {})
    for col, bounds in date_filters.items():
        if col in filtered_df.columns and isinstance(bounds, dict):
            date_series = pd.to_datetime(filtered_df[col], errors="coerce")
            if bounds.get("start"):
                filtered_df = filtered_df[date_series >= pd.to_datetime(bounds["start"])]
            if bounds.get("end"):
                filtered_df = filtered_df[date_series <= pd.to_datetime(bounds["end"])]

    return filtered_df


def build_automatic_visualizations(
    df: pd.DataFrame,
    columns_intel: list[dict[str, Any]],
    dataset_type: str
) -> dict[str, Any]:
    """
    Intelligently select and construct best-fit charts based on available dimensions and metrics.
    Strictly excludes identifiers and constant fields.
    """
    charts: dict[str, Any] = {
        "trend_chart": None,
        "primary_bar_chart": None,
        "secondary_bar_chart": None,
        "distribution_chart": None,
        "scatter_chart": None,
        "segment_donut_chart": None,
    }

    if df.empty:
        return charts

    metric_cols = [c for c in columns_intel if c["is_metric"] and not c["is_identifier"]]
    dim_cols = [c for c in columns_intel if c["is_dimension"] and not c["is_identifier"]]
    date_cols = [c for c in columns_intel if c["is_date"]]

    # 1. TIME SERIES TREND CHART (Date + Metric)
    if date_cols and metric_cols:
        date_col = date_cols[0]["name"]
        metric_col = metric_cols[0]["name"]

        temp = df[[date_col, metric_col]].dropna().copy()
        temp["parsed_date"] = pd.to_datetime(temp[date_col], errors="coerce")
        temp[metric_col] = pd.to_numeric(temp[metric_col], errors="coerce")
        temp = temp.dropna().sort_values("parsed_date")

        if len(temp) > 0:
            # Aggregate by date
            grouped = temp.groupby("parsed_date")[metric_col].agg(["sum", "mean", "count"]).reset_index()
            trend_data = []
            for _, r in grouped.head(60).iterrows():
                trend_data.append({
                    "date": r["parsed_date"].strftime("%Y-%m-%d"),
                    "value": round(float(r["sum"]), 2),
                    "mean": round(float(r["mean"]), 2),
                    "count": int(r["count"])
                })

            charts["trend_chart"] = {
                "available": True,
                "title": f"{metric_col} Trend Over Time",
                "x_axis": date_col,
                "y_axis": metric_col,
                "type": "area",
                "data": trend_data
            }
    else:
        charts["trend_chart"] = {
            "available": False,
            "message": "No time-series date column detected in dataset."
        }

    # 2. PRIMARY CATEGORY BAR CHART (Dimension + Primary Metric)
    if dim_cols:
        primary_dim = dim_cols[0]["name"]
        primary_metric = metric_cols[0]["name"] if metric_cols else None

        if primary_metric:
            cat_perf = compute_cross_category_performance(df, primary_dim, primary_metric)
            charts["primary_bar_chart"] = {
                "available": True,
                "title": f"{primary_metric} by {primary_dim}",
                "dimension": primary_dim,
                "metric": primary_metric,
                "type": "bar",
                "data": cat_perf
            }
        else:
            # Dimension frequency counts
            val_counts = df[primary_dim].dropna().astype(str).value_counts().head(10)
            data = [{"category": str(k), "count": int(v), "sum": int(v), "mean": int(v)} for k, v in val_counts.items()]
            charts["primary_bar_chart"] = {
                "available": True,
                "title": f"Distribution by {primary_dim}",
                "dimension": primary_dim,
                "metric": "Count",
                "type": "bar",
                "data": data
            }

    # 3. SECONDARY CATEGORY BAR CHART (Second Dimension or Second Metric)
    if len(dim_cols) > 1 and metric_cols:
        sec_dim = dim_cols[1]["name"]
        sec_metric = metric_cols[1]["name"] if len(metric_cols) > 1 else metric_cols[0]["name"]
        sec_perf = compute_cross_category_performance(df, sec_dim, sec_metric)
        charts["secondary_bar_chart"] = {
            "available": True,
            "title": f"{sec_metric} by {sec_dim}",
            "dimension": sec_dim,
            "metric": sec_metric,
            "type": "bar",
            "data": sec_perf
        }

    # 4. SEGMENT DONUT / PIE CHART (Low cardinality dimension)
    low_card_dims = [d for d in dim_cols if 2 <= d["unique_count"] <= 8]
    donut_dim = low_card_dims[0]["name"] if low_card_dims else (dim_cols[0]["name"] if dim_cols else None)

    if donut_dim and donut_dim in df.columns:
        counts = df[donut_dim].dropna().astype(str).value_counts().head(6)
        total_valid = int(counts.sum())
        donut_data = [
            {
                "name": str(k),
                "value": int(v),
                "percentage": round((int(v) / total_valid) * 100, 1) if total_valid > 0 else 0
            }
            for k, v in counts.items()
        ]
        charts["segment_donut_chart"] = {
            "available": True,
            "title": f"{donut_dim} Breakdown",
            "dimension": donut_dim,
            "type": "donut",
            "data": donut_data
        }

    # 5. DISTRIBUTION HISTOGRAM (Primary Metric)
    if metric_cols:
        target_metric = metric_cols[0]["name"]
        bins = compute_histogram_bins(df[target_metric], bins_count=12)
        charts["distribution_chart"] = {
            "available": True,
            "title": f"{target_metric} Distribution",
            "metric": target_metric,
            "type": "histogram",
            "bins": bins
        }

    # 6. BIVARIATE SCATTER PLOT (Two metrics if available)
    if len(metric_cols) >= 2:
        m1 = metric_cols[0]["name"]
        m2 = metric_cols[1]["name"]
        # Sample max 150 points for scatter chart responsiveness
        sample_df = df[[m1, m2]].dropna().copy()
        sample_df[m1] = pd.to_numeric(sample_df[m1], errors="coerce")
        sample_df[m2] = pd.to_numeric(sample_df[m2], errors="coerce")
        sample_df = sample_df.dropna()

        if len(sample_df) > 150:
            sample_df = sample_df.sample(n=150, random_state=42)

        scatter_points = [
            {"x": round(float(r[m1]), 2), "y": round(float(r[m2]), 2)}
            for _, r in sample_df.iterrows()
        ]

        charts["scatter_chart"] = {
            "available": True,
            "title": f"{m1} vs {m2} Scatter",
            "x_axis": m1,
            "y_axis": m2,
            "data": scatter_points
        }

    return charts


def analyze_dataset(filters: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Master Universal Analytics Engine.
    Executes dataset profiling, semantic classification, KPI derivation,
    statistical summaries, correlations, outliers, data quality, and chart pipelines.
    """
    raw_df = get_dataset()
    filename = get_filename() or "dataset.csv"

    if raw_df is None or raw_df.empty:
        raise ValueError("No dataset has been uploaded.")

    total_raw_rows = len(raw_df)
    total_raw_cols = len(raw_df.columns)

    # 1. Column Semantic Intelligence (Full Profile)
    columns_intel = analyze_all_columns(raw_df)

    # 2. Dataset Domain Classification
    domain_intel = classify_dataset_type(raw_df, columns_intel)
    dataset_type = domain_intel["dataset_type"]
    dataset_confidence = domain_intel["dataset_confidence"]

    # 3. Apply Filters if Provided
    active_df = apply_dataset_filters(raw_df, filters)
    filtered_rows = len(active_df)

    # 4. Domain-Adaptive KPIs
    kpis = generate_domain_kpis(active_df, columns_intel, dataset_type)

    # 5. Extract metric, dimension, identifier columns
    metric_cols = [c for c in columns_intel if c["is_metric"] and not c["is_identifier"]]
    dim_cols = [c for c in columns_intel if c["is_dimension"] and not c["is_identifier"]]
    id_cols = [c for c in columns_intel if c["is_identifier"]]
    date_cols = [c for c in columns_intel if c["is_date"]]
    text_cols = [c for c in columns_intel if c["role"] == "text"]
    const_cols = [c for c in columns_intel if c.get("is_constant")]

    # 6. Numeric Statistics
    numeric_stats = compute_numeric_statistics(active_df, metric_cols)

    # 7. Categorical Frequency Breakdowns
    categorical_breakdowns = compute_categorical_breakdowns(active_df, dim_cols)

    # 8. Correlations (Excluding IDs)
    correlations = compute_correlations(active_df, metric_cols)

    # 9. Outlier Detection (Excluding IDs)
    outliers = detect_metric_outliers(active_df, metric_cols)

    # 10. Data Quality Scorecard
    data_quality = assess_data_quality(active_df, columns_intel, outliers)

    # 11. Automatic Visualization Selection
    charts = build_automatic_visualizations(active_df, columns_intel, dataset_type)

    # 12. Interactive Exploration Options for UI
    all_metric_names = [c["name"] for c in metric_cols]
    all_dim_names = [c["name"] for c in dim_cols]
    all_date_names = [c["name"] for c in date_cols]

    # Sample rows for Table Preview (top 20 rows sanitized as strings/numbers)
    preview_rows = []
    for _, row in active_df.head(20).iterrows():
        clean_row = {}
        for col in active_df.columns:
            v = row[col]
            if pd.isna(v):
                clean_row[col] = "—"
            elif isinstance(v, (int, np.integer)):
                clean_row[col] = int(v)
            elif isinstance(v, (float, np.floating)):
                clean_row[col] = round(float(v), 2)
            else:
                clean_row[col] = str(v)
        preview_rows.append(clean_row)

    # 13. Currency metadata
    currency_symbol = detect_currency_symbol(active_df, columns_intel)

    # =========================================================================
    # BACKWARD COMPATIBILITY FIELDS FOR LEGACY SALES VIEWS
    # =========================================================================
    legacy_revenue_col = next((c["name"] for c in metric_cols if "revenue" in c["name"].lower() or "sales" in c["name"].lower()), None)
    legacy_profit_col = next((c["name"] for c in metric_cols if "profit" in c["name"].lower()), None)
    legacy_qty_col = next((c["name"] for c in metric_cols if "quantity" in c["name"].lower() or "qty" in c["name"].lower()), None)
    legacy_prod_col = next((c["name"] for c in dim_cols if "product" in c["name"].lower() or "item" in c["name"].lower()), None)
    legacy_cat_col = next((c["name"] for c in dim_cols if "category" in c["name"].lower()), None)
    legacy_reg_col = next((c["name"] for c in dim_cols if "region" in c["name"].lower()), None)
    legacy_date_col = next((c["name"] for c in date_cols), None)

    legacy_kpis = {
        "total_revenue": float(pd.to_numeric(active_df[legacy_revenue_col], errors="coerce").fillna(0).sum()) if legacy_revenue_col else 0.0,
        "total_profit": float(pd.to_numeric(active_df[legacy_profit_col], errors="coerce").fillna(0).sum()) if legacy_profit_col else 0.0,
        "total_orders": filtered_rows,
        "total_quantity": int(pd.to_numeric(active_df[legacy_qty_col], errors="coerce").fillna(0).sum()) if legacy_qty_col else 0,
        "average_order_value": 0.0,
        "profit_margin": 0.0,
    }
    if legacy_kpis["total_orders"] > 0 and legacy_kpis["total_revenue"] > 0:
        legacy_kpis["average_order_value"] = round(legacy_kpis["total_revenue"] / legacy_kpis["total_orders"], 2)
        legacy_kpis["profit_margin"] = round((legacy_kpis["total_profit"] / legacy_kpis["total_revenue"]) * 100, 2)

    return {
        "success": True,
        "dataset": {
            "name": filename,
            "rows": filtered_rows,
            "total_rows": total_raw_rows,
            "columns_count": total_raw_cols,
            "type": dataset_type,
            "confidence": dataset_confidence,
            "icon": domain_intel.get("category_icon", "Database"),
            "description": domain_intel.get("description", ""),
            "currency_symbol": currency_symbol,
            "is_filtered": filtered_rows != total_raw_rows,
        },
        "columns_summary": {
            "all": [c["name"] for c in columns_intel],
            "identifiers": [c["name"] for c in id_cols],
            "metrics": all_metric_names,
            "dimensions": all_dim_names,
            "dates": all_date_names,
            "texts": [c["name"] for c in text_cols],
            "constants": [c["name"] for c in const_cols],
        },
        "columns_intelligence": columns_intel,
        "kpis": kpis,
        "numeric_statistics": numeric_stats,
        "categorical_breakdowns": categorical_breakdowns,
        "correlations": correlations,
        "outliers": outliers,
        "data_quality": data_quality,
        "charts": charts,
        "preview_rows": preview_rows,

        # Interactive selectors for Analytics Explorer
        "selectors": {
            "metrics": all_metric_names,
            "dimensions": all_dim_names,
            "dates": all_date_names,
        },

        # Backward compatibility for legacy sales endpoints
        "detected_columns": {
            "revenue": legacy_revenue_col,
            "profit": legacy_profit_col,
            "quantity": legacy_qty_col,
            "product": legacy_prod_col,
            "category": legacy_cat_col,
            "region": legacy_reg_col,
            "date": legacy_date_col,
        },
        "legacy_kpis": legacy_kpis,
        "revenue_by_category": compute_cross_category_performance(active_df, legacy_cat_col, legacy_revenue_col) if (legacy_cat_col and legacy_revenue_col) else [],
        "revenue_by_region": compute_cross_category_performance(active_df, legacy_reg_col, legacy_revenue_col) if (legacy_reg_col and legacy_revenue_col) else [],
        "top_products": compute_cross_category_performance(active_df, legacy_prod_col, legacy_revenue_col) if (legacy_prod_col and legacy_revenue_col) else [],
        "revenue_trend": charts.get("trend_chart", {}).get("data", []) if charts.get("trend_chart", {}).get("available") else [],
    }