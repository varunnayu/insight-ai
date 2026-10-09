import pandas as pd


def detect_date_columns(df: pd.DataFrame) -> list[str]:
    date_columns = []

    for column in df.columns:
        series = df[column]

        # Already recognized as datetime
        if pd.api.types.is_datetime64_any_dtype(series):
            date_columns.append(column)
            continue

        # Only inspect string/object columns
        if not (
            pd.api.types.is_object_dtype(series)
            or pd.api.types.is_string_dtype(series)
        ):
            continue

        column_name = column.lower()

        # Strong date-name signals
        date_keywords = (
            "date",
            "time",
            "timestamp",
            "created_at",
            "updated_at",
        )

        name_looks_like_date = any(
            keyword in column_name
            for keyword in date_keywords
        )

        # Only check parsing if name looks like date or non-empty sample
        if name_looks_like_date or "year" in column_name or "month" in column_name:
            sample = series.dropna().head(50)
            if len(sample) > 0:
                try:
                    parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
                    valid_ratio = parsed.notna().mean()
                    if valid_ratio >= 0.6:
                        date_columns.append(column)
                except Exception:
                    pass

    return date_columns


def profile_dataframe(df: pd.DataFrame) -> dict:
    date_columns = detect_date_columns(df)

    numeric_columns = df.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    # Remove date columns from categorical columns
    categorical_columns = [
        column
        for column in categorical_columns
        if column not in date_columns
    ]

    missing_values = int(
        df.isnull().sum().sum()
    )

    duplicate_rows = int(
        df.duplicated().sum()
    )

    column_details = []

    for column in df.columns:
        detected_type = "categorical"

        if column in date_columns:
            detected_type = "date"

        elif column in numeric_columns:
            detected_type = "numeric"

        column_details.append(
            {
                "name": column,
                "dtype": str(df[column].dtype),
                "detected_type": detected_type,
                "missing": int(
                    df[column].isnull().sum()
                ),
                "unique": int(
                    df[column].nunique()
                ),
            }
        )

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "date_columns": date_columns,
        "column_details": column_details,
    }