from io import BytesIO

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile, Query

from app.services.dataset_store import (
    set_dataset,
    get_dataset,
    has_dataset,
    get_history,
    activate_dataset,
    delete_dataset,
    get_dataset_metadata,
)
from app.services.profiler import profile_dataframe


router = APIRouter(
    prefix="/api",
    tags=["Dataset"],
)


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided.",
        )

    allowed_extensions = (".csv", ".xlsx", ".xls")

    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported.",
        )

   
    try:
        contents = await file.read()

        if file.filename.lower().endswith(".csv"):
            try:
                df = pd.read_csv(BytesIO(contents), encoding="utf-8-sig")
            except UnicodeDecodeError:
                df = pd.read_csv(BytesIO(contents), encoding="cp1252")
        else:
            df = pd.read_excel(BytesIO(contents))

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="The uploaded dataset is empty."
            )

        # Store dataset for analytics and reporting
        dataset_id = set_dataset(
            df,
            filename=file.filename,
            file_size=len(contents)
        )

        profile = profile_dataframe(df)

        return {
            "success": True,
            "id": dataset_id,
            "filename": file.filename,
            "profile": profile,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process dataset: {str(error)}",
        )



@router.get("/history")
def get_dataset_history():
    return {
        "success": True,
        "history": get_history(),
    }


@router.post("/history/{dataset_id}/activate")
def activate_saved_dataset(dataset_id: str):
    try:
        res = activate_dataset(dataset_id)
        profile = profile_dataframe(res["df"])
        return {
            "success": True,
            "id": dataset_id,
            "filename": res["filename"],
            "profile": profile,
        }
    except ValueError as err:
        raise HTTPException(
            status_code=404,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to activate dataset: {str(err)}",
        )


@router.delete("/history/{dataset_id}")
def delete_saved_dataset(dataset_id: str):
    try:
        res = delete_dataset(dataset_id)
        return {
            "success": True,
            "message": f"Dataset {dataset_id} removed from history.",
            "remaining_count": res.get("remaining_count", 0),
            "activated_next": res.get("activated_next"),
        }
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete dataset: {str(err)}",
        )



@router.get("/dataset/status")
def get_status():
    if not has_dataset():
        return {"has_dataset": False}

    meta = get_dataset_metadata()
    try:
        df = get_dataset()
        return {
            "has_dataset": True,
            "id": meta.get("id"),
            "filename": meta.get("filename"),
            "uploaded_at": meta.get("uploaded_at"),
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
        }
    except Exception:
        return {"has_dataset": False}


@router.get("/dataset/preview")
def get_dataset_preview(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=5, le=100),
    search: str = Query(""),
    sort_col: str = Query(""),
    sort_order: str = Query("asc"),
):
    if not has_dataset():
        raise HTTPException(status_code=400, detail="No dataset uploaded.")

    try:
        df = get_dataset()
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))

    total_rows = len(df)
    columns = list(df.columns)

    filtered_df = df
    if search.strip():
        search_term = search.strip().lower()
        mask = pd.Series(False, index=df.index)
        for col in df.columns:
            mask = mask | df[col].astype(str).str.lower().str.contains(search_term, regex=False, na=False)
        filtered_df = df[mask]

    if sort_col and sort_col in filtered_df.columns:
        ascending = sort_order.lower() != "desc"
        try:
            filtered_df = filtered_df.sort_values(by=sort_col, ascending=ascending)
        except Exception:
            pass

    total_filtered = len(filtered_df)
    total_pages = max(1, (total_filtered + page_size - 1) // page_size)
    page = min(page, total_pages)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    sliced = filtered_df.iloc[start_idx:end_idx]

    rows = []
    for _, r in sliced.iterrows():
        row_dict = {}
        for col in columns:
            val = r[col]
            if pd.isna(val):
                row_dict[col] = "-"
            elif isinstance(val, (int, float)):
                row_dict[col] = val
            else:
                row_dict[col] = str(val)
        rows.append(row_dict)

    return {
        "success": True,
        "columns": columns,
        "rows": rows,
        "total_rows": total_rows,
        "filtered_rows": total_filtered,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/dataset/missing-details")
def get_missing_details():
    if not has_dataset():
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
    df = get_dataset()
    total_rows = len(df)
    total_cols = len(df.columns)

    isna_mask = df.isna()
    for col in df.select_dtypes(include=["object"]).columns:
        isna_mask[col] = isna_mask[col] | (df[col].astype(str).str.strip() == "")

    total_missing = int(isna_mask.sum().sum())
    affected_rows = int(isna_mask.any(axis=1).sum())

    missing_summary = []
    for col in df.columns:
        col_missing = int(isna_mask[col].sum())
        missing_summary.append({
            "column": col,
            "missing_count": col_missing,
            "missing_pct": round((col_missing / total_rows) * 100, 2) if total_rows > 0 else 0.0,
        })

    missing_details = []
    for col in df.columns:
        missing_indices = df.index[isna_mask[col]].tolist()
        for idx in missing_indices[:100]:
            missing_details.append({
                "row_number": int(idx) + 1,
                "dataframe_index": int(idx),
                "column_name": col,
                "value_status": "Missing",
            })
            if len(missing_details) >= 500:
                break
        if len(missing_details) >= 500:
            break

    return {
        "success": True,
        "total_rows": total_rows,
        "total_missing": total_missing,
        "affected_rows": affected_rows,
        "missing_summary": missing_summary,
        "missing_details": missing_details,
    }


@router.get("/dataset/duplicate-details")
def get_duplicate_details():
    if not has_dataset():
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
    df = get_dataset()
    total_rows = len(df)

    dup_mask = df.duplicated(keep=False)
    duplicate_rows_count = int(df.duplicated().sum())
    total_duplicate_instances = int(dup_mask.sum())

    sample_dups = []
    if duplicate_rows_count > 0:
        dup_df = df[dup_mask].head(100)
        for idx, row in dup_df.iterrows():
            row_dict = {"_csv_row": int(idx) + 1}
            for col in df.columns[:10]:
                val = row[col]
                row_dict[col] = "-" if pd.isna(val) else str(val)
            sample_dups.append(row_dict)

    return {
        "success": True,
        "total_rows": total_rows,
        "duplicate_count": duplicate_rows_count,
        "total_duplicate_instances": total_duplicate_instances,
        "duplicate_percentage": round((duplicate_rows_count / total_rows) * 100, 2) if total_rows > 0 else 0.0,
        "columns": list(df.columns[:10]),
        "sample_rows": sample_dups,
    }