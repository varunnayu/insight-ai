const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

/* ==========================================================
   Dataset Intelligence & Column Types
========================================================== */

export interface ColumnStatDetails {
    count: number;
    sum: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
    variance: number;
    q25: number;
    q75: number;
    iqr?: number;
    skewness?: number;
}

export interface ColumnIntel {
    name: string;
    dtype: string;
    semantic_type: string;
    role: "identifier" | "metric" | "dimension" | "temporal" | "metadata" | "text";
    unique_count: number;
    unique_ratio: number;
    missing_count: number;
    missing_pct: number;
    is_constant: boolean;
    is_identifier: boolean;
    is_metric: boolean;
    is_dimension: boolean;
    is_date: boolean;
    sample_values: string[];
    constant_value?: string;
    stats?: ColumnStatDetails;
}

export interface ColumnDetail {
    name: string;
    dtype: string;
    detected_type: string;
    missing: number;
    unique: number;
}

export interface DatasetProfile {
    rows: number;
    columns: number;
    missing_values: number;
    duplicate_rows: number;
    numeric_columns: string[];
    categorical_columns: string[];
    date_columns: string[];
    column_details: ColumnDetail[];
}

export interface UploadResponse {
    success: boolean;
    id?: string;
    filename: string;
    profile: DatasetProfile;
}

/* ==========================================================
   Universal Analytics & KPI Types
========================================================== */

export interface KPICard {
    id: string;
    title: string;
    value: string;
    raw_value: number;
    prefix: string;
    suffix: string;
    subtext: string;
    trend: string;
    trend_type: "positive" | "negative" | "neutral";
    icon: string;
    color: string;
}

export interface NumericStat {
    column: string;
    semantic_type: string;
    count: number;
    sum: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
    variance: number;
    q25: number;
    q75: number;
    iqr: number;
    skewness: number;
}

export interface DistributionBin {
    range: string;
    count: number;
    min: number;
    max: number;
}

export interface CategoricalItem {
    label: string;
    count: number;
    percentage: number;
}

export interface CategoricalBreakdown {
    column: string;
    semantic_type: string;
    unique_count: number;
    most_common: string;
    most_common_count: number;
    most_common_pct: number;
    least_common: string;
    least_common_count: number;
    distribution: CategoricalItem[];
}

export interface CategoryPerformanceRow {
    category: string;
    sum: number;
    mean: number;
    median: number;
    count: number;
}

export interface CorrelationPair {
    col1: string;
    col2: string;
    correlation: number;
    strength: string;
    direction?: string;
    badge_color: string;
    description: string;
}

export interface CorrelationMatrixRow {
    column: string;
    [otherCol: string]: string | number;
}

export interface CorrelationData {
    available: boolean;
    message?: string;
    columns: string[];
    matrix: CorrelationMatrixRow[];
    pairs: CorrelationPair[];
}

export interface OutlierItem {
    column: string;
    semantic_type: string;
    total_analyzed: number;
    outlier_count: number;
    outlier_percentage: number;
    status: string;
    q25: number;
    q75: number;
    iqr: number;
    lower_bound: number;
    upper_bound: number;
    lower_outliers_count: number;
    upper_outliers_count: number;
    sample_lower: number[];
    sample_upper: number[];
}

export interface DataQualityCheck {
    status: "pass" | "warning" | "fail" | "info";
    icon: string;
    type: string;
    message: string;
}

export interface DataQualityReport {
    score: number;
    rating: string;
    badge_color: string;
    total_rows: number;
    total_columns: number;
    total_cells: number;
    total_missing: number;
    missing_percentage: number;
    duplicate_rows: number;
    duplicate_percentage: number;
    empty_columns_count: number;
    empty_columns: string[];
    constant_columns_count: number;
    constant_columns: string[];
    identifier_columns_count: number;
    identifier_columns: string[];
    high_cardinality_columns_count: number;
    checks: DataQualityCheck[];
}

export interface TrendPoint {
    date: string;
    value: number;
    mean?: number;
    count?: number;
}

export interface ScatterPoint {
    x: number;
    y: number;
}

export interface DonutPoint {
    name: string;
    value: number;
    percentage: number;
}

export interface UniversalCharts {
    trend_chart: {
        available: boolean;
        title?: string;
        x_axis?: string;
        y_axis?: string;
        type?: string;
        message?: string;
        data?: TrendPoint[];
    };
    primary_bar_chart: {
        available: boolean;
        title?: string;
        dimension?: string;
        metric?: string;
        type?: string;
        data?: CategoryPerformanceRow[];
    };
    secondary_bar_chart?: {
        available: boolean;
        title?: string;
        dimension?: string;
        metric?: string;
        type?: string;
        data?: CategoryPerformanceRow[];
    };
    segment_donut_chart?: {
        available: boolean;
        title?: string;
        dimension?: string;
        type?: string;
        data?: DonutPoint[];
    };
    distribution_chart?: {
        available: boolean;
        title?: string;
        metric?: string;
        type?: string;
        bins?: DistributionBin[];
    };
    scatter_chart?: {
        available: boolean;
        title?: string;
        x_axis?: string;
        y_axis?: string;
        data?: ScatterPoint[];
    };
}

export interface UniversalDatasetMeta {
    name: string;
    rows: number;
    total_rows: number;
    columns_count: number;
    type: string;
    confidence: number;
    icon: string;
    description: string;
    currency_symbol: string;
    is_filtered: boolean;
}

export interface ColumnsSummary {
    all: string[];
    identifiers: string[];
    metrics: string[];
    dimensions: string[];
    dates: string[];
    texts: string[];
    constants: string[];
}

export interface UniversalAnalyticsData {
    success: boolean;
    dataset: UniversalDatasetMeta;
    columns_summary: ColumnsSummary;
    columns_intelligence: ColumnIntel[];
    kpis: KPICard[];
    numeric_statistics: NumericStat[];
    categorical_breakdowns: CategoricalBreakdown[];
    correlations: CorrelationData;
    outliers: OutlierItem[];
    data_quality: DataQualityReport;
    charts: UniversalCharts;
    preview_rows: Array<Record<string, string | number>>;
    selectors: {
        metrics: string[];
        dimensions: string[];
        dates: string[];
    };

    // Legacy fields for backward compatibility
    detected_columns?: {
        revenue: string | null;
        profit: string | null;
        quantity: string | null;
        product: string | null;
        category: string | null;
        region: string | null;
        date: string | null;
    };
    legacy_kpis?: {
        total_revenue: number;
        total_profit: number;
        total_orders: number;
        total_quantity: number;
        average_order_value: number;
        profit_margin: number;
    };
    revenue_by_category?: Array<{ category: string; revenue: number;[k: string]: unknown }>;
    revenue_by_region?: Array<{ region: string; revenue: number;[k: string]: unknown }>;
    top_products?: Array<{ product: string; revenue: number;[k: string]: unknown }>;
    revenue_trend?: Array<{ date: string; revenue: number;[k: string]: unknown }>;
}

export type AnalyticsData = UniversalAnalyticsData;

export interface AnalyticsResponse {
    success: boolean;
    analytics: UniversalAnalyticsData;
}

export interface FilterPayload {
    categorical?: Record<string, string | string[]>;
    numeric?: Record<string, { min?: number; max?: number }>;
    date?: Record<string, { start?: string; end?: string }>;
}

/* ==========================================================
   Upload Dataset API
========================================================== */

export async function uploadDataset(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to upload dataset." }));
        throw new Error(error.detail || "Failed to upload dataset.");
    }

    return response.json() as Promise<UploadResponse>;
}

/* ==========================================================
   Get & Filter Analytics API
========================================================== */

export async function getAnalytics(filters?: FilterPayload): Promise<AnalyticsResponse> {
    let response: Response;

    if (filters && (Object.keys(filters.categorical || {}).length > 0 || Object.keys(filters.numeric || {}).length > 0 || Object.keys(filters.date || {}).length > 0)) {
        response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
        });
    } else {
        response = await fetch(`${API_BASE_URL}/api/analyze`);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to analyze dataset." }));
        throw new Error(error.detail || "Failed to analyze dataset.");
    }

    return response.json() as Promise<AnalyticsResponse>;
}

export async function fetchCategoryPerformance(
    categoryCol: string,
    metricCol: string
): Promise<{ success: boolean; data: CategoryPerformanceRow[] }> {
    const params = new URLSearchParams({
        category_col: categoryCol,
        metric_col: metricCol,
    });
    const res = await fetch(`${API_BASE_URL}/api/category-performance?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to compute category performance");
    }
    return res.json();
}

export async function fetchDistribution(
    metricCol: string,
    binsCount = 12
): Promise<{ success: boolean; bins: DistributionBin[] }> {
    const params = new URLSearchParams({
        metric_col: metricCol,
        bins_count: String(binsCount),
    });
    const res = await fetch(`${API_BASE_URL}/api/distribution?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to compute distribution");
    }
    return res.json();
}

/* ==========================================================
   Rule-Based Insights API
========================================================== */

export interface BusinessInsight {
    type: string;
    severity: "high" | "medium" | "positive";
    title: string;
    description: string;
    recommendation: string;
}

export interface InsightSummary {
    total_insights: number;
    high_priority: number;
    positive_findings: number;
}

export interface InsightsResponse {
    success: boolean;
    dataset_type?: string;
    summary: InsightSummary;
    insights: BusinessInsight[];
}

export async function getInsights(): Promise<InsightsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/insights`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to generate insights." }));
        throw new Error(error.detail || "Failed to generate insights.");
    }

    return response.json() as Promise<InsightsResponse>;
}

/* ==========================================================
   Report Types & API
========================================================== */

export interface ReportDatasetInfo {
    name: string;
    uploaded_at: string;
    rows: number;
    columns: number;
    domain: string;
    memory_usage: string;
    memory_bytes: number;
}

export interface ReportExecutiveSummary {
    narrative: string;
    highlights: string[];
}

export interface ReportMetric {
    id: string;
    label: string;
    value: number;
    formatted: string;
    subtitle: string;
    badge?: string;
    icon?: string;
}

export interface ReportDatasetOverview {
    rows: number;
    columns: number;
    numeric_count: number;
    categorical_count: number;
    date_count: number;
    missing_values: number;
    duplicate_rows: number;
    memory_usage: string;
    column_details: ColumnDetail[];
}

export interface ReportChart {
    id: string;
    type: "line" | "bar" | "pie" | "scatter" | "histogram";
    title: string;
    description: string;
    x_key: string;
    y_key: string;
    x_label?: string;
    y_label?: string;
    data: Array<Record<string, unknown>>;
}

export interface StatisticalSummaryItem {
    column: string;
    count: number;
    mean: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
}

export interface CategoricalDistributionItem {
    label: string;
    count: number;
    percentage: number;
}

export interface CategoricalAnalysisItem {
    column: string;
    unique_count: number;
    most_frequent: string;
    most_frequent_count: number;
    most_frequent_pct: number;
    distribution: CategoricalDistributionItem[];
}

export interface CorrelationAnalysisData {
    has_correlation: boolean;
    message?: string;
    pairs: CorrelationPair[];
    matrix?: Record<string, Record<string, number>>;
    columns?: string[];
}

export interface QualityDeduction {
    check: string;
    status: "pass" | "warn" | "fail";
    message: string;
    penalty: number;
}

export interface DataQualityData {
    score: number;
    rating: string;
    deductions: QualityDeduction[];
    missing_values: number;
    duplicate_rows: number;
    outlier_columns: string[];
}

export interface RecommendationItem {
    title: string;
    description: string;
    type: string;
}

export interface ReportData {
    success: boolean;
    dataset_info: ReportDatasetInfo;
    executive_summary: ReportExecutiveSummary;
    key_metrics: ReportMetric[];
    dataset_overview: ReportDatasetOverview;
    visual_analysis: ReportChart[];
    statistical_summary: StatisticalSummaryItem[];
    categorical_analysis: CategoricalAnalysisItem[];
    correlation_analysis: CorrelationAnalysisData;
    data_quality: DataQualityData;
    insights: BusinessInsight[];
    recommendations: RecommendationItem[];
}

export async function getReport(): Promise<ReportData> {
    const response = await fetch(`${API_BASE_URL}/api/report`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to generate report." }));
        throw new Error(error.detail || "Failed to generate report.");
    }

    return response.json() as Promise<ReportData>;
}

export async function downloadReportPDF(filename?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/report/pdf`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to download PDF report." }));
        throw new Error(error.detail || "Failed to download PDF report.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    let downloadName = filename ? `InsightAI_Report_${filename.replace(/\.[^/.]+$/, "")}.pdf` : "InsightAI_Report.pdf";
    const disposition = response.headers.get("content-disposition");
    if (disposition && disposition.includes("filename=")) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
            downloadName = matches[1].replace(/['"]/g, "");
        }
    }

    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/* ==========================================================
   Dataset History, Preview, and Detailed Diagnostics API
========================================================== */

export interface HistoryItem {
    id: string;
    filename: string;
    uploaded_at: string;
    file_size?: number;
    rows: number;
    columns: number;
    is_active: boolean;
}

export interface HistoryResponse {
    success: boolean;
    history: HistoryItem[];
}

export interface PreviewResponse {
    success: boolean;
    columns: string[];
    rows: Array<Record<string, string | number>>;
    total_rows: number;
    filtered_rows: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface MissingCellDetail {
    row_number: number;
    dataframe_index: number;
    column_name: string;
    value_status: string;
}

export interface MissingColumnSummary {
    column: string;
    missing_count: number;
    missing_pct: number;
}

export interface MissingDetailsResponse {
    success: boolean;
    total_rows: number;
    total_missing: number;
    affected_rows: number;
    missing_summary: MissingColumnSummary[];
    missing_details: MissingCellDetail[];
}

export interface DuplicateDetailsResponse {
    success: boolean;
    total_rows: number;
    duplicate_count: number;
    total_duplicate_instances: number;
    duplicate_percentage: number;
    columns: string[];
    sample_rows: Array<Record<string, string | number | null>>;
}

export async function getDatasetHistory(): Promise<HistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    if (!response.ok) {
        throw new Error("Failed to fetch dataset history.");
    }
    return response.json() as Promise<HistoryResponse>;
}

export async function activateSavedDataset(id: string): Promise<UploadResponse> {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}/activate`, {
        method: "POST",
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Failed to activate dataset." }));
        throw new Error(err.detail || "Failed to activate dataset.");
    }
    return response.json() as Promise<UploadResponse>;
}

export async function deleteSavedDataset(
    id: string
): Promise<{ success: boolean; message: string; remaining_count: number; activated_next?: string | null }> {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Failed to delete dataset." }));
        throw new Error(err.detail || "Failed to delete dataset.");
    }
    return response.json();
}

export async function getDatasetPreview(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    sort_col?: string;
    sort_order?: "asc" | "desc";
}): Promise<PreviewResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.page_size) query.append("page_size", String(params.page_size));
    if (params?.search) query.append("search", params.search);
    if (params?.sort_col) query.append("sort_col", params.sort_col);
    if (params?.sort_order) query.append("sort_order", params.sort_order);

    const response = await fetch(`${API_BASE_URL}/api/dataset/preview?${query.toString()}`);
    if (!response.ok) {
        throw new Error("Failed to fetch dataset preview.");
    }
    return response.json() as Promise<PreviewResponse>;
}

export async function getMissingDetails(): Promise<MissingDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/dataset/missing-details`);
    if (!response.ok) {
        throw new Error("Failed to fetch missing values details.");
    }
    return response.json() as Promise<MissingDetailsResponse>;
}

export async function getDuplicateDetails(): Promise<DuplicateDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/dataset/duplicate-details`);
    if (!response.ok) {
        throw new Error("Failed to fetch duplicate records details.");
    }
    return response.json() as Promise<DuplicateDetailsResponse>;
}