import io
import math
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.services.analytics import analyze_dataset
from app.services.dataset_store import get_dataset, get_dataset_metadata
from app.services.insights import generate_insights
from app.services.profiler import profile_dataframe


# ==========================================================
# Domain Detection
# ==========================================================

def detect_domain(df: pd.DataFrame) -> str:
    """
    Detect the operational domain of the dataset based on column naming heuristics.
    Returns: 'products' | 'sales' | 'education' | 'hr' | 'finance' | 'marketing' | 'generic'
    """
    cols = [c.lower().strip() for c in df.columns]

    prod_keywords = {"brand", "category", "price", "stock", "ean", "sku", "availability", "color", "size", "mrp", "item"}
    sales_keywords = {"revenue", "profit", "order", "sales", "discount", "customer", "shipping", "invoice"}
    edu_keywords = {"mark", "marks", "score", "scores", "grade", "grades", "attendance", "student", "student_id", "gpa", "exam", "subject"}
    hr_keywords = {"salary", "employee", "employee_id", "department", "experience", "designation", "hire_date", "performance", "wage"}
    fin_keywords = {"balance", "credit", "debit", "loan", "interest", "account", "expense", "transaction_type", "budget"}
    mkt_keywords = {"clicks", "impressions", "conversion", "ctr", "campaign", "traffic", "leads", "bounce_rate"}

    matches = {
        "products": sum(1 for c in cols if any(k in c for k in prod_keywords)),
        "sales": sum(1 for c in cols if any(k in c for k in sales_keywords)),
        "education": sum(1 for c in cols if any(k in c for k in edu_keywords)),
        "hr": sum(1 for c in cols if any(k in c for k in hr_keywords)),
        "finance": sum(1 for c in cols if any(k in c for k in fin_keywords)),
        "marketing": sum(1 for c in cols if any(k in c for k in mkt_keywords)),
    }

    # If both product and sales match, prioritize sales only if revenue/profit keywords actually exist
    has_rev_or_profit = any("revenue" in c or "profit" in c for c in cols)
    if matches["products"] >= 2 and not has_rev_or_profit:
        return "products"

    best_domain = max(matches, key=matches.get)
    if matches[best_domain] >= 2:
        return best_domain
    elif matches[best_domain] == 1 and len(cols) <= 4:
        return best_domain

    return "generic"


# ==========================================================
# Dynamic Metrics (KPIs) Generation
# ==========================================================

def generate_key_metrics(df: pd.DataFrame, domain: str, profile: dict) -> list[dict[str, Any]]:
    numeric_cols = profile.get("numeric_columns", [])
    cat_cols = profile.get("categorical_columns", [])
    date_cols = profile.get("date_columns", [])
    total_rows = int(df.shape[0])

    metrics: list[dict[str, Any]] = []

    if domain == "products":
        price_col = next((c for c in df.columns if any(k in c.lower() for k in ["price", "mrp", "cost", "unit_price"])), None)
        stock_col = next((c for c in df.columns if any(k in c.lower() for k in ["stock", "quantity", "inventory", "units"])), None)
        cat_col = next((c for c in df.columns if any(k in c.lower() for k in ["category", "dept", "department"])), None)
        brand_col = next((c for c in df.columns if any(k in c.lower() for k in ["brand", "manufacturer", "vendor"])), None)

        metrics.append({
            "id": "products",
            "label": "Total Products",
            "value": total_rows,
            "formatted": f"{total_rows:,}",
            "subtitle": "Catalog SKUs tracked",
            "badge": "Catalog",
            "icon": "package",
        })

        if price_col and pd.api.types.is_numeric_dtype(df[price_col]):
            p_series = pd.to_numeric(df[price_col], errors="coerce").dropna()
            if not p_series.empty:
                avg_p = float(p_series.mean())
                metrics.append({
                    "id": "avg_price",
                    "label": "Average Price",
                    "value": round(avg_p, 2),
                    "formatted": f"${avg_p:,.2f}",
                    "subtitle": f"Median: ${float(p_series.median()):,.2f}",
                    "badge": "Pricing",
                    "icon": "dollar",
                })

        if stock_col and pd.api.types.is_numeric_dtype(df[stock_col]):
            stk_series = pd.to_numeric(df[stock_col], errors="coerce").dropna()
            if not stk_series.empty:
                tot_stk = float(stk_series.sum())
                metrics.append({
                    "id": "total_stock",
                    "label": "Total Stock",
                    "value": tot_stk,
                    "formatted": f"{tot_stk / 1_000_000:.2f}M" if tot_stk >= 1_000_000 else f"{int(tot_stk):,}",
                    "subtitle": f"Avg: {float(stk_series.mean()):,.1f} units/SKU",
                    "badge": "Inventory",
                    "icon": "trending-up",
                })

        if cat_col:
            cat_count = int(df[cat_col].nunique())
            metrics.append({
                "id": "categories",
                "label": "Categories",
                "value": cat_count,
                "formatted": f"{cat_count:,}",
                "subtitle": "Product classifications",
                "badge": "Taxonomy",
                "icon": "layers",
            })
        elif brand_col:
            brand_count = int(df[brand_col].nunique())
            metrics.append({
                "id": "brands",
                "label": "Brands",
                "value": brand_count,
                "formatted": f"{brand_count:,}",
                "subtitle": "Distinct vendor brands",
                "badge": "Vendors",
                "icon": "award",
            })

    elif domain == "sales":
        # Check sales columns safely
        rev_col = next((c for c in df.columns if any(k in c.lower() for k in ["revenue", "sales", "total_sales", "amount"])), None)
        prof_col = next((c for c in df.columns if any(k in c.lower() for k in ["profit", "net_profit", "gross_profit"])), None)
        qty_col = next((c for c in df.columns if any(k in c.lower() for k in ["quantity", "qty", "units"])), None)

        if rev_col and pd.api.types.is_numeric_dtype(df[rev_col]):
            total_rev = float(pd.to_numeric(df[rev_col], errors="coerce").fillna(0).sum())
            metrics.append({
                "id": "revenue",
                "label": "Total Revenue",
                "value": total_rev,
                "formatted": f"₹{total_rev:,.0f}" if total_rev >= 1000 else f"₹{total_rev:,.2f}",
                "subtitle": f"Across {total_rows} recorded transactions",
                "badge": "Primary Metric",
                "icon": "dollar",
            })

        if prof_col and pd.api.types.is_numeric_dtype(df[prof_col]):
            total_prof = float(pd.to_numeric(df[prof_col], errors="coerce").fillna(0).sum())
            metrics.append({
                "id": "profit",
                "label": "Total Profit",
                "value": total_prof,
                "formatted": f"₹{total_prof:,.0f}" if total_prof >= 1000 else f"₹{total_prof:,.2f}",
                "subtitle": "Net earnings across orders",
                "badge": "Profitability",
                "icon": "trending-up",
            })

        if rev_col and prof_col and total_rev > 0:
            margin = (total_prof / total_rev) * 100
            metrics.append({
                "id": "margin",
                "label": "Profit Margin",
                "value": round(margin, 1),
                "formatted": f"{margin:.1f}%",
                "subtitle": "Profit-to-revenue ratio",
                "badge": "Efficiency",
                "icon": "percent",
            })

        if qty_col and pd.api.types.is_numeric_dtype(df[qty_col]):
            total_qty = int(pd.to_numeric(df[qty_col], errors="coerce").fillna(0).sum())
            metrics.append({
                "id": "volume",
                "label": "Total Units Sold",
                "value": total_qty,
                "formatted": f"{total_qty:,}",
                "subtitle": "Aggregate item volume",
                "badge": "Operations",
                "icon": "package",
            })
        else:
            metrics.append({
                "id": "orders",
                "label": "Total Orders",
                "value": total_rows,
                "formatted": f"{total_rows:,}",
                "subtitle": "Unique transaction entries",
                "badge": "Volume",
                "icon": "shopping-cart",
            })

    elif domain == "education":
        score_col = next((c for c in df.columns if any(k in c.lower() for k in ["marks", "score", "grade", "gpa", "percentage"])), None)
        att_col = next((c for c in df.columns if "attendance" in c.lower()), None)

        metrics.append({
            "id": "students",
            "label": "Total Students",
            "value": total_rows,
            "formatted": f"{total_rows:,}",
            "subtitle": "Enrolled student records",
            "badge": "Cohort Size",
            "icon": "users",
        })

        if score_col and pd.api.types.is_numeric_dtype(df[score_col]):
            s_series = pd.to_numeric(df[score_col], errors="coerce").dropna()
            if not s_series.empty:
                avg_val = float(s_series.mean())
                max_val = float(s_series.max())
                metrics.append({
                    "id": "avg_score",
                    "label": f"Average {score_col.title()}",
                    "value": round(avg_val, 1),
                    "formatted": f"{avg_val:.1f}",
                    "subtitle": "Cohort performance mean",
                    "badge": "Academic Avg",
                    "icon": "award",
                })
                metrics.append({
                    "id": "top_score",
                    "label": f"Top {score_col.title()}",
                    "value": round(max_val, 1),
                    "formatted": f"{max_val:.1f}",
                    "subtitle": "Highest score achieved",
                    "badge": "Peak Performance",
                    "icon": "star",
                })

        if att_col and pd.api.types.is_numeric_dtype(df[att_col]):
            att_series = pd.to_numeric(df[att_col], errors="coerce").dropna()
            if not att_series.empty:
                avg_att = float(att_series.mean())
                metrics.append({
                    "id": "attendance",
                    "label": "Avg Attendance",
                    "value": round(avg_att, 1),
                    "formatted": f"{avg_att:.1f}%" if avg_att <= 100 else f"{avg_att:.1f}",
                    "subtitle": "Classroom participation rate",
                    "badge": "Engagement",
                    "icon": "calendar",
                })

    elif domain == "hr":
        sal_col = next((c for c in df.columns if any(k in c.lower() for k in ["salary", "wage", "compensation"])), None)
        dept_col = next((c for c in df.columns if any(k in c.lower() for k in ["department", "dept", "team"])), None)
        exp_col = next((c for c in df.columns if any(k in c.lower() for k in ["experience", "tenure", "years"])), None)

        metrics.append({
            "id": "headcount",
            "label": "Total Headcount",
            "value": total_rows,
            "formatted": f"{total_rows:,}",
            "subtitle": "Active employee records",
            "badge": "Workforce",
            "icon": "users",
        })

        if sal_col and pd.api.types.is_numeric_dtype(df[sal_col]):
            s_series = pd.to_numeric(df[sal_col], errors="coerce").dropna()
            if not s_series.empty:
                avg_sal = float(s_series.mean())
                metrics.append({
                    "id": "avg_salary",
                    "label": "Average Compensation",
                    "value": round(avg_sal, 2),
                    "formatted": f"₹{avg_sal:,.0f}" if avg_sal >= 1000 else f"₹{avg_sal:,.2f}",
                    "subtitle": "Mean compensation level",
                    "badge": "Payroll Avg",
                    "icon": "credit-card",
                })

        if dept_col:
            dept_count = int(df[dept_col].nunique())
            metrics.append({
                "id": "departments",
                "label": "Departments",
                "value": dept_count,
                "formatted": f"{dept_count}",
                "subtitle": "Functional business divisions",
                "badge": "Organizational",
                "icon": "briefcase",
            })

        if exp_col and pd.api.types.is_numeric_dtype(df[exp_col]):
            exp_series = pd.to_numeric(df[exp_col], errors="coerce").dropna()
            if not exp_series.empty:
                avg_exp = float(exp_series.mean())
                metrics.append({
                    "id": "experience",
                    "label": "Average Experience",
                    "value": round(avg_exp, 1),
                    "formatted": f"{avg_exp:.1f} yrs",
                    "subtitle": "Staff organizational tenure",
                    "badge": "Seniority",
                    "icon": "clock",
                })

    # Fallback / Generic domain or if domain didn't populate 4 cards
    if len(metrics) < 4:
        # Include row and column metrics
        if not any(m["id"] == "records" for m in metrics):
            metrics.insert(0, {
                "id": "records",
                "label": "Total Records",
                "value": total_rows,
                "formatted": f"{total_rows:,}",
                "subtitle": "Validated row entries",
                "badge": "Dataset Volume",
                "icon": "database",
            })

        if not any(m["id"] == "columns" for m in metrics):
            metrics.append({
                "id": "columns",
                "label": "Total Features",
                "value": len(df.columns),
                "formatted": f"{len(df.columns)}",
                "subtitle": f"{len(numeric_cols)} num, {len(cat_cols)} cat, {len(date_cols)} date",
                "badge": "Dimensionality",
                "icon": "layers",
            })

        # Find any other top numeric column to highlight
        for col in numeric_cols:
            if len(metrics) >= 4:
                break
            if any(col.lower() in m["label"].lower() for m in metrics):
                continue
            series = pd.to_numeric(df[col], errors="coerce").dropna()
            if not series.empty:
                m_avg = float(series.mean())
                metrics.append({
                    "id": f"avg_{col}",
                    "label": f"Avg {col.replace('_', ' ').title()}",
                    "value": round(m_avg, 2),
                    "formatted": f"{m_avg:,.2f}" if abs(m_avg) >= 100 else f"{m_avg:.2f}",
                    "subtitle": f"Range: [{series.min():.1f} - {series.max():.1f}]",
                    "badge": "Numeric Stat",
                    "icon": "bar-chart-2",
                })

    return metrics[:4]


# ==========================================================
# Statistical Summary
# ==========================================================

def generate_statistical_summary(df: pd.DataFrame, numeric_columns: list[str]) -> list[dict[str, Any]]:
    stats_list = []
    for col in numeric_columns:
        if col not in df.columns:
            continue
        series = pd.to_numeric(df[col], errors="coerce").dropna()
        if series.empty:
            continue

        count_val = int(series.count())
        mean_val = float(series.mean())
        median_val = float(series.median())
        min_val = float(series.min())
        max_val = float(series.max())
        std_val = float(series.std()) if count_val > 1 else 0.0

        stats_list.append({
            "column": col,
            "count": count_val,
            "mean": round(mean_val, 2),
            "median": round(median_val, 2),
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "std_dev": round(std_val, 2) if not math.isnan(std_val) else 0.0,
        })
    return stats_list


# ==========================================================
# Categorical Analysis
# ==========================================================

def generate_categorical_analysis(df: pd.DataFrame, categorical_columns: list[str]) -> list[dict[str, Any]]:
    cat_list = []
    for col in categorical_columns[:6]:
        if col not in df.columns:
            continue
        series = df[col].dropna().astype(str)
        if series.empty:
            continue

        total_count = len(series)
        val_counts = series.value_counts()
        most_frequent = str(val_counts.index[0]) if not val_counts.empty else "N/A"
        most_frequent_count = int(val_counts.iloc[0]) if not val_counts.empty else 0
        most_frequent_pct = round((most_frequent_count / total_count) * 100, 1) if total_count > 0 else 0.0

        distribution = []
        for label, count in val_counts.head(5).items():
            distribution.append({
                "label": str(label),
                "count": int(count),
                "percentage": round((int(count) / total_count) * 100, 1) if total_count > 0 else 0.0,
            })

        cat_list.append({
            "column": col,
            "unique_count": int(series.nunique()),
            "most_frequent": most_frequent,
            "most_frequent_count": most_frequent_count,
            "most_frequent_pct": most_frequent_pct,
            "distribution": distribution,
        })
    return cat_list


# ==========================================================
# Correlation Analysis
# ==========================================================

def compute_correlation_analysis(df: pd.DataFrame, numeric_columns: list[str]) -> dict[str, Any]:
    if len(numeric_columns) < 2:
        return {
            "has_correlation": False,
            "message": "Correlation analysis requires at least two numeric columns.",
            "pairs": [],
            "matrix": {},
        }

    # Extract numeric sub-dataframe
    num_df = df[numeric_columns].apply(pd.to_numeric, errors="coerce")
    corr_df = num_df.corr(method="pearson").fillna(0)

    pairs = []
    seen = set()
    cols = list(corr_df.columns)

    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1 = cols[i]
            col2 = cols[j]
            r = float(corr_df.loc[col1, col2])
            abs_r = abs(r)

            if abs_r >= 0.7:
                strength = "Strong"
            elif abs_r >= 0.35:
                strength = "Moderate"
            else:
                strength = "Weak"

            direction = "Positive" if r >= 0 else "Negative"

            description = f"{col1.replace('_', ' ').title()} and {col2.replace('_', ' ').title()} display a {strength.lower()} {direction.lower()} relationship (r = {r:.2f})."

            pairs.append({
                "col1": col1,
                "col2": col2,
                "correlation": round(r, 2),
                "strength": strength,
                "direction": direction,
                "description": description,
            })

    # Sort by absolute correlation descending
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    # Matrix formatted for heatmap/table display
    matrix_data: dict[str, dict[str, float]] = {}
    for c1 in cols:
        matrix_data[c1] = {}
        for c2 in cols:
            matrix_data[c1][c2] = round(float(corr_df.loc[c1, c2]), 2)

    return {
        "has_correlation": True,
        "message": f"Evaluated correlation across {len(numeric_columns)} numeric dimensions.",
        "pairs": pairs,
        "matrix": matrix_data,
        "columns": cols,
    }


# ==========================================================
# Data Quality Scorecard
# ==========================================================

def compute_data_quality(df: pd.DataFrame, profile: dict) -> dict[str, Any]:
    rows = profile.get("rows", 0)
    cols = profile.get("columns", 0)
    missing = profile.get("missing_values", 0)
    duplicates = profile.get("duplicate_rows", 0)
    total_cells = rows * cols if (rows * cols) > 0 else 1

    score = 100
    deductions = []

    # 1. Missing Values Check
    missing_pct = (missing / total_cells) * 100
    if missing == 0:
        deductions.append({
            "check": "Data Completeness",
            "status": "pass",
            "message": "Zero missing values detected across all cells.",
            "penalty": 0,
        })
    else:
        penalty = min(30, int(math.ceil(missing_pct * 3)))
        score -= penalty
        status = "warn" if missing_pct < 10 else "fail"
        deductions.append({
            "check": "Data Completeness",
            "status": status,
            "message": f"{missing} missing values ({missing_pct:.1f}% of total data points).",
            "penalty": penalty,
        })

    # 2. Duplicate Rows Check
    dup_pct = (duplicates / rows) * 100 if rows > 0 else 0
    if duplicates == 0:
        deductions.append({
            "check": "Record Uniqueness",
            "status": "pass",
            "message": "No duplicate rows found. Every record is distinct.",
            "penalty": 0,
        })
    else:
        penalty = min(25, int(math.ceil(dup_pct * 2.5)))
        score -= penalty
        status = "warn" if dup_pct < 10 else "fail"
        deductions.append({
            "check": "Record Uniqueness",
            "status": status,
            "message": f"{duplicates} duplicate rows detected ({dup_pct:.1f}% of total rows).",
            "penalty": penalty,
        })

    # 3. Outlier Check on numeric columns
    outlier_count = 0
    outlier_cols = []
    for col in profile.get("numeric_columns", []):
        s = pd.to_numeric(df[col], errors="coerce").dropna()
        if len(s) >= 4:
            q1 = s.quantile(0.25)
            q3 = s.quantile(0.75)
            iqr = q3 - q1
            if iqr > 0:
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                outliers = ((s < lower) | (s > upper)).sum()
                if outliers > 0:
                    outlier_count += int(outliers)
                    outlier_cols.append(col)

    if outlier_count == 0:
        deductions.append({
            "check": "Statistical Outliers",
            "status": "pass",
            "message": "Numeric distributions adhere to expected IQR ranges without extreme outliers.",
            "penalty": 0,
        })
    else:
        penalty = min(15, len(outlier_cols) * 4)
        score -= penalty
        deductions.append({
            "check": "Statistical Outliers",
            "status": "warn",
            "message": f"{outlier_count} potential outlier(s) detected in column(s): {', '.join(outlier_cols[:3])}.",
            "penalty": penalty,
        })

    # 4. Column Variance / Constant Values
    constant_cols = [c for c in df.columns if df[c].nunique() <= 1]
    if not constant_cols:
        deductions.append({
            "check": "Feature Variance",
            "status": "pass",
            "message": "All columns contain dynamic, varying data values.",
            "penalty": 0,
        })
    else:
        penalty = min(15, len(constant_cols) * 5)
        score -= penalty
        deductions.append({
            "check": "Feature Variance",
            "status": "fail",
            "message": f"Column(s) with zero variance (single value): {', '.join(constant_cols)}.",
            "penalty": penalty,
        })

    score = max(10, min(100, score))

    if score >= 90:
        rating = "Excellent"
    elif score >= 75:
        rating = "Good"
    elif score >= 60:
        rating = "Fair"
    else:
        rating = "Needs Cleaning"

    return {
        "score": score,
        "rating": rating,
        "deductions": deductions,
        "missing_values": missing,
        "duplicate_rows": duplicates,
        "outlier_columns": outlier_cols,
    }


# ==========================================================
# Dynamic Visual Analysis (Chart Recommendations)
# ==========================================================

def generate_visual_analysis(df: pd.DataFrame, profile: dict) -> list[dict[str, Any]]:
    numeric_cols = profile.get("numeric_columns", [])
    cat_cols = profile.get("categorical_columns", [])
    date_cols = profile.get("date_columns", [])

    charts: list[dict[str, Any]] = []

    # Chart 1: Date + Numeric -> Line Chart (Chronological Trend)
    if date_cols and numeric_cols:
        d_col = date_cols[0]
        # Pick best numeric column (prefer revenue/sales/amount, else first)
        n_col = next((c for c in numeric_cols if any(k in c.lower() for k in ["revenue", "sales", "profit", "amount", "marks", "salary", "score"])), numeric_cols[0])

        temp = df.copy()
        temp["_dt"] = pd.to_datetime(temp[d_col], errors="coerce")
        temp["_num"] = pd.to_numeric(temp[n_col], errors="coerce").fillna(0)
        temp = temp.dropna(subset=["_dt"]).sort_values("_dt")

        if len(temp) >= 2:
            grouped = temp.groupby(temp["_dt"].dt.strftime("%Y-%m-%d"))["_num"].sum().reset_index()
            chart_data = [{"date": str(row["_dt"]), "value": round(float(row["_num"]), 2)} for _, row in grouped.iterrows()]

            if chart_data:
                charts.append({
                    "id": "chronological_trend",
                    "type": "line",
                    "title": f"Chronological Trend: {n_col.replace('_', ' ').title()}",
                    "description": f"Aggregation of {n_col} over the chronological timeline ({d_col}).",
                    "x_key": "date",
                    "y_key": "value",
                    "data": chart_data,
                })

    # Chart 2: Categorical + Numeric -> Bar Chart
    if cat_cols and numeric_cols:
        c_col = next((c for c in cat_cols if df[c].nunique() >= 2 and df[c].nunique() <= 15), cat_cols[0])
        n_col = next((c for c in numeric_cols if any(k in c.lower() for k in ["revenue", "sales", "profit", "marks", "salary", "score"])), numeric_cols[0])

        temp = df.copy()
        temp["_cat"] = temp[c_col].astype(str)
        temp["_num"] = pd.to_numeric(temp[n_col], errors="coerce").fillna(0)

        grouped = temp.groupby("_cat")["_num"].sum().sort_values(ascending=False).head(10).reset_index()
        chart_data = [{"category": str(row["_cat"]), "value": round(float(row["_num"]), 2)} for _, row in grouped.iterrows()]

        if len(chart_data) >= 2:
            charts.append({
                "id": "category_bar",
                "type": "bar",
                "title": f"{n_col.replace('_', ' ').title()} by {c_col.replace('_', ' ').title()}",
                "description": f"Summed values broken down across {c_col} categories.",
                "x_key": "category",
                "y_key": "value",
                "data": chart_data,
            })

    # Chart 3: Low-cardinality Categorical -> Pie / Donut Chart
    low_card_col = next((c for c in cat_cols if 2 <= df[c].nunique() <= 7), None)
    if low_card_col:
        val_counts = df[low_card_col].value_counts().head(6)
        pie_data = [{"name": str(k), "value": int(v)} for k, v in val_counts.items()]
        if len(pie_data) >= 2:
            charts.append({
                "id": "segment_pie",
                "type": "pie",
                "title": f"{low_card_col.replace('_', ' ').title()} Distribution",
                "description": f"Proportional record share across {low_card_col} segments.",
                "x_key": "name",
                "y_key": "value",
                "data": pie_data,
            })

    # Chart 4: Two Numeric Columns -> Scatter Plot
    if len(numeric_cols) >= 2:
        col1 = numeric_cols[0]
        col2 = numeric_cols[1]
        temp = df[[col1, col2]].dropna()
        temp[col1] = pd.to_numeric(temp[col1], errors="coerce")
        temp[col2] = pd.to_numeric(temp[col2], errors="coerce")
        temp = temp.dropna().head(30)

        scatter_data = [{"x": round(float(row[col1]), 2), "y": round(float(row[col2]), 2)} for _, row in temp.iterrows()]
        if len(scatter_data) >= 3:
            charts.append({
                "id": "numeric_scatter",
                "type": "scatter",
                "title": f"{col1.replace('_', ' ').title()} vs. {col2.replace('_', ' ').title()}",
                "description": f"Bivariate scatter plot demonstrating mutual distribution.",
                "x_key": "x",
                "y_key": "y",
                "x_label": col1.replace('_', ' ').title(),
                "y_label": col2.replace('_', ' ').title(),
                "data": scatter_data,
            })

    # Chart 5: Numeric Distribution / Histogram
    if numeric_cols and len(charts) < 4:
        n_col = numeric_cols[-1]
        s = pd.to_numeric(df[n_col], errors="coerce").dropna()
        if len(s) >= 4:
            counts, bin_edges = np.histogram(s, bins=min(6, len(s)))
            hist_data = []
            for i in range(len(counts)):
                label = f"{bin_edges[i]:.0f}-{bin_edges[i+1]:.0f}"
                hist_data.append({"bin": label, "count": int(counts[i])})

            charts.append({
                "id": "numeric_histogram",
                "type": "histogram",
                "title": f"Frequency Distribution: {n_col.replace('_', ' ').title()}",
                "description": f"Binned frequency histogram of {n_col}.",
                "x_key": "bin",
                "y_key": "count",
                "data": hist_data,
            })

    return charts


# ==========================================================
# Dynamic Executive Summary & Recommendations
# ==========================================================

def generate_executive_summary_text(
    df: pd.DataFrame,
    domain: str,
    profile: dict,
    metrics: list[dict],
    quality: dict,
) -> tuple[str, list[str]]:
    rows = profile.get("rows", 0)
    cols = profile.get("columns", 0)
    num_cnt = len(profile.get("numeric_columns", []))
    cat_cnt = len(profile.get("categorical_columns", []))
    date_cnt = len(profile.get("date_columns", []))
    score = quality.get("score", 100)

    # Narrative paragraph
    if domain == "sales":
        rev_m = next((m for m in metrics if m["id"] == "revenue"), None)
        prof_m = next((m for m in metrics if m["id"] == "profit"), None)
        margin_m = next((m for m in metrics if m["id"] == "margin"), None)

        rev_text = f"generating a cumulative revenue of {rev_m['formatted']}" if rev_m else "recording transactions"
        prof_text = f" with {prof_m['formatted']} in net profits ({margin_m['formatted']} margin)" if prof_m and margin_m else ""
        narrative = (
            f"InsightAI performed a comprehensive operational audit on this sales dataset, "
            f"encompassing {rows:,} transactions across {cols} recorded dimensions. The business activity demonstrates "
            f"strong commercial velocity, {rev_text}{prof_text}. Data cleanliness evaluated at a {quality['rating'].lower()} "
            f"quality score of {score}/100, providing high statistical confidence for commercial planning."
        )
    elif domain == "education":
        avg_s = next((m for m in metrics if "score" in m["id"] or "marks" in m["id"]), None)
        narrative = (
            f"This academic performance audit evaluates {rows:,} student records across {cols} curricular dimensions. "
            f"The cohort demonstrates measurable educational outcomes"
            + (f" with a cohort benchmark of {avg_s['formatted']}." if avg_s else ".")
            + f" Overall data hygiene registers at {score}/100 ({quality['rating']}), verifying dataset integrity for grading analysis."
        )
    elif domain == "hr":
        avg_sal = next((m for m in metrics if m["id"] == "avg_salary"), None)
        narrative = (
            f"This human resources and organizational audit examines {rows:,} employee profiles across {cols} organizational parameters. "
            f"Workforce metrics indicate active team allocation"
            + (f" with an average compensation benchmark of {avg_sal['formatted']}." if avg_sal else ".")
            + f" Dataset hygiene achieves an index of {score}/100 ({quality['rating']})."
        )
    else:
        narrative = (
            f"InsightAI completed a multi-dimensional structural audit of the uploaded dataset containing {rows:,} records "
            f"across {cols} features ({num_cnt} numerical, {cat_cnt} categorical, {date_cnt} date fields). "
            f"The dataset integrity registers a quality score of {score}/100 ({quality['rating']}), "
            f"providing an analytical baseline across observed dimensions."
        )

    # Key highlights bullet points
    highlights = [
        f"Structural Volume: {rows:,} observations across {cols} dimensions ({num_cnt} numeric, {cat_cnt} categorical, {date_cnt} date).",
        f"Data Completeness: {quality['missing_values']} missing values and {quality['duplicate_rows']} duplicate records detected.",
    ]

    for m in metrics[:2]:
        highlights.append(f"{m['label']}: {m['formatted']} ({m['subtitle']}).")

    return narrative, highlights


def generate_recommendations(
    df: pd.DataFrame,
    domain: str,
    profile: dict,
    quality: dict,
    correlation: dict,
) -> list[dict[str, str]]:
    recs = []

    # Quality recommendation
    if quality["score"] < 85:
        recs.append({
            "title": "Address Data Hygiene Gaps",
            "description": f"The dataset holds a quality score of {quality['score']}/100. Resolve missing fields and duplicate entries to optimize analytical accuracy.",
            "type": "hygiene",
        })
    else:
        recs.append({
            "title": "Maintain High Data Integrity",
            "description": f"The dataset exhibits excellent data quality ({quality['score']}/100). The dataset is primed for advanced reporting and machine learning workflows.",
            "type": "hygiene",
        })

    # Correlation recommendation
    if correlation.get("has_correlation") and correlation.get("pairs"):
        top_pair = correlation["pairs"][0]
        recs.append({
            "title": f"Leverage Strong Correlation: {top_pair['col1']} & {top_pair['col2']}",
            "description": f"{top_pair['description']} Utilize this strong relationship to build predictive models or baseline expectations.",
            "type": "correlation",
        })

    # Domain specific recommendation
    if domain == "sales":
        recs.append({
            "title": "Product Portfolio Optimization",
            "description": "Analyze top revenue generating items against bottom performers to refine inventory allocation and promotional budgets.",
            "type": "business",
        })
    elif domain == "education":
        recs.append({
            "title": "Targeted Academic Interventions",
            "description": "Review students falling below the cohort mean to provide tailored tutoring and targeted academic reinforcement.",
            "type": "education",
        })
    elif domain == "hr":
        recs.append({
            "title": "Departmental Compensation Equity",
            "description": "Examine wage variances across functional teams to ensure competitive and equitable remuneration frameworks.",
            "type": "hr",
        })
    else:
        recs.append({
            "title": "Dimensional Feature Exploration",
            "description": "Investigate high-variance categorical groups to uncover hidden clusters and operational patterns.",
            "type": "general",
        })

    return recs


# ==========================================================
# Main Report Aggregator
# ==========================================================

def get_full_report() -> dict[str, Any]:
    df = get_dataset()
    metadata = get_dataset_metadata()
    profile = profile_dataframe(df)

    filename = metadata.get("filename", "dataset.csv")
    uploaded_at = metadata.get("uploaded_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Detect domain
    domain = detect_domain(df)

    # Key Metrics
    metrics = generate_key_metrics(df, domain, profile)

    # Statistical Summary
    stat_summary = generate_statistical_summary(df, profile.get("numeric_columns", []))

    # Categorical Analysis
    cat_analysis = generate_categorical_analysis(df, profile.get("categorical_columns", []))

    # Correlation
    correlation = compute_correlation_analysis(df, profile.get("numeric_columns", []))

    # Data Quality
    quality = compute_data_quality(df, profile)

    # Charts
    charts = generate_visual_analysis(df, profile)

    # Executive Summary & Recommendations
    exec_text, exec_highlights = generate_executive_summary_text(df, domain, profile, metrics, quality)
    recommendations = generate_recommendations(df, domain, profile, quality, correlation)

    # Rule-based Insights from existing service
    insights_data = []
    try:
        raw_insights = generate_insights()
        insights_data = raw_insights.get("insights", [])
    except Exception:
        # Fallback if domain is non-sales and generate_insights had an issue
        insights_data = []

    # If insights_data is empty or domain is non-sales, generate adaptive domain insights
    if not insights_data:
        if quality["score"] >= 90:
            insights_data.append({
                "type": "data_quality",
                "severity": "positive",
                "title": "Outstanding Dataset Cleanliness",
                "description": f"Zero or negligible missing data detected across {profile.get('rows', 0)} rows and {profile.get('columns', 0)} dimensions.",
                "recommendation": "Dataset is verified for production analytics.",
            })
        if correlation.get("has_correlation") and correlation.get("pairs"):
            p = correlation["pairs"][0]
            insights_data.append({
                "type": "correlation",
                "severity": "medium",
                "title": f"Notable Relationship: {p['col1']} ↔ {p['col2']}",
                "description": p["description"],
                "recommendation": "Incorporate this paired relationship into strategic decision models.",
            })
        if cat_analysis:
            c = cat_analysis[0]
            insights_data.append({
                "type": "distribution",
                "severity": "positive" if c["most_frequent_pct"] < 60 else "medium",
                "title": f"Concentration in {c['column']}",
                "description": f"Dominant category '{c['most_frequent']}' represents {c['most_frequent_pct']}% of records.",
                "recommendation": f"Monitor diversity within {c['column']} to prevent over-reliance on a single segment.",
            })

    # Memory in formatted string
    mem_bytes = int(df.memory_usage(deep=True).sum())
    mem_formatted = f"{mem_bytes / 1024:.1f} KB" if mem_bytes < 1024 * 1024 else f"{mem_bytes / (1024 * 1024):.2f} MB"

    return {
        "success": True,
        "dataset_info": {
            "name": filename,
            "uploaded_at": uploaded_at,
            "rows": profile.get("rows", 0),
            "columns": profile.get("columns", 0),
            "domain": domain,
            "memory_usage": mem_formatted,
            "memory_bytes": mem_bytes,
        },
        "executive_summary": {
            "narrative": exec_text,
            "highlights": exec_highlights,
        },
        "key_metrics": metrics,
        "dataset_overview": {
            "rows": profile.get("rows", 0),
            "columns": profile.get("columns", 0),
            "numeric_count": len(profile.get("numeric_columns", [])),
            "categorical_count": len(profile.get("categorical_columns", [])),
            "date_count": len(profile.get("date_columns", [])),
            "missing_values": profile.get("missing_values", 0),
            "duplicate_rows": profile.get("duplicate_rows", 0),
            "memory_usage": mem_formatted,
            "column_details": profile.get("column_details", []),
        },
        "visual_analysis": charts,
        "statistical_summary": stat_summary,
        "categorical_analysis": cat_analysis,
        "correlation_analysis": correlation,
        "data_quality": quality,
        "insights": insights_data,
        "recommendations": recommendations,
    }


# ==========================================================
# PDF Report Generator (ReportLab)
# ==========================================================

def clean_pdf_text(text: Any) -> str:
    if text is None:
        return ""
    val = str(text)
    return val.replace("₹", "Rs. ")


def build_pdf_report(report_data: dict[str, Any]) -> bytes:
    """
    Generate a professional multi-page PDF report using ReportLab.
    """
    buffer = io.BytesIO()

    # Document setup: Letter, 0.5 inch margins for professional layout
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0f172a")  # slate-900
    accent_color = colors.HexColor("#4f46e5")   # indigo-600
    light_bg = colors.HexColor("#f8fafc")       # slate-50
    border_color = colors.HexColor("#e2e8f0")   # slate-200
    text_muted = colors.HexColor("#64748b")     # slate-500

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=text_muted,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
    )

    small_style = ParagraphStyle(
        "DocSmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=text_muted,
    )

    th_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    td_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1e293b"),
    )

    elements = []

    ds_info = report_data.get("dataset_info", {})
    filename = ds_info.get("name", "Dataset")
    uploaded_at = ds_info.get("uploaded_at", datetime.now().strftime("%Y-%m-%d"))
    rows = ds_info.get("rows", 0)
    cols = ds_info.get("columns", 0)

    # 1. Header Banner
    header_table = Table(
        [
            [
                Paragraph("<b>InsightAI</b> &bull; Business Intelligence Report", title_style),
                Paragraph(f"<b>Generated:</b> {uploaded_at}<br/><b>Dataset:</b> {filename}", subtitle_style),
            ]
        ],
        colWidths=[340, 200],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(header_table)

    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceBefore=4, spaceAfter=10))

    # Meta banner bar
    meta_bar = Table(
        [
            [
                Paragraph(f"<b>Records:</b> {rows:,}", body_style),
                Paragraph(f"<b>Attributes:</b> {cols}", body_style),
                Paragraph(f"<b>Domain:</b> {ds_info.get('domain', 'Generic').title()}", body_style),
                Paragraph(f"<b>Memory:</b> {ds_info.get('memory_usage', 'N/A')}", body_style),
                Paragraph(f"<b>Quality Score:</b> {report_data.get('data_quality', {}).get('score', 100)}/100", body_style),
            ]
        ],
        colWidths=[108, 108, 108, 108, 108],
    )
    meta_bar.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), light_bg),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_bar)

    # 2. Executive Summary
    elements.append(Paragraph("1. Executive Summary", section_heading))
    exec_summary = report_data.get("executive_summary", {})
    elements.append(Paragraph(clean_pdf_text(exec_summary.get("narrative", "")), body_style))
    elements.append(Spacer(1, 6))

    highlights = exec_summary.get("highlights", [])
    if highlights:
        hl_rows = [[Paragraph(f"&bull; {clean_pdf_text(hl)}", body_style)] for hl in highlights]
        hl_table = Table(hl_rows, colWidths=[540])
        hl_table.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elements.append(hl_table)

    elements.append(Spacer(1, 8))

    # 3. Key Metrics
    elements.append(Paragraph("2. Key Operational Metrics", section_heading))
    metrics = report_data.get("key_metrics", [])
    if metrics:
        metric_cells = []
        for m in metrics:
            cell_p = Paragraph(
                f"<b>{clean_pdf_text(m['label'])}</b><br/><font size=12 color='#0f172a'><b>{clean_pdf_text(m['formatted'])}</b></font><br/><font size=7 color='#64748b'>{clean_pdf_text(m['subtitle'])}</font>",
                body_style,
            )
            metric_cells.append(cell_p)

        # Pad to 4 if needed
        while len(metric_cells) < 4:
            metric_cells.append(Paragraph("", body_style))

        metric_table = Table([metric_cells[:4]], colWidths=[135, 135, 135, 135])
        metric_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(metric_table)

    elements.append(Spacer(1, 8))

    # 4. Dataset Overview & Columns
    elements.append(Paragraph("3. Dataset Schema & Column Inventory", section_heading))
    col_details = report_data.get("dataset_overview", {}).get("column_details", [])
    if col_details:
        t_rows = [[
            Paragraph("Column Name", th_style),
            Paragraph("Detected Type", th_style),
            Paragraph("Data Type", th_style),
            Paragraph("Missing", th_style),
            Paragraph("Unique Values", th_style),
        ]]
        for c in col_details[:14]:  # Top 14 columns for neat page fitting
            t_rows.append([
                Paragraph(str(c.get("name")), td_style),
                Paragraph(str(c.get("detected_type", "")).title(), td_style),
                Paragraph(str(c.get("dtype")), td_style),
                Paragraph(str(c.get("missing")), td_style),
                Paragraph(str(c.get("unique")), td_style),
            ])

        col_table = Table(t_rows, colWidths=[150, 100, 100, 90, 100])
        col_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), primary_color),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
        ]))
        elements.append(col_table)

    elements.append(Spacer(1, 8))

    # 5. Statistical Summary
    stat_summary = report_data.get("statistical_summary", [])
    if stat_summary:
        elements.append(Paragraph("4. Statistical Summary (Numeric Features)", section_heading))
        s_rows = [[
            Paragraph("Column", th_style),
            Paragraph("Mean", th_style),
            Paragraph("Median", th_style),
            Paragraph("Min", th_style),
            Paragraph("Max", th_style),
            Paragraph("Std Dev", th_style),
        ]]
        for s in stat_summary[:10]:
            s_rows.append([
                Paragraph(str(s.get("column")), td_style),
                Paragraph(f"{s.get('mean'):,.2f}", td_style),
                Paragraph(f"{s.get('median'):,.2f}", td_style),
                Paragraph(f"{s.get('min'):,.2f}", td_style),
                Paragraph(f"{s.get('max'):,.2f}", td_style),
                Paragraph(f"{s.get('std_dev'):,.2f}", td_style),
            ])

        stat_table = Table(s_rows, colWidths=[140, 80, 80, 80, 80, 80])
        stat_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), primary_color),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
        ]))
        elements.append(stat_table)
        elements.append(Spacer(1, 8))

    # 6. Data Quality & Health Score
    quality = report_data.get("data_quality", {})
    elements.append(Paragraph("5. Data Quality Scorecard", section_heading))
    q_score = quality.get("score", 100)
    q_rating = quality.get("rating", "Good")

    q_info = Paragraph(
        f"<b>Quality Index:</b> {q_score}/100 &bull; <b>Rating:</b> {q_rating} &bull; "
        f"<b>Missing Values:</b> {quality.get('missing_values', 0)} &bull; "
        f"<b>Duplicates:</b> {quality.get('duplicate_rows', 0)}",
        body_style,
    )
    elements.append(q_info)
    elements.append(Spacer(1, 4))

    deductions = quality.get("deductions", [])
    if deductions:
        d_rows = [[
            Paragraph("Quality Check", th_style),
            Paragraph("Status", th_style),
            Paragraph("Audit Finding", th_style),
        ]]
        for d in deductions:
            status_text = "PASSED" if d.get("status") == "pass" else ("WARNING" if d.get("status") == "warn" else "DEDUCTION")
            d_rows.append([
                Paragraph(clean_pdf_text(d.get("check")), td_style),
                Paragraph(f"<b>{status_text}</b>", td_style),
                Paragraph(clean_pdf_text(d.get("message")), td_style),
            ])

        q_table = Table(d_rows, colWidths=[140, 80, 320])
        q_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), primary_color),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_bg]),
        ]))
        elements.append(q_table)

    elements.append(Spacer(1, 8))

    # 7. Insights & Recommendations
    elements.append(Paragraph("6. Key Insights & Findings", section_heading))
    insights = report_data.get("insights", [])
    if insights:
        ins_rows = []
        for ins in insights[:5]:
            sev = ins.get("severity", "medium").upper()
            title = clean_pdf_text(ins.get('title'))
            desc = clean_pdf_text(ins.get('description'))
            rec = clean_pdf_text(ins.get('recommendation'))
            ins_rows.append([
                Paragraph(
                    f"<b>[{sev}] {title}</b><br/>{desc}<br/><font color='#4f46e5'><b>Action:</b> {rec}</font>",
                    body_style,
                )
            ])
        ins_table = Table(ins_rows, colWidths=[540])
        ins_table.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, border_color),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, light_bg]),
        ]))
        elements.append(ins_table)

    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=4, spaceAfter=6))
    elements.append(Paragraph("InsightAI Analytics Platform &bull; Confidential Data Audit &bull; Generated Automatically", small_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
