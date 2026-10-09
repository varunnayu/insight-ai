import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Database,
    FileSpreadsheet,
    Loader2,
    Mail,
    ShieldCheck,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import Logo from "../components/ui/Logo";
import { useDataset } from "../context/DatasetContext";

export default function Landing() {
    const navigate = useNavigate();
    const { dataset } = useDataset();

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(15);
    const [statusText, setStatusText] = useState("Initializing environment...");

    const handleGetStarted = () => {
        setIsLoading(true);
    };

    useEffect(() => {
        if (!isLoading) return;

        const timer1 = setTimeout(() => {
            setProgress(45);
            setStatusText("Loading analytics engine & modules...");
        }, 300);

        const timer2 = setTimeout(() => {
            setProgress(80);
            setStatusText("Preparing workspace & data views...");
        }, 650);

        const timer3 = setTimeout(() => {
            setProgress(100);
            setStatusText("Opening Business Dashboard...");
        }, 950);

        const timer4 = setTimeout(() => {
            navigate("/dashboard");
        }, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [isLoading, navigate]);

    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-white text-[#111111] overflow-x-hidden selection:bg-[#111111] selection:text-white">
            {/* ── Best Minimal Geometric Grid Background ───────────── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 1px 1px, #E5E5E5 1.2px, transparent 0),
                        linear-gradient(to right, rgba(229, 229, 229, 0.3) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(229, 229, 229, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "32px 32px, 128px 128px, 128px 128px",
                }}
            />

            {/* Subtle ambient lighting vignette from top center */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(247,247,247,0.7)_0%,rgba(255,255,255,0.92)_65%,#ffffff_100%)] pointer-events-none" />

            {/* Corner crosshairs decoration */}
            <div className="absolute top-12 left-12 text-[#CCCCCC] font-mono text-xs select-none pointer-events-none hidden md:block">
                + 00.1 / BI
            </div>
            <div className="absolute top-12 right-12 text-[#CCCCCC] font-mono text-xs select-none pointer-events-none hidden md:block">
                SYS.READY +
            </div>

            {/* ── Top Header Bar ────────────────────────────────────────── */}
            <header className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 flex items-center justify-between border-b border-[#E5E5E5]/60 bg-white/70 backdrop-blur-md">
                <div
                    onClick={() => navigate("/")}
                    className="cursor-pointer transition hover:opacity-90"
                >
                    <Logo />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleGetStarted}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#111111] bg-[#111111] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-black"
                    >
                        <span>Launch App</span>
                        <ArrowRight size={13} />
                    </button>
                </div>
            </header>

            {/* ── Main Hero Section ────────────────────────────────────── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 text-center">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Eyebrow badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-3.5 py-1 text-xs font-medium text-[#666666] shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-[#16a34a]" />
                        <span className="text-[#111111] font-semibold">InsightAI</span>
                        <span className="text-[#CCCCCC]">|</span>
                        <span>Enterprise Business Intelligence Platform</span>
                    </div>

                    {/* Project Title */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#111111] sm:text-6xl lg:text-7xl">
                            Welcome to{" "}
                            <span className="relative inline-block text-[#111111]">
                                InsightAI
                                <svg
                                    className="absolute -bottom-2 left-0 w-full text-[#111111]/20"
                                    height="6"
                                    viewBox="0 0 100 6"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0 5 Q 50 0, 100 5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl font-medium tracking-tight text-[#444444]">
                            Business Analytics & Intelligence Dashboard
                        </p>
                    </div>

                    {/* Project Subheading */}
                    <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-[#666666]">
                        Transform raw CSV and Excel datasets into automated executive reports,
                        real-time KPI metrics, data quality audits, and interactive multi-dimensional
                        visualizations in seconds.
                    </p>

                    {/* CTA Action Buttons */}
                    <div className="pt-2 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-md border border-[#111111] bg-[#111111] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-black hover:shadow-lg focus:outline-none"
                        >
                            <span>Get Started</span>
                            <ArrowRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </button>
                    </div>

                    {/* Quick Highlights Strip */}
                    <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#666666]">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#16a34a]" />
                            <span>Zero Configuration</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#16a34a]" />
                            <span>Automated Data Quality Audit</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#16a34a]" />
                            <span>Full Disk Persistence</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#16a34a]" />
                            <span>Executive PDF Reports</span>
                        </div>
                    </div>

                    {/* ── Interactive Platform Preview Card ────────────────── */}
                    <div className="pt-8">
                        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xl text-left">
                            {/* Window header */}
                            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
                                    <span className="ml-2 font-mono text-[10px] text-[#999999]">
                                        insightai-dashboard.live
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {dataset && (
                                        <span className="inline-flex items-center gap-1 rounded border border-[#16a34a] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                                            <CheckCircle2 size={10} />
                                            Active: {dataset.filename}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Window preview content */}
                            <div className="p-5 sm:p-6 space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E5E5E5] pb-3">
                                    <div>
                                        <p className="text-xs font-bold text-[#111111]">
                                            Live Workspace Preview
                                        </p>
                                        <p className="text-[11px] text-[#666666]">
                                            Automated KPI generation and data health overview
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGetStarted}
                                        className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center gap-1"
                                    >
                                        <span>Open Full Project</span>
                                        <ArrowRight size={12} />
                                    </button>
                                </div>

                                {/* Mini KPI Cards Strip */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-[#666666]">
                                                Total Rows
                                            </span>
                                            <Database size={12} className="text-[#999999]" />
                                        </div>
                                        <p className="mt-1 font-mono text-base font-bold text-[#111111]">
                                            {dataset?.profile.rows.toLocaleString() || "10,000"}
                                        </p>
                                        <span className="text-[9px] text-[#16a34a]">
                                            ● Verified records
                                        </span>
                                    </div>

                                    <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-[#666666]">
                                                Columns
                                            </span>
                                            <FileSpreadsheet size={12} className="text-[#999999]" />
                                        </div>
                                        <p className="mt-1 font-mono text-base font-bold text-[#111111]">
                                            {dataset?.profile.columns || "13"}
                                        </p>
                                        <span className="text-[9px] text-[#666666]">
                                            Auto-detected types
                                        </span>
                                    </div>

                                    <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-[#666666]">
                                                Data Health
                                            </span>
                                            <ShieldCheck size={12} className="text-[#16a34a]" />
                                        </div>
                                        <p className="mt-1 font-mono text-base font-bold text-[#111111]">
                                            99.8%
                                        </p>
                                        <span className="text-[9px] text-[#16a34a]">
                                            Clean quality score
                                        </span>
                                    </div>

                                    <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-[#666666]">
                                                Visual Charts
                                            </span>
                                            <TrendingUp size={12} className="text-[#2563eb]" />
                                        </div>
                                        <p className="mt-1 font-mono text-base font-bold text-[#111111]">
                                            Auto-EDA
                                        </p>
                                        <span className="text-[9px] text-[#2563eb]">
                                            Multi-chart layouts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Feature Highlights ───────────────────────────────── */}
                    <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="rounded-lg border border-[#E5E5E5] bg-white p-5 transition hover:border-[#CCCCCC]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                <BarChart3 size={16} />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-[#111111]">
                                Automated Analytics
                            </h3>
                            <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                                Statistical distributions, categorical frequency counts, and correlation analysis generated instantly.
                            </p>
                        </div>

                        <div className="rounded-lg border border-[#E5E5E5] bg-white p-5 transition hover:border-[#CCCCCC]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                <ShieldCheck size={16} />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-[#111111]">
                                Quality Audit Engine
                            </h3>
                            <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                                Identify missing values, detect duplicated records, and inspect cell-by-cell data anomalies with row accuracy.
                            </p>
                        </div>

                        <div className="rounded-lg border border-[#E5E5E5] bg-white p-5 transition hover:border-[#CCCCCC]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                                <Sparkles size={16} />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-[#111111]">
                                Executive PDF Reports
                            </h3>
                            <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                                Comprehensive executive intelligence summaries with key insights, recommendations, and one-click export.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Permanent Footer ─────────────────────────────────────── */}
            <footer className="relative z-10 border-t border-[#E5E5E5] bg-white/80 py-6 px-4 text-center backdrop-blur-sm">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666]">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111111]">Made by Varun ❤️</span>
                        <span className="text-[#CCCCCC]">|</span>
                        <a
                            href="mailto:varunsantu2002@gmail.com"
                            className="inline-flex items-center gap-1 hover:text-[#111111] hover:underline"
                            title="Contact by mail"
                        >
                            <Mail size={12} className="text-[#999999]" />
                            <span>varunsantu2002@gmail.com</span>
                        </a>
                    </div>

                    <p className="text-[11px] text-[#999999]">
                        © {new Date().getFullYear()} Varun. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* ── Loading Screen Transition Overlay ─────────────────────────── */}
            {isLoading && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Loading workspace"
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-300"
                >
                    {/* Top edge animated progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#F0F0F0] overflow-hidden">
                        <div className="h-full bg-[#111111] animate-indeterminate-progress" />
                    </div>

                    {/* Minimal Center Card */}
                    <div className="flex flex-col items-center text-center max-w-sm w-full mx-4 px-8 py-9 rounded-xl border border-[#E5E5E5] bg-white shadow-2xl space-y-5">
                        {/* Center Icon badge with spinner */}
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#F7F7F7] text-[#111111]">
                            <BarChart3 size={24} className="text-[#111111]" />
                            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-white">
                                <Loader2 size={10} className="animate-spin" />
                            </div>
                        </div>

                        {/* Title and dynamic progress message */}
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-[#111111]">
                                Launching Project
                            </h3>
                            <p className="text-xs text-[#666666] transition-all min-h-[1.25rem]">
                                {statusText}
                            </p>
                        </div>

                        {/* Progress Bar with percentage */}
                        <div className="w-full space-y-1.5">
                            <div className="h-1.5 w-full bg-[#F0F0F0] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#111111] rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#999999]">
                                <span>Loading workspace</span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        {/* Footer brand snippet */}
                        <div className="pt-2 border-t border-[#E5E5E5] w-full text-[10px] text-[#999999]">
                            InsightAI • Business Intelligence Dashboard
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
