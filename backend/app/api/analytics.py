from typing import Any
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel

from app.services.analytics import analyze_dataset
from app.services.dataset_store import get_dataset, get_filename
from app.services.column_intelligence import analyze_all_columns
from app.services.dataset_classifier import classify_dataset_type
from app.services.statistics import compute_cross_category_performance, compute_histogram_bins


router = APIRouter(
    prefix="/api",
    tags=["Analytics"],
)


class FilterRequest(BaseModel):
    categorical: dict[str, Any] = {}
    numeric: dict[str, Any] = {}
    date: dict[str, Any] = {}


@router.get("/analyze")
def get_analytics():
    """Retrieve full universal dataset analytics."""
    try:
        data = analyze_dataset()
        return {
            "success": True,
            "analytics": data,
        }
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Analytics failed: {str(error)}",
        )


@router.post("/analyze")
def filter_analytics(filters: FilterRequest):
    """Retrieve filtered dataset analytics."""
    try:
        filter_dict = {
            "categorical": filters.categorical,
            "numeric": filters.numeric,
            "date": filters.date,
        }
        data = analyze_dataset(filter_dict)
        return {
            "success": True,
            "analytics": data,
        }
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Analytics failed: {str(error)}",
        )


@router.get("/dataset")
def get_dataset_summary():
    """Retrieve dataset metadata and domain classification."""
    df = get_dataset()
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")

    columns_intel = analyze_all_columns(df)
    domain_intel = classify_dataset_type(df, columns_intel)

    return {
        "success": True,
        "dataset": {
            "name": get_filename() or "dataset.csv",
            "rows": len(df),
            "columns": len(df.columns),
            "type": domain_intel["dataset_type"],
            "confidence": domain_intel["dataset_confidence"],
            "icon": domain_intel["category_icon"],
            "description": domain_intel["description"],
        },
        "columns": columns_intel,
    }


@router.get("/columns")
def get_columns_intel():
    """Retrieve deep column semantic intelligence."""
    df = get_dataset()
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")

    return {
        "success": True,
        "columns": analyze_all_columns(df),
    }


@router.get("/category-performance")
def get_category_performance(
    category_col: str = Query(..., description="Categorical dimension column name"),
    metric_col: str = Query(..., description="Numeric metric column name"),
):
    """Compute aggregate metric statistics grouped by a categorical column."""
    df = get_dataset()
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")

    data = compute_cross_category_performance(df, category_col, metric_col)
    return {
        "success": True,
        "category_col": category_col,
        "metric_col": metric_col,
        "data": data,
    }


@router.get("/distribution")
def get_distribution(
    metric_col: str = Query(..., description="Numeric metric column name"),
    bins_count: int = Query(12, description="Number of histogram bins"),
):
    """Compute distribution histogram bins for a numeric metric."""
    df = get_dataset()
    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")

    if metric_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{metric_col}' not found.")

    bins = compute_histogram_bins(df[metric_col], bins_count=bins_count)
    return {
        "success": True,
        "metric_col": metric_col,
        "bins": bins,
    }