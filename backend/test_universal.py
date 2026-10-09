import io
import pandas as pd
import numpy as np
from app.services.dataset_store import set_dataset
from app.services.analytics import analyze_dataset
from app.services.insights import generate_insights
from app.services.report import get_full_report, build_pdf_report

print("==================================================")
print("RUNNING UNIVERSAL DATASET ANALYTICS TEST SUITE")
print("==================================================")

# TEST 1: Existing sales.csv
print("\n[TEST 1] Testing sales.csv...")
df_sales = pd.read_csv(r"c:\Users\VARUN K T\Downloads\sales.csv")
set_dataset(df_sales, "sales.csv")
res1 = analyze_dataset()
assert res1["dataset"]["type"] == "Sales", f"Expected Sales, got {res1['dataset']['type']}"
assert res1["kpis"][0]["title"] == "Total Revenue"
print("✓ Sales dataset correctly classified with sales KPIs:", [(k["title"], k["value"]) for k in res1["kpis"]])

# TEST 2: products-10000.csv
print("\n[TEST 2] Testing products-10000.csv (10,000 rows)...")
df_prod = pd.read_csv(r"c:\Users\VARUN K T\Downloads\products-10000.csv")
set_dataset(df_prod, "products-10000.csv")
res2 = analyze_dataset()
assert res2["dataset"]["type"] == "Products", f"Expected Products, got {res2['dataset']['type']}"
assert not any("Revenue" in k["title"] or "Profit" in k["title"] for k in res2["kpis"]), "Found revenue/profit in products!"
assert res2["kpis"][0]["title"] == "Total Products"
assert res2["kpis"][0]["value"] == "10,000"
# Confirm identifiers excluded from outliers & correlations
outlier_cols = [o["column"] for o in res2["outliers"]]
assert "Index" not in outlier_cols and "EAN" not in outlier_cols and "Internal ID" not in outlier_cols
corr_cols = res2["correlations"]["columns"]
assert "Index" not in corr_cols and "EAN" not in corr_cols and "Internal ID" not in corr_cols
print("✓ Products dataset correctly classified with Product KPIs:", [(k["title"], k["value"]) for k in res2["kpis"]])
print("✓ Identifiers (Index, EAN, Internal ID) strictly excluded from metrics, correlations, and outliers.")

# TEST 3: Only numeric columns
print("\n[TEST 3] Testing dataset with ONLY numeric columns...")
df_numeric = pd.DataFrame({
    "Metric_A": np.random.randn(100) * 50 + 100,
    "Metric_B": np.random.randn(100) * 10 + 20,
    "Metric_C": np.random.randn(100) * 200 + 500,
})
set_dataset(df_numeric, "pure_numeric.csv")
res3 = analyze_dataset()
assert res3["dataset"]["type"] == "General Structured Data"
assert len(res3["numeric_statistics"]) == 3
assert res3["correlations"]["available"] is True
print("✓ Pure numeric dataset analyzed without errors. Found 3 numeric statistics and correlation matrix.")

# TEST 4: Categorical + Numeric
print("\n[TEST 4] Testing Categorical + Numeric dataset...")
df_cat_num = pd.DataFrame({
    "Department": ["Engineering", "Design", "Marketing", "Sales"] * 25,
    "Performance_Score": np.random.randint(60, 100, 100),
    "Salary": np.random.randint(50000, 150000, 100),
})
set_dataset(df_cat_num, "dept_performance.csv")
res4 = analyze_dataset()
assert len(res4["categorical_breakdowns"]) >= 1
assert len(res4["numeric_statistics"]) >= 2
print("✓ Categorical + Numeric dataset correctly profiled:", [(k["title"], k["value"]) for k in res4["kpis"]])

# TEST 5: Dates + Numeric
print("\n[TEST 5] Testing Dates + Numeric dataset...")
dates = pd.date_range("2024-01-01", periods=60, freq="D")
df_temporal = pd.DataFrame({
    "timestamp": dates.strftime("%Y-%m-%d"),
    "active_users": np.random.randint(500, 2000, 60),
    "api_calls": np.random.randint(10000, 50000, 60),
})
set_dataset(df_temporal, "timeseries.csv")
res5 = analyze_dataset()
assert res5["charts"]["trend_chart"]["available"] is True
print("✓ Temporal date series detected and trend chart generated with 60 datapoints.")

# TEST 6: Dataset with missing values
print("\n[TEST 6] Testing Dataset with Missing Values...")
df_missing = df_cat_num.copy()
df_missing.loc[0:10, "Salary"] = np.nan
df_missing.loc[20:25, "Department"] = np.nan
set_dataset(df_missing, "missing_data.csv")
res6 = analyze_dataset()
assert res6["data_quality"]["total_missing"] > 0
print(f"✓ Missing values detected: {res6['data_quality']['total_missing']} missing cells. Quality Score: {res6['data_quality']['score']}/100")

# TEST 7: Dataset with duplicate rows
print("\n[TEST 7] Testing Dataset with Duplicate Rows...")
df_dup = pd.concat([df_cat_num, df_cat_num.head(20)], ignore_index=True)
set_dataset(df_dup, "duplicate_data.csv")
res7 = analyze_dataset()
assert res7["data_quality"]["duplicate_rows"] == 20
print(f"✓ Duplicate records detected: {res7['data_quality']['duplicate_rows']} duplicate rows. Score: {res7['data_quality']['score']}/100")

# TEST 8: Dataset with heavy identifier columns
print("\n[TEST 8] Testing Dataset with Identifier Columns...")
df_ids = pd.DataFrame({
    "id": range(1, 101),
    "uuid": [f"UUID-{i:04d}" for i in range(100)],
    "ean": [f"978013235088{i:02d}" for i in range(100)],
    "constant_curr": ["USD"] * 100,
    "Amount": np.random.uniform(10, 500, 100),
})
set_dataset(df_ids, "identifiers_dataset.csv")
res8 = analyze_dataset()
id_cols = [c["name"] for c in res8["columns_intelligence"] if c["is_identifier"]]
assert "id" in id_cols and "uuid" in id_cols and "ean" in id_cols
assert "constant_curr" in [c["name"] for c in res8["columns_intelligence"] if c["is_constant"]]
metric_names = [c["name"] for c in res8["columns_intelligence"] if c["is_metric"]]
assert metric_names == ["Amount"]
print("✓ Identifiers isolated:", id_cols)
print("✓ Constant metadata isolated: constant_curr")
print("✓ Only genuine metric identified:", metric_names)

# TEST REPORTS ON PRODUCTS DATASET
print("\n[TEST REPORTS] Testing full report & ReportLab PDF on products-10000.csv...")
set_dataset(df_prod, "products-10000.csv")
rep = get_full_report()
assert rep["success"] is True
pdf_bytes = build_pdf_report(rep)
assert len(pdf_bytes) > 2000
print(f"✓ Full report JSON generated ({len(rep['key_metrics'])} metrics). PDF binary generated ({len(pdf_bytes):,} bytes).")

print("\n==================================================")
print("ALL TEST SCENARIOS PASSED WITH 100% SUCCESS!")
print("==================================================")
