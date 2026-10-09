from typing import Any
import pandas as pd
import numpy as np

from app.services.dataset_store import get_dataset


def generate_insights() -> dict[str, Any]:
    """
    Generate domain-adaptive rule-based business insights from the currently uploaded dataset.
    Never forces sales assumptions on non-sales datasets.
    """
    from app.services.analytics import analyze_dataset

    df = get_dataset()
    if df is None or df.empty:
        raise ValueError("No dataset has been uploaded.")

    analytics = analyze_dataset()
    dataset_info = analytics.get("dataset", {})
    dataset_type = dataset_info.get("type", "General Structured Data")
    kpis = analytics.get("kpis", [])
    columns_intel = analytics.get("columns_intelligence", [])
    correlations = analytics.get("correlations", {})
    outliers = analytics.get("outliers", [])
    data_quality = analytics.get("data_quality", {})
    stats = analytics.get("numeric_statistics", [])
    categories = analytics.get("categorical_breakdowns", [])

    insights = []
    total_rows = len(df)

    # =========================================================================
    # 1. DOMAIN & DATASET SCALE INSIGHT
    # =========================================================================
    insights.append({
        "type": "opportunity" if dataset_type != "General Structured Data" else "trend",
        "severity": "positive",
        "title": f"{dataset_type} Dataset Detected ({round(dataset_info.get('confidence', 0.9) * 100)}% confidence)",
        "description": f"Analyzed {total_rows:,} records across {len(columns_intel)} attributes. {dataset_info.get('description', '')}",
        "recommendation": "Explore dynamic KPIs and categorical distributions tailored for this data structure."
    })

    # =========================================================================
    # 2. PRODUCT / INVENTORY SPECIFIC INSIGHTS
    # =========================================================================
    if dataset_type in ["Products", "Inventory"]:
        # Price insight
        price_stat = next((s for s in stats if s["column"].lower() in ["price", "mrp", "cost", "unit_price"]), None)
        if price_stat:
            insights.append({
                "type": "trend",
                "severity": "positive",
                "title": "Product Pricing Profile",
                "description": f"Average catalog price is ${price_stat['mean']:,.2f} with a median of ${price_stat['median']:,.2f}. Price spans from ${price_stat['min']} to ${price_stat['max']}.",
                "recommendation": "Monitor high-margin product segments to optimize promotional discounting."
            })

        # Stock insight
        stock_stat = next((s for s in stats if s["column"].lower() in ["stock", "quantity", "inventory", "units"]), None)
        if stock_stat:
            total_stk = stock_stat["sum"]
            avg_stk = stock_stat["mean"]
            stk_str = f"{total_stk / 1_000_000:.2f}M" if total_stk >= 1_000_000 else f"{int(total_stk):,}"
            insights.append({
                "type": "opportunity",
                "severity": "positive" if avg_stk > 50 else "medium",
                "title": "Inventory & Stock Depth",
                "description": f"Total warehouse inventory across all products stands at {stk_str} units, averaging {avg_stk:,.1f} units per SKU.",
                "recommendation": "Identify low-stock SKUs to prevent stockouts while balancing warehouse holding costs."
            })

        # Category breakdown insight
        cat_item = next((c for c in categories if c["column"].lower() in ["category", "dept", "department", "type"]), None)
        if cat_item:
            dist = cat_item.get("distribution", [])
            top_cat = dist[0] if dist else None
            if top_cat:
                insights.append({
                    "type": "product",
                    "severity": "positive",
                    "title": f"Leading Category: {top_cat['label']}",
                    "description": f"'{top_cat['label']}' is the largest category with {top_cat['count']:,} products ({top_cat['percentage']}% of catalog).",
                    "recommendation": "Ensure adequate promotional support and supplier agreements for top categories."
                })

    # =========================================================================
    # 3. SALES SPECIFIC INSIGHTS
    # =========================================================================
    elif dataset_type == "Sales":
        rev_stat = next((s for s in stats if "revenue" in s["column"].lower() or "sales" in s["column"].lower()), None)
        prof_stat = next((s for s in stats if "profit" in s["column"].lower()), None)

        if rev_stat:
            tot_rev = rev_stat["sum"]
            insights.append({
                "type": "trend",
                "severity": "positive",
                "title": "Revenue Generation",
                "description": f"Total revenue generated is ₹{tot_rev:,.2f} across {total_rows:,} recorded transactions.",
                "recommendation": "Focus on high-ticket transactions to expand average order value."
            })

        if rev_stat and prof_stat and rev_stat["sum"] > 0:
            margin = (prof_stat["sum"] / rev_stat["sum"]) * 100
            if margin >= 20:
                insights.append({
                    "type": "profitability",
                    "severity": "positive",
                    "title": f"Strong Profit Margin ({margin:.1f}%)",
                    "description": f"Operating with a healthy profit margin of {margin:.1f}%, generating ₹{prof_stat['sum']:,.2f} in net profit.",
                    "recommendation": "Protect high-margin product lines while scaling sales volume."
                })
            else:
                insights.append({
                    "type": "risk",
                    "severity": "medium",
                    "title": f"Moderate Profit Margin ({margin:.1f}%)",
                    "description": f"Current profit margin is {margin:.1f}%.",
                    "recommendation": "Audit discounting and cost of goods to improve margin efficiency."
                })

    # =========================================================================
    # 4. EDUCATION / HR / GENERAL METRIC INSIGHTS
    # =========================================================================
    else:
        # General numeric metric summary
        if stats:
            primary = stats[0]
            insights.append({
                "type": "trend",
                "severity": "positive",
                "title": f"{primary['column']} Metric Analysis",
                "description": f"Mean {primary['column']} is {primary['mean']:,.2f} (Median: {primary['median']:,.2f}, Range: {primary['min']} to {primary['max']}).",
                "recommendation": f"Utilize {primary['column']} as a primary benchmark for comparative cohort evaluation."
            })

    # =========================================================================
    # 5. CORRELATIONS INSIGHT
    # =========================================================================
    pairs = correlations.get("pairs", [])
    if pairs:
        top_pair = pairs[0]
        r_val = top_pair["correlation"]
        if abs(r_val) >= 0.5:
            insights.append({
                "type": "opportunity" if r_val > 0 else "risk",
                "severity": "positive" if r_val > 0 else "medium",
                "title": f"Key Correlation: {top_pair['col1']} & {top_pair['col2']}",
                "description": f"Found a {top_pair['strength'].lower()} ({r_val:+.2f}) between {top_pair['col1']} and {top_pair['col2']}.",
                "recommendation": f"Changes in {top_pair['col1']} strongly associate with {top_pair['col2']}."
            })
        else:
            insights.append({
                "type": "trend",
                "severity": "positive",
                "title": "Independent Metric Dimensions",
                "description": f"{top_pair['col1']} and {top_pair['col2']} show weak correlation ({r_val:+.2f}), indicating independent operational factors.",
                "recommendation": "Manage these metrics with independent optimization strategies."
            })

    # =========================================================================
    # 6. OUTLIER ANOMALY INSIGHT
    # =========================================================================
    heavy_outlier = next((o for o in outliers if o["outlier_count"] > 0), None)
    if heavy_outlier:
        insights.append({
            "type": "risk" if heavy_outlier["outlier_percentage"] > 10 else "trend",
            "severity": "medium" if heavy_outlier["outlier_percentage"] > 10 else "positive",
            "title": f"Outlier Distribution in {heavy_outlier['column']}",
            "description": f"Detected {heavy_outlier['outlier_count']:,} statistical outliers ({heavy_outlier['outlier_percentage']}%) exceeding IQR threshold bounds.",
            "recommendation": f"Audit extreme values outside [{heavy_outlier['lower_bound']}, {heavy_outlier['upper_bound']}] for data entry or premium anomalies."
        })

    # =========================================================================
    # 7. DATA QUALITY & HEALTH INSIGHT
    # =========================================================================
    quality_score = data_quality.get("score", 100)
    total_missing = data_quality.get("total_missing", 0)
    duplicate_rows = data_quality.get("duplicate_rows", 0)

    if quality_score >= 90:
        insights.append({
            "type": "data_quality",
            "severity": "positive",
            "title": f"High Data Quality Score ({quality_score}/100)",
            "description": f"Dataset integrity is rated {data_quality.get('rating', 'Excellent')}. {total_missing} missing values and {duplicate_rows} duplicate rows detected.",
            "recommendation": "Dataset is production-ready for automated analytics, reporting, and statistical modeling."
        })
    else:
        insights.append({
            "type": "data_quality",
            "severity": "medium",
            "title": f"Data Quality Score ({quality_score}/100)",
            "description": f"Dataset health is rated {data_quality.get('rating')}. Missing cells: {total_missing:,}, Duplicates: {duplicate_rows:,}.",
            "recommendation": "Cleanse missing and duplicate values before deploying critical downstream dashboards."
        })

    # High priority and positive counters
    high_priority = sum(1 for item in insights if item.get("severity") in ["high", "medium"])
    positive_findings = sum(1 for item in insights if item.get("severity") == "positive")

    return {
        "success": True,
        "dataset_type": dataset_type,
        "summary": {
            "total_insights": len(insights),
            "high_priority": high_priority,
            "positive_findings": positive_findings,
        },
        "insights": insights,
    }