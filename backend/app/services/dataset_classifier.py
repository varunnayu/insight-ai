from typing import Any
import pandas as pd
import re


def classify_dataset_type(df: pd.DataFrame, columns_intel: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Intelligently infer dataset domain/category based on column semantics,
    names, data types, and value characteristics.
    """
    col_names_lower = [col["name"].lower().strip() for col in columns_intel]
    all_names_text = " ".join(col_names_lower)
    semantic_types = [col["semantic_type"] for col in columns_intel]

    # Scores per category
    scores = {
        "Products": 0,
        "Sales": 0,
        "Inventory": 0,
        "Customers": 0,
        "Employees": 0,
        "Education": 0,
        "Finance": 0,
        "Marketing": 0,
        "Healthcare": 0,
        "Real Estate": 0,
        "Web Analytics": 0,
    }

    # Keyword rules and weights
    rules = {
        "Products": [
            ("product", 25), ("brand", 25), ("category", 20), ("price", 20), ("stock", 20),
            ("ean", 20), ("sku", 20), ("color", 15), ("size", 15), ("availability", 20),
            ("item", 10), ("mrp", 15), ("catalog", 15), ("description", 10)
        ],
        "Sales": [
            ("revenue", 30), ("profit", 30), ("order", 25), ("sales", 25), ("margin", 20),
            ("quantity sold", 20), ("discount", 15), ("region", 15), ("customer", 10),
            ("transaction", 15), ("shipping", 15), ("invoice", 20), ("cost", 10)
        ],
        "Inventory": [
            ("warehouse", 30), ("reorder", 30), ("stock", 25), ("supplier", 25),
            ("inventory", 25), ("storage", 20), ("shelf", 20), ("batch", 20), ("lot", 20)
        ],
        "Customers": [
            ("customer", 30), ("churn", 30), ("segment", 25), ("lifetime value", 25),
            ("ltv", 25), ("user", 15), ("demographic", 20), ("loyalty", 20), ("subscription", 20)
        ],
        "Employees": [
            ("employee", 35), ("salary", 30), ("department", 25), ("designation", 25),
            ("hire date", 25), ("experience", 20), ("manager", 20), ("job title", 25),
            ("performance rating", 20), ("compensation", 25), ("staff", 20)
        ],
        "Education": [
            ("student", 35), ("grade", 30), ("gpa", 30), ("score", 25), ("subject", 25),
            ("course", 25), ("attendance", 25), ("semester", 25), ("exam", 25),
            ("teacher", 20), ("faculty", 20), ("class", 15), ("marks", 25)
        ],
        "Finance": [
            ("debit", 30), ("credit", 30), ("balance", 30), ("asset", 25), ("liability", 25),
            ("expense", 25), ("budget", 25), ("account", 20), ("ledger", 25), ("tax", 20)
        ],
        "Marketing": [
            ("campaign", 35), ("clicks", 30), ("impressions", 30), ("ctr", 30), ("cpc", 30),
            ("conversion", 25), ("lead", 25), ("ad spend", 30), ("channel", 20)
        ],
        "Healthcare": [
            ("patient", 35), ("diagnosis", 35), ("doctor", 25), ("hospital", 25),
            ("treatment", 25), ("blood pressure", 25), ("symptoms", 25), ("prescription", 25)
        ],
        "Real Estate": [
            ("property", 35), ("bedroom", 30), ("bathroom", 30), ("sqft", 30),
            ("square feet", 30), ("rent", 30), ("listing", 25), ("realtor", 20)
        ],
        "Web Analytics": [
            ("pageview", 35), ("session", 30), ("bounce rate", 30), ("referrer", 30),
            ("browser", 25), ("visitor", 25), ("traffic", 25), ("device", 20)
        ]
    }

    # Evaluate rules against column names
    for category, pattern_list in rules.items():
        for keyword, weight in pattern_list:
            if any(keyword in col_name for col_name in col_names_lower):
                scores[category] += weight

    # Semantic type reinforcements
    price_count = sum(1 for st in semantic_types if st == "PRICE")
    qty_count = sum(1 for st in semantic_types if st == "QUANTITY")
    score_count = sum(1 for st in semantic_types if st == "SCORE")

    if price_count > 0 and qty_count > 0:
        if "brand" in all_names_text or "category" in all_names_text or "ean" in all_names_text:
            scores["Products"] += 20
        if "revenue" in all_names_text or "profit" in all_names_text:
            scores["Sales"] += 25

    if score_count > 0 and ("student" in all_names_text or "exam" in all_names_text or "marks" in all_names_text):
        scores["Education"] += 25

    # Find highest scoring category
    best_category, max_score = max(scores.items(), key=lambda item: item[1])

    # Determine confidence
    if max_score >= 50:
        confidence = min(0.98, round(0.70 + (max_score / 200.0) * 0.28, 2))
        category_name = best_category
        icon = get_category_icon(best_category)
        description = get_category_description(best_category)
    elif max_score >= 25:
        confidence = round(0.50 + (max_score / 100.0) * 0.20, 2)
        category_name = best_category
        icon = get_category_icon(best_category)
        description = get_category_description(best_category)
    else:
        confidence = 0.40
        category_name = "General Structured Data"
        icon = "Database"
        description = "Universal structured dataset containing diverse metrics and attributes."

    return {
        "dataset_type": category_name,
        "dataset_confidence": confidence,
        "category_icon": icon,
        "description": description,
        "domain_scores": scores
    }


def get_category_icon(category: str) -> str:
    icons = {
        "Products": "Package",
        "Sales": "TrendingUp",
        "Inventory": "Boxes",
        "Customers": "Users",
        "Employees": "Briefcase",
        "Education": "GraduationCap",
        "Finance": "DollarSign",
        "Marketing": "Megaphone",
        "Healthcare": "Activity",
        "Real Estate": "Home",
        "Web Analytics": "Globe",
        "General Structured Data": "Database"
    }
    return icons.get(category, "Database")


def get_category_description(category: str) -> str:
    descriptions = {
        "Products": "E-Commerce & Product catalog inventory dataset.",
        "Sales": "Sales transaction, revenue and profitability dataset.",
        "Inventory": "Warehouse and supply chain inventory dataset.",
        "Customers": "Customer demographic, segment, and lifecycle dataset.",
        "Employees": "Human resources and workforce performance dataset.",
        "Education": "Academic performance, grades, and attendance dataset.",
        "Finance": "Financial ledger, accounting, and transaction dataset.",
        "Marketing": "Marketing campaigns, ad performance, and conversion dataset.",
        "Healthcare": "Medical and clinical health records dataset.",
        "Real Estate": "Property listings and real estate valuation dataset.",
        "Web Analytics": "Website traffic and digital interaction analytics dataset.",
        "General Structured Data": "General structured numerical and categorical dataset."
    }
    return descriptions.get(category, "General structured dataset.")
