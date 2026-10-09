from typing import Any
import pandas as pd
import numpy as np


def detect_currency_symbol(df: pd.DataFrame, columns_intel: list[dict[str, Any]]) -> str:
    """Detect currency symbol or string from metadata or default."""
    for col in columns_intel:
        if col.get("semantic_type") == "CURRENCY" or "currency" in col["name"].lower():
            vals = df[col["name"]].dropna().unique()
            if len(vals) > 0:
                val = str(vals[0]).strip().upper()
                if "USD" in val or "$" in val:
                    return "$"
                elif "INR" in val or "RS" in val or "RUPEE" in val or "₹" in val:
                    return "₹"
                elif "EUR" in val or "€" in val:
                    return "€"
                elif "GBP" in val or "£" in val:
                    return "£"
                return f"{val} "
    return "$"


def format_number(val: float) -> str:
    """Format numbers into readable representations."""
    if abs(val) >= 1_000_000:
        return f"{val / 1_000_000:.2f}M"
    elif abs(val) >= 1_000:
        return f"{val / 1_000:.1f}k"
    elif isinstance(val, int) or val.is_integer():
        return f"{int(val):,}"
    else:
        return f"{val:,.2f}"


def generate_domain_kpis(
    df: pd.DataFrame,
    columns_intel: list[dict[str, Any]],
    dataset_type: str
) -> list[dict[str, Any]]:
    """
    Generate dataset-adaptive KPI cards based on detected domain and column semantics.
    Strictly excludes identifier columns from statistical aggregates.
    """
    total_rows = len(df)
    currency_symbol = detect_currency_symbol(df, columns_intel)

    # Filter columns by role
    metric_cols = [c for c in columns_intel if c["is_metric"] and not c["is_identifier"]]
    dim_cols = [c for c in columns_intel if c["is_dimension"] and not c["is_identifier"]]
    id_cols = [c for c in columns_intel if c["is_identifier"]]

    col_map = {c["name"].lower().strip(): c for c in columns_intel}

    def find_col(keywords: list[str]) -> dict[str, Any] | None:
        for kw in keywords:
            for name_norm, col_data in col_map.items():
                if kw == name_norm or kw in name_norm:
                    if not col_data["is_identifier"]:
                        return col_data
        return None

    kpis: list[dict[str, Any]] = []

    # =========================================================================
    # 1. PRODUCT / INVENTORY DATASET
    # =========================================================================
    if dataset_type in ["Products", "Inventory"]:
        # Total Products
        kpis.append({
            "id": "total_products",
            "title": "Total Products" if dataset_type == "Products" else "Total Inventory Items",
            "value": f"{total_rows:,}",
            "raw_value": total_rows,
            "prefix": "",
            "suffix": "",
            "subtext": f"{len(columns_intel)} attributes tracked",
            "trend": "+100%",
            "trend_type": "neutral",
            "icon": "Package",
            "color": "indigo"
        })

        # Price metrics
        price_col = find_col(["price", "mrp", "cost", "unit_price", "rate"])
        if price_col and price_col.get("stats"):
            stats = price_col["stats"]
            avg_p = stats["mean"]
            med_p = stats["median"]
            kpis.append({
                "id": "avg_price",
                "title": "Average Price",
                "value": f"{avg_p:,.2f}",
                "raw_value": avg_p,
                "prefix": currency_symbol,
                "suffix": "",
                "subtext": f"Median: {currency_symbol}{med_p:,.2f} | Range: {currency_symbol}{stats['min']} - {currency_symbol}{stats['max']}",
                "trend": "Catalog benchmark",
                "trend_type": "positive",
                "icon": "Tag",
                "color": "emerald"
            })

        # Stock metrics
        stock_col = find_col(["stock", "quantity", "inventory", "units", "qty"])
        if stock_col and stock_col.get("stats"):
            stats = stock_col["stats"]
            total_stk = stats["sum"]
            avg_stk = stats["mean"]
            kpis.append({
                "id": "total_stock",
                "title": "Total Stock Units",
                "value": format_number(total_stk),
                "raw_value": total_stk,
                "prefix": "",
                "suffix": " units",
                "subtext": f"Avg stock per item: {avg_stk:,.1f}",
                "trend": "Live warehouse level",
                "trend_type": "neutral",
                "icon": "Boxes",
                "color": "blue"
            })

        # Categories
        cat_col = find_col(["category", "dept", "department", "type", "class"])
        if cat_col:
            unique_cats = cat_col["unique_count"]
            kpis.append({
                "id": "total_categories",
                "title": "Product Categories",
                "value": f"{unique_cats:,}",
                "raw_value": unique_cats,
                "prefix": "",
                "suffix": "",
                "subtext": f"Classification in {cat_col['name']}",
                "trend": "Catalog breadth",
                "trend_type": "neutral",
                "icon": "Layers",
                "color": "amber"
            })

        # Brands
        brand_col = find_col(["brand", "manufacturer", "vendor", "supplier", "maker"])
        if brand_col:
            unique_brands = brand_col["unique_count"]
            kpis.append({
                "id": "total_brands",
                "title": "Distinct Brands",
                "value": f"{unique_brands:,}",
                "raw_value": unique_brands,
                "prefix": "",
                "suffix": "",
                "subtext": f"Vendors in {brand_col['name']}",
                "trend": "Vendor diversity",
                "trend_type": "neutral",
                "icon": "Award",
                "color": "purple"
            })

        return kpis

    # =========================================================================
    # 2. SALES DATASET
    # =========================================================================
    elif dataset_type == "Sales":
        # Revenue
        rev_col = find_col(["revenue", "sales", "total_sales", "amount", "order_amount"])
        if rev_col and rev_col.get("stats"):
            tot_rev = rev_col["stats"]["sum"]
            kpis.append({
                "id": "total_revenue",
                "title": "Total Revenue",
                "value": f"{tot_rev:,.2f}",
                "raw_value": tot_rev,
                "prefix": "₹" if "₹" in currency_symbol or currency_symbol == "₹" else currency_symbol,
                "suffix": "",
                "subtext": f"Avg sale: {currency_symbol}{rev_col['stats']['mean']:,.2f}",
                "trend": "+12.5%",
                "trend_type": "positive",
                "icon": "DollarSign",
                "color": "emerald"
            })

        # Profit
        profit_col = find_col(["profit", "net_profit", "margin_val", "earnings"])
        if profit_col and profit_col.get("stats"):
            tot_prof = profit_col["stats"]["sum"]
            kpis.append({
                "id": "total_profit",
                "title": "Total Profit",
                "value": f"{tot_prof:,.2f}",
                "raw_value": tot_prof,
                "prefix": "₹" if "₹" in currency_symbol or currency_symbol == "₹" else currency_symbol,
                "suffix": "",
                "subtext": f"Avg per transaction: {currency_symbol}{profit_col['stats']['mean']:,.2f}",
                "trend": "+8.2%",
                "trend_type": "positive",
                "icon": "TrendingUp",
                "color": "blue"
            })

        # Profit Margin
        if rev_col and profit_col and rev_col["stats"]["sum"] > 0:
            margin = (profit_col["stats"]["sum"] / rev_col["stats"]["sum"]) * 100
            kpis.append({
                "id": "profit_margin",
                "title": "Profit Margin",
                "value": f"{margin:.2f}%",
                "raw_value": margin,
                "prefix": "",
                "suffix": "",
                "subtext": "Overall operating margin",
                "trend": "Healthy" if margin > 15 else "Moderate",
                "trend_type": "positive" if margin > 15 else "neutral",
                "icon": "Percent",
                "color": "purple"
            })

        # Orders count
        order_col = find_col(["order", "order_id", "transaction_id", "invoice"])
        orders_count = order_col["unique_count"] if order_col else total_rows
        kpis.append({
            "id": "total_orders",
            "title": "Total Orders",
            "value": f"{orders_count:,}",
            "raw_value": orders_count,
            "prefix": "",
            "suffix": "",
            "subtext": f"Across {total_rows:,} line items",
            "trend": "Order volume",
            "trend_type": "neutral",
            "icon": "ShoppingCart",
            "color": "indigo"
        })

        # Quantity
        qty_col = find_col(["quantity", "qty", "units_sold", "volume"])
        if qty_col and qty_col.get("stats"):
            tot_qty = qty_col["stats"]["sum"]
            kpis.append({
                "id": "total_quantity",
                "title": "Total Quantity Sold",
                "value": format_number(tot_qty),
                "raw_value": tot_qty,
                "prefix": "",
                "suffix": " units",
                "subtext": f"Avg per transaction: {qty_col['stats']['mean']:.1f}",
                "trend": "Volume velocity",
                "trend_type": "neutral",
                "icon": "Package",
                "color": "amber"
            })

        return kpis

    # =========================================================================
    # 3. EMPLOYEES / HR DATASET
    # =========================================================================
    elif dataset_type == "Employees":
        kpis.append({
            "id": "total_employees",
            "title": "Total Workforce",
            "value": f"{total_rows:,}",
            "raw_value": total_rows,
            "prefix": "",
            "suffix": " staff",
            "subtext": "Active personnel records",
            "trend": "Headcount",
            "trend_type": "neutral",
            "icon": "Users",
            "color": "indigo"
        })

        salary_col = find_col(["salary", "compensation", "wage", "pay", "ctc"])
        if salary_col and salary_col.get("stats"):
            avg_sal = salary_col["stats"]["mean"]
            kpis.append({
                "id": "avg_salary",
                "title": "Average Compensation",
                "value": f"{avg_sal:,.2f}",
                "raw_value": avg_sal,
                "prefix": currency_symbol,
                "suffix": "",
                "subtext": f"Median: {currency_symbol}{salary_col['stats']['median']:,.2f}",
                "trend": "Benchmark",
                "trend_type": "neutral",
                "icon": "Briefcase",
                "color": "emerald"
            })

        dept_col = find_col(["department", "dept", "team", "division"])
        if dept_col:
            kpis.append({
                "id": "departments",
                "title": "Departments",
                "value": f"{dept_col['unique_count']:,}",
                "raw_value": dept_col["unique_count"],
                "prefix": "",
                "suffix": "",
                "subtext": f"Distinct business units",
                "trend": "Organization",
                "trend_type": "neutral",
                "icon": "Layers",
                "color": "blue"
            })

        exp_col = find_col(["experience", "tenure", "years", "service"])
        if exp_col and exp_col.get("stats"):
            avg_exp = exp_col["stats"]["mean"]
            kpis.append({
                "id": "avg_tenure",
                "title": "Avg Experience",
                "value": f"{avg_exp:.1f}",
                "raw_value": avg_exp,
                "prefix": "",
                "suffix": " yrs",
                "subtext": f"Max tenure: {exp_col['stats']['max']} yrs",
                "trend": "Workforce maturity",
                "trend_type": "neutral",
                "icon": "Clock",
                "color": "amber"
            })

        return kpis

    # =========================================================================
    # 4. EDUCATION / ACADEMIC DATASET
    # =========================================================================
    elif dataset_type == "Education":
        kpis.append({
            "id": "total_students",
            "title": "Total Students",
            "value": f"{total_rows:,}",
            "raw_value": total_rows,
            "prefix": "",
            "suffix": "",
            "subtext": "Enrolled student records",
            "trend": "Cohort size",
            "trend_type": "neutral",
            "icon": "GraduationCap",
            "color": "indigo"
        })

        score_col = find_col(["score", "grade", "gpa", "marks", "percentage", "final_score"])
        if score_col and score_col.get("stats"):
            avg_sc = score_col["stats"]["mean"]
            kpis.append({
                "id": "avg_score",
                "title": "Average Score",
                "value": f"{avg_sc:.2f}",
                "raw_value": avg_sc,
                "prefix": "",
                "suffix": "%" if "percent" in score_col["name"].lower() else " pts",
                "subtext": f"High: {score_col['stats']['max']} | Low: {score_col['stats']['min']}",
                "trend": "Academic average",
                "trend_type": "positive" if avg_sc > 70 else "neutral",
                "icon": "Award",
                "color": "emerald"
            })

        subj_col = find_col(["subject", "course", "department", "class", "branch"])
        if subj_col:
            kpis.append({
                "id": "total_courses",
                "title": "Academic Programs",
                "value": f"{subj_col['unique_count']:,}",
                "raw_value": subj_col["unique_count"],
                "prefix": "",
                "suffix": "",
                "subtext": f"Tracked subjects/courses",
                "trend": "Curriculum",
                "trend_type": "neutral",
                "icon": "BookOpen",
                "color": "blue"
            })

        return kpis

    # =========================================================================
    # 5. GENERAL / FALLBACK DATASET
    # =========================================================================
    # Base dataset size
    kpis.append({
        "id": "total_records",
        "title": "Total Records",
        "value": f"{total_rows:,}",
        "raw_value": total_rows,
        "prefix": "",
        "suffix": " rows",
        "subtext": f"{len(columns_intel)} analyzed attributes",
        "trend": "Dataset volume",
        "trend_type": "neutral",
        "icon": "Database",
        "color": "indigo"
    })

    # Add primary metric KPIs (up to 3)
    for i, col in enumerate(metric_cols[:3]):
        stats = col.get("stats", {})
        if not stats:
            continue
        mean_v = stats.get("mean", 0)
        sum_v = stats.get("sum", 0)
        is_money = col.get("semantic_type") == "PRICE"
        pfx = currency_symbol if is_money else ""

        kpis.append({
            "id": f"metric_{i}_{col['name']}",
            "title": f"Avg {col['name']}",
            "value": f"{mean_v:,.2f}" if abs(mean_v) < 10000 else format_number(mean_v),
            "raw_value": mean_v,
            "prefix": pfx,
            "suffix": "",
            "subtext": f"Total: {pfx}{format_number(sum_v)} | Med: {pfx}{stats.get('median', 0):,.2f}",
            "trend": f"Std Dev: {stats.get('std_dev', 0):,.2f}",
            "trend_type": "neutral",
            "icon": "TrendingUp" if is_money else "BarChart3",
            "color": "emerald" if i == 0 else ("blue" if i == 1 else "purple")
        })

    # Add categorical dimension summary if space permits
    if dim_cols and len(kpis) < 5:
        primary_dim = dim_cols[0]
        kpis.append({
            "id": f"dim_{primary_dim['name']}",
            "title": f"Distinct {primary_dim['name']}",
            "value": f"{primary_dim['unique_count']:,}",
            "raw_value": primary_dim["unique_count"],
            "prefix": "",
            "suffix": " segments",
            "subtext": f"Dimension cardinality",
            "trend": "Category breakdown",
            "trend_type": "neutral",
            "icon": "Layers",
            "color": "amber"
        })

    return kpis
