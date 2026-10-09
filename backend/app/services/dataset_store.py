import json
import os
import uuid
from datetime import datetime
from pathlib import Path
import pandas as pd

# Storage directories
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_FILE = DATA_DIR / "history.json"
ACTIVE_FILE = DATA_DIR / "active.json"

_dataset: pd.DataFrame | None = None
_active_id: str | None = None
_filename: str = "dataset.csv"
_uploaded_at: str | None = None
_file_size: int = 0


def _load_active_from_disk() -> bool:
    global _dataset, _active_id, _filename, _uploaded_at, _file_size
    try:
        if not ACTIVE_FILE.exists():
            return False

        with open(ACTIVE_FILE, "r", encoding="utf-8") as f:
            active_info = json.load(f)

        dataset_id = active_info.get("id")
        if not dataset_id:
            return False

        pkl_path = DATA_DIR / f"{dataset_id}.pkl"
        if not pkl_path.exists():
            return False

        df = pd.read_pickle(pkl_path)
        _dataset = df
        _active_id = dataset_id
        _filename = active_info.get("filename", "dataset.csv")
        _uploaded_at = active_info.get("uploaded_at")
        _file_size = active_info.get("file_size", 0)
        return True
    except Exception as e:
        print(f"Warning: Failed to load active dataset from disk: {e}")
        return False


# Try to initialize from disk on startup
_load_active_from_disk()


def set_dataset(
    df: pd.DataFrame,
    filename: str = "dataset.csv",
    file_size: int = 0,
) -> str:
    global _dataset, _active_id, _filename, _uploaded_at, _file_size

    dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
    uploaded_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Save dataframe pickle to disk
    pkl_path = DATA_DIR / f"{dataset_id}.pkl"
    df.to_pickle(pkl_path)

    # 2. Update active in-memory state
    _dataset = df.copy()
    _active_id = dataset_id
    _filename = filename
    _file_size = file_size
    _uploaded_at = uploaded_at

    # 3. Save active info to active.json
    active_data = {
        "id": dataset_id,
        "filename": filename,
        "uploaded_at": uploaded_at,
        "file_size": file_size,
    }
    with open(ACTIVE_FILE, "w", encoding="utf-8") as f:
        json.dump(active_data, f, indent=2)

    # 4. Update history.json
    history = []
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    # Mark all others as inactive
    for item in history:
        item["is_active"] = False

    # Prepend new entry
    new_entry = {
        "id": dataset_id,
        "filename": filename,
        "uploaded_at": uploaded_at,
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "file_size": file_size,
        "is_active": True,
    }
    history.insert(0, new_entry)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return dataset_id


def get_dataset() -> pd.DataFrame:
    global _dataset
    if _dataset is None or _dataset.empty:
        if not _load_active_from_disk():
            raise ValueError("No dataset has been uploaded.")

    if _dataset is None:
        raise ValueError("No dataset has been uploaded.")

    return _dataset.copy()


def get_dataset_metadata() -> dict:
    if _dataset is None and not _load_active_from_disk():
        return {
            "id": None,
            "filename": _filename,
            "uploaded_at": _uploaded_at,
            "file_size": _file_size,
        }

    return {
        "id": _active_id,
        "filename": _filename,
        "uploaded_at": _uploaded_at,
        "file_size": _file_size,
    }


def get_filename() -> str:
    return _filename or "dataset.csv"


def has_dataset() -> bool:
    if _dataset is not None and not _dataset.empty:
        return True
    return _load_active_from_disk()


def get_history() -> list[dict]:
    if not HISTORY_FILE.exists():
        return []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            history = json.load(f)

        # Synchronize is_active flag with current active_id
        for item in history:
            item["is_active"] = bool(_active_id and item.get("id") == _active_id)

        return history
    except Exception:
        return []


def activate_dataset(dataset_id: str) -> dict:
    global _dataset, _active_id, _filename, _uploaded_at, _file_size

    pkl_path = DATA_DIR / f"{dataset_id}.pkl"
    if not pkl_path.exists():
        raise ValueError(f"Dataset {dataset_id} was not found on disk.")

    df = pd.read_pickle(pkl_path)
    if df.empty:
        raise ValueError("Selected dataset is empty.")

    history = get_history()
    target_entry = next((item for item in history if item.get("id") == dataset_id), None)
    filename = target_entry.get("filename", "dataset.csv") if target_entry else "dataset.csv"
    uploaded_at = target_entry.get("uploaded_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S")) if target_entry else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_size = target_entry.get("file_size", 0) if target_entry else 0

    _dataset = df.copy()
    _active_id = dataset_id
    _filename = filename
    _uploaded_at = uploaded_at
    _file_size = file_size

    # Update active.json
    active_data = {
        "id": dataset_id,
        "filename": filename,
        "uploaded_at": uploaded_at,
        "file_size": file_size,
    }
    with open(ACTIVE_FILE, "w", encoding="utf-8") as f:
        json.dump(active_data, f, indent=2)

    # Update history.json
    for item in history:
        item["is_active"] = (item.get("id") == dataset_id)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return {
        "id": dataset_id,
        "filename": filename,
        "uploaded_at": uploaded_at,
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "df": _dataset,
    }


def delete_dataset(dataset_id: str) -> dict:
    global _dataset, _active_id, _filename, _uploaded_at, _file_size

    # 1. Remove pickle file if it exists
    pkl_path = DATA_DIR / f"{dataset_id}.pkl"
    if pkl_path.exists():
        try:
            pkl_path.unlink()
        except Exception:
            pass

    # 2. Update history.json
    history = get_history()
    was_active = False
    new_history = []
    for item in history:
        if item.get("id") == dataset_id:
            if item.get("is_active"):
                was_active = True
        else:
            new_history.append(item)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(new_history, f, indent=2)

    # 3. If deleted dataset was active, activate next or reset
    activated_next = None
    if _active_id == dataset_id or was_active:
        if new_history:
            next_id = new_history[0]["id"]
            activated_next = activate_dataset(next_id)
        else:
            _dataset = None
            _active_id = None
            _filename = "dataset.csv"
            _uploaded_at = None
            _file_size = 0
            if ACTIVE_FILE.exists():
                try:
                    ACTIVE_FILE.unlink()
                except Exception:
                    pass

    return {
        "success": True,
        "deleted_id": dataset_id,
        "remaining_count": len(new_history),
        "activated_next": activated_next["id"] if activated_next else None,
    }

