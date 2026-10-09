/**
 * ComingSoon — reusable "Coming Soon" page component
 *
 * Used across all unfinished feature pages in InsightAI.
 * Each page passes a unique illustration variant so the
 * visual stays on-brand while feeling feature-specific.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Clock } from "lucide-react";
import type { ReactNode } from "react";

/* ─── Illustration variants ──────────────────────────────── */

export type IllustrationVariant =
    | "ai-insights"
    | "ai-analyst"
    | "analytics"
    | "forecast"
    | "anomalies"
    | "reports"
    | "settings";

/* ─── Props ──────────────────────────────────────────────── */

export interface ComingSoonProps {
    /** Main feature title  */
    title: string;
    /** Sub-label shown above the title  */
    featureName?: string;
    /** Description paragraph  */
    description: string;
    /** Badge text — defaults to "Coming Soon"  */
    badge?: string;
    /** Which illustration to show  */
    illustration: IllustrationVariant;
    /** Optional pill tags listing what will be included  */
    features?: { label: string; icon: ReactNode }[];
}

/* ─── Animation helpers ──────────────────────────────────── */

const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" as const } },
};

/* ═══════════════════════════════════════════════════════════
   INLINE SVG ILLUSTRATIONS
   One per feature — all self-contained, no external assets.
═══════════════════════════════════════════════════════════ */

function IllustrationAIInsights() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="ai-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ai-brain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="ai-bar" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
                <filter id="ai-glow">
                    <feGaussianBlur stdDeviation="10" result="b" />
                    <feComposite in="SourceGraphic" in2="b" operator="over" />
                </filter>
            </defs>
            {/* halo */}
            <ellipse cx="180" cy="140" rx="130" ry="105" fill="url(#ai-halo)" />
            {/* neural lines */}
            {[[60, 80, 180, 140], [300, 85, 180, 140], [55, 200, 180, 140], [305, 205, 180, 140], [105, 42, 180, 140], [265, 48, 180, 140]].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#818cf8" strokeWidth="1" opacity="0.3" />
            ))}
            {/* outer nodes */}
            {[[60, 80], [300, 85], [55, 200], [305, 205], [105, 42], [265, 48]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4.5" fill="#818cf8" opacity="0.5">
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
            ))}
            {/* brain left */}
            <path d="M180 88 C160 88,140 97,130 116 C119 137,121 158,128 174 C133 188,148 197,160 202 C168 206,174 207,180 208"
                stroke="url(#ai-brain)" strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#ai-glow)" />
            {/* brain right */}
            <path d="M180 88 C200 88,220 97,230 116 C241 137,239 158,232 174 C227 188,212 197,200 202 C192 206,186 207,180 208"
                stroke="url(#ai-brain)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* sulcus */}
            <line x1="180" y1="94" x2="180" y2="203" stroke="#818cf8" strokeWidth="1" opacity="0.25" />
            {/* folds */}
            <path d="M152 110 Q142 132,151 154" stroke="#a5b4fc" strokeWidth="1.5" fill="none" opacity="0.45" />
            <path d="M143 148 Q137 166,151 183" stroke="#a5b4fc" strokeWidth="1.5" fill="none" opacity="0.35" />
            <path d="M208 110 Q218 132,209 154" stroke="#a5b4fc" strokeWidth="1.5" fill="none" opacity="0.45" />
            <path d="M217 148 Q223 166,209 183" stroke="#a5b4fc" strokeWidth="1.5" fill="none" opacity="0.35" />
            {/* inner dots */}
            {[[163, 122], [197, 122], [148, 152], [212, 152], [165, 178], [195, 178], [180, 148]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="2.8" fill="#6366f1" opacity="0.6">
                    <animate attributeName="r" values="2.2;3.5;2.2" dur={`${2 + i * 0.22}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.75;0.35" dur={`${2 + i * 0.22}s`} repeatCount="indefinite" />
                </circle>
            ))}
            {/* mini bar card bottom-left */}
            <rect x="22" y="215" width="88" height="54" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="34" y="243" width="8" height="14" rx="2" fill="url(#ai-bar)" />
            <rect x="46" y="236" width="8" height="21" rx="2" fill="url(#ai-bar)" />
            <rect x="58" y="228" width="8" height="29" rx="2" fill="url(#ai-bar)" />
            <rect x="70" y="233" width="8" height="24" rx="2" fill="url(#ai-bar)" />
            <rect x="82" y="223" width="8" height="34" rx="2" fill="url(#ai-bar)" />
            <rect x="34" y="228" width="32" height="3" rx="1.5" fill="#cbd5e1" />
            {/* mini trend card bottom-right */}
            <rect x="252" y="220" width="88" height="54" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <polyline points="264,255 276,245 288,249 300,235 312,239 324,227" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="324" cy="227" r="3" fill="#6366f1" />
            <rect x="264" y="228" width="36" height="3" rx="1.5" fill="#cbd5e1" />
        </svg>
    );
}

function IllustrationAIAnalyst() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="analyst-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="analyst-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
            </defs>
            <ellipse cx="180" cy="140" rx="130" ry="100" fill="url(#analyst-halo)" />
            {/* chat bubble — main */}
            <rect x="68" y="64" width="160" height="82" rx="16" fill="white" stroke="#ddd6fe" strokeWidth="1.5" />
            <path d="M108 146 L96 162 L122 152" fill="white" stroke="#ddd6fe" strokeWidth="1.5" strokeLinejoin="round" />
            {/* text lines inside bubble */}
            <rect x="84" y="82" width="110" height="6" rx="3" fill="#ddd6fe" />
            <rect x="84" y="95" width="90" height="5" rx="2.5" fill="#ede9fe" />
            <rect x="84" y="107" width="100" height="5" rx="2.5" fill="#ede9fe" />
            <rect x="84" y="119" width="70" height="5" rx="2.5" fill="#ede9fe" />
            {/* sparkle in top-right of bubble */}
            <circle cx="209" cy="77" r="10" fill="#8b5cf6" />
            <path d="M209 72 L210.5 76.5 L215 74 L211.5 77.5 L215 81 L210.5 79.5 L209 84 L207.5 79.5 L203 81 L206.5 77.5 L203 74 L207.5 76.5 Z" fill="white" opacity="0.85" transform="scale(0.6) translate(138 53)" />
            <text x="203" y="81" fontSize="9" fill="white" fontWeight="bold">✦</text>
            {/* second bubble — user */}
            <rect x="138" y="170" width="140" height="60" rx="14" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.2" />
            <path d="M258 170 L270 155 L244 162" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.2" strokeLinejoin="round" />
            <rect x="152" y="183" width="80" height="5" rx="2.5" fill="#c4b5fd" />
            <rect x="152" y="194" width="100" height="5" rx="2.5" fill="#ddd6fe" />
            <rect x="152" y="205" width="64" height="5" rx="2.5" fill="#ddd6fe" />
            {/* floating metric pill */}
            <rect x="22" y="100" width="60" height="30" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="34" cy="115" r="5" fill="#c4b5fd" />
            <rect x="43" y="110" width="28" height="4" rx="2" fill="#e2e8f0" />
            <rect x="43" y="118" width="20" height="3" rx="1.5" fill="#f1f5f9" />
            {/* floating node top-right */}
            <circle cx="316" cy="90" r="18" fill="white" stroke="#ddd6fe" strokeWidth="1" />
            <text x="308" y="95" fontSize="14" fill="#8b5cf6">🤖</text>
        </svg>
    );
}

function IllustrationAnalytics() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="an-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="an-b1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
                <linearGradient id="an-b2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a5b4fc" />
                </linearGradient>
                <linearGradient id="an-b3" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
            </defs>
            <ellipse cx="180" cy="145" rx="145" ry="110" fill="url(#an-halo)" />
            {/* main chart card */}
            <rect x="44" y="48" width="272" height="162" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* chart title area */}
            <rect x="62" y="66" width="80" height="7" rx="3.5" fill="#e2e8f0" />
            <rect x="62" y="77" width="52" height="5" rx="2.5" fill="#f1f5f9" />
            {/* legend dots */}
            <circle cx="252" cy="68" r="4" fill="#0ea5e9" />
            <rect x="260" y="65" width="26" height="4" rx="2" fill="#e2e8f0" />
            <circle cx="252" cy="80" r="4" fill="#6366f1" />
            <rect x="260" y="77" width="26" height="4" rx="2" fill="#e2e8f0" />
            {/* bars */}
            {[
                { x: 68, h: 68, fill: "url(#an-b1)" },
                { x: 96, h: 90, fill: "url(#an-b2)" },
                { x: 124, h: 54, fill: "url(#an-b1)" },
                { x: 152, h: 104, fill: "url(#an-b3)" },
                { x: 180, h: 76, fill: "url(#an-b2)" },
                { x: 208, h: 118, fill: "url(#an-b1)" },
                { x: 236, h: 88, fill: "url(#an-b2)" },
                { x: 264, h: 60, fill: "url(#an-b3)" },
            ].map((b, i) => (
                <rect key={i} x={b.x} y={180 - b.h} width="20" height={b.h} rx="4" fill={b.fill} />
            ))}
            {/* trend line overlay */}
            <polyline points="78,148 106,126 134,162 162,112 190,138 218,98 246,120 274,152"
                stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            {/* axis line */}
            <line x1="62" y1="180" x2="298" y2="180" stroke="#e2e8f0" strokeWidth="1" />
            {/* bottom x labels */}
            {[68, 96, 124, 152, 180, 208, 236, 264].map((x, i) => (
                <rect key={i} x={x + 2} y={188} width="16" height="4" rx="2" fill="#f1f5f9" />
            ))}
            {/* kpi pills */}
            <rect x="44" y="224" width="84" height="38" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="56" y="234" width="40" height="5" rx="2.5" fill="#bae6fd" />
            <rect x="56" y="243" width="60" height="5" rx="2.5" fill="#e0f2fe" />

            <rect x="138" y="224" width="84" height="38" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="150" y="234" width="40" height="5" rx="2.5" fill="#c7d2fe" />
            <rect x="150" y="243" width="60" height="5" rx="2.5" fill="#e0e7ff" />

            <rect x="232" y="224" width="84" height="38" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="244" y="234" width="40" height="5" rx="2.5" fill="#a7f3d0" />
            <rect x="244" y="243" width="60" height="5" rx="2.5" fill="#d1fae5" />
        </svg>
    );
}

function IllustrationForecast() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="fc-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="fc-area" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="fc-pred" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>
            <ellipse cx="180" cy="145" rx="145" ry="108" fill="url(#fc-halo)" />
            {/* main card */}
            <rect x="36" y="42" width="288" height="176" rx="16" fill="white" stroke="#fde68a" strokeWidth="1.5" />
            {/* title */}
            <rect x="54" y="60" width="90" height="7" rx="3.5" fill="#fde68a" />
            <rect x="54" y="71" width="56" height="5" rx="2.5" fill="#fef3c7" />
            {/* grid lines */}
            {[100, 120, 140, 160, 180].map((y, i) => (
                <line key={i} x1="54" y1={y} x2="306" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {/* historical area fill */}
            <path d="M54 174 L80 155 L106 162 L132 138 L158 144 L184 120 L184 180 L54 180 Z" fill="url(#fc-area)" />
            {/* historical line */}
            <polyline points="54,174 80,155 106,162 132,138 158,144 184,120"
                stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* forecast dashed area fill */}
            <path d="M184 120 L210 102 L236 88 L262 72 L288 58 L306 50 L306 180 L184 180 Z" fill="url(#fc-pred)" opacity="0.7" />
            {/* forecast dashed line */}
            <polyline points="184,120 210,102 236,88 262,72 288,58 306,50"
                stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" fill="none" />
            {/* divider dotted vertical */}
            <line x1="184" y1="90" x2="184" y2="185" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
            <rect x="168" y="84" width="32" height="14" rx="5" fill="#f59e0b" />
            <text x="172" y="95" fontSize="7" fill="white" fontWeight="bold">NOW</text>
            {/* data points */}
            {[[80, 155], [106, 162], [132, 138], [158, 144], [184, 120]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
            ))}
            {[[210, 102], [236, 88], [262, 72], [288, 58]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke="#6366f1" strokeWidth="2">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
                </circle>
            ))}
            {/* legend */}
            <line x1="54" y1="195" x2="68" y2="195" stroke="#f59e0b" strokeWidth="2" />
            <rect x="72" y="192" width="44" height="5" rx="2.5" fill="#fde68a" />
            <line x1="128" y1="195" x2="142" y2="195" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" />
            <rect x="146" y="192" width="44" height="5" rx="2.5" fill="#c7d2fe" />
            {/* bottom pills */}
            <rect x="36" y="228" width="84" height="36" rx="10" fill="white" stroke="#fde68a" strokeWidth="1" />
            <rect x="48" y="238" width="36" height="5" rx="2.5" fill="#fde68a" />
            <rect x="48" y="247" width="58" height="4" rx="2" fill="#fef9c3" />
            <rect x="138" y="228" width="84" height="36" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="150" y="238" width="36" height="5" rx="2.5" fill="#c7d2fe" />
            <rect x="150" y="247" width="58" height="4" rx="2" fill="#e0e7ff" />
            <rect x="240" y="228" width="84" height="36" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="252" y="238" width="36" height="5" rx="2.5" fill="#bbf7d0" />
            <rect x="252" y="247" width="58" height="4" rx="2" fill="#dcfce7" />
        </svg>
    );
}

function IllustrationAnomalies() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="anom-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <filter id="anom-pulse">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feComposite in="SourceGraphic" in2="b" operator="over" />
                </filter>
            </defs>
            <ellipse cx="180" cy="145" rx="140" ry="108" fill="url(#anom-halo)" />
            {/* main card */}
            <rect x="40" y="46" width="280" height="172" rx="16" fill="white" stroke="#fecaca" strokeWidth="1.5" />
            {/* title */}
            <rect x="58" y="64" width="80" height="7" rx="3.5" fill="#fecaca" />
            <rect x="58" y="75" width="52" height="5" rx="2.5" fill="#fee2e2" />
            {/* grid */}
            {[105, 125, 145, 165, 185].map((y, i) => (
                <line key={i} x1="58" y1={y} x2="302" y2={y} stroke="#f8fafc" strokeWidth="1" />
            ))}
            {/* normal baseline line */}
            <polyline points="58,170 82,162 106,165 130,160 154,163 178,158 202,161 226,157 250,160 274,155 298,158"
                stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" fill="none" />
            {/* data line with anomalies */}
            <polyline points="58,168 82,161 106,163 130,158 154,160 178,155 202,105 226,155 250,158 274,153 298,156"
                stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* anomaly spike */}
            <circle cx="202" cy="105" r="10" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" filter="url(#anom-pulse)">
                <animate attributeName="r" values="9;13;9" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <line x1="202" y1="101" x2="202" y2="97" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="200" y1="99" x2="204" y2="99" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            {/* anomaly label */}
            <rect x="212" y="88" width="56" height="22" rx="6" fill="#ef4444" />
            <text x="217" y="99" fontSize="7.5" fill="white" fontWeight="bold">⚠ Anomaly</text>
            <text x="220" y="108" fontSize="6" fill="#fecaca">+3.2σ spike</text>
            {/* secondary anomaly small */}
            <circle cx="118" cy="163" r="5" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" opacity="0.8" />
            {/* alert cards bottom */}
            <rect x="40" y="228" width="124" height="36" rx="10" fill="#fef2f2" stroke="#fecaca" strokeWidth="1" />
            <rect x="52" y="238" width="50" height="5" rx="2.5" fill="#fca5a5" />
            <rect x="52" y="247" width="96" height="4" rx="2" fill="#fee2e2" />
            <rect x="176" y="228" width="144" height="36" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="188" y="238" width="50" height="5" rx="2.5" fill="#e2e8f0" />
            <rect x="188" y="247" width="116" height="4" rx="2" fill="#f1f5f9" />
        </svg>
    );
}

function IllustrationReports() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="rep-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="rep-bar" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
            </defs>
            <ellipse cx="180" cy="140" rx="138" ry="108" fill="url(#rep-halo)" />
            {/* shadow doc */}
            <rect x="88" y="52" width="170" height="198" rx="14" fill="#f1f5f9" />
            {/* main doc */}
            <rect x="78" y="42" width="170" height="198" rx="14" fill="white" stroke="#d1fae5" strokeWidth="1.5" />
            {/* doc header bar */}
            <rect x="78" y="42" width="170" height="36" rx="14" fill="#ecfdf5" />
            <rect x="78" y="64" width="170" height="14" rx="0" fill="#ecfdf5" />
            <rect x="94" y="52" width="70" height="7" rx="3.5" fill="#a7f3d0" />
            <rect x="94" y="63" width="44" height="5" rx="2.5" fill="#d1fae5" />
            {/* doc icon top-right */}
            <rect x="218" y="51" width="20" height="20" rx="5" fill="#10b981" />
            <rect x="222" y="56" width="12" height="2.5" rx="1.25" fill="white" />
            <rect x="222" y="61" width="10" height="2.5" rx="1.25" fill="white" />
            <rect x="222" y="66" width="8" height="2.5" rx="1.25" fill="white" />
            {/* mini bar chart inside doc */}
            {[{ x: 94, h: 30 }, { x: 110, h: 46 }, { x: 126, h: 36 }, { x: 142, h: 56 }, { x: 158, h: 40 }, { x: 174, h: 64 }, { x: 190, h: 48 }, { x: 206, h: 52 }].map((b, i) => (
                <rect key={i} x={b.x} y={160 - b.h} width="12" height={b.h} rx="3" fill="url(#rep-bar)" />
            ))}
            {/* content lines */}
            <rect x="94" y="90" width="136" height="5" rx="2.5" fill="#e2e8f0" />
            <rect x="94" y="100" width="120" height="4" rx="2" fill="#f1f5f9" />
            <rect x="94" y="109" width="130" height="4" rx="2" fill="#f1f5f9" />
            <rect x="94" y="118" width="100" height="4" rx="2" fill="#f1f5f9" />
            {/* axis */}
            <line x1="90" y1="162" x2="222" y2="162" stroke="#e2e8f0" strokeWidth="1" />
            {/* footer lines */}
            <rect x="94" y="178" width="100" height="4" rx="2" fill="#f1f5f9" />
            <rect x="94" y="187" width="80" height="4" rx="2" fill="#f1f5f9" />
            <rect x="94" y="196" width="90" height="4" rx="2" fill="#f1f5f9" />
            <rect x="94" y="205" width="70" height="4" rx="2" fill="#f1f5f9" />
            {/* badge */}
            <rect x="94" y="218" width="60" height="16" rx="6" fill="#10b981" />
            <text x="100" y="229" fontSize="7.5" fill="white" fontWeight="bold">✓ Generated</text>
            {/* floating pill */}
            <rect x="264" y="80" width="66" height="30" rx="8" fill="white" stroke="#d1fae5" strokeWidth="1" />
            <circle cx="276" cy="95" r="5" fill="#6ee7b7" />
            <rect x="285" y="91" width="34" height="4" rx="2" fill="#e2e8f0" />
            <rect x="285" y="99" width="26" height="3" rx="1.5" fill="#f1f5f9" />
            {/* floating pill 2 */}
            <rect x="24" y="160" width="60" height="30" rx="8" fill="white" stroke="#d1fae5" strokeWidth="1" />
            <circle cx="36" cy="175" r="5" fill="#a7f3d0" />
            <rect x="45" y="171" width="28" height="4" rx="2" fill="#e2e8f0" />
            <rect x="45" y="179" width="22" height="3" rx="1.5" fill="#f1f5f9" />
        </svg>
    );
}

function IllustrationSettings() {
    return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="set-halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                </radialGradient>
            </defs>
            <ellipse cx="180" cy="140" rx="135" ry="105" fill="url(#set-halo)" />
            {/* main settings card */}
            <rect x="52" y="44" width="256" height="192" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* sidebar strip */}
            <rect x="52" y="44" width="72" height="192" rx="16" fill="#f8fafc" />
            <rect x="52" y="68" width="72" height="168" rx="0" fill="#f8fafc" />
            {/* divider */}
            <line x1="124" y1="44" x2="124" y2="236" stroke="#e2e8f0" strokeWidth="1" />
            {/* sidebar items */}
            {[80, 104, 128, 152, 176, 200].map((y, i) => (
                <rect key={i} x="64" y={y} width="48" height="14" rx="5"
                    fill={i === 0 ? "#0f172a" : "#f1f5f9"} />
            ))}
            <rect x="68" y={82} width="28" height="4" rx="2" fill="white" />
            {[104, 128, 152, 176, 200].map((y, i) => (
                <rect key={i} x="68" y={y + 5} width="28" height="4" rx="2" fill="#cbd5e1" />
            ))}
            {/* main panel */}
            <rect x="136" y="60" width="140" height="7" rx="3.5" fill="#e2e8f0" />
            <rect x="136" y="71" width="90" height="5" rx="2.5" fill="#f1f5f9" />
            {/* toggle rows */}
            {[
                { y: 90, w: 80, active: true },
                { y: 112, w: 60, active: false },
                { y: 134, w: 70, active: true },
                { y: 156, w: 90, active: false },
                { y: 178, w: 65, active: true },
            ].map((r, i) => (
                <g key={i}>
                    <rect x="136" y={r.y} width={r.w} height="5" rx="2.5" fill="#e2e8f0" />
                    {/* toggle pill */}
                    <rect x="238" y={r.y - 3} width="28" height="12" rx="6"
                        fill={r.active ? "#0f172a" : "#e2e8f0"} />
                    <circle cx={r.active ? 258 : 244} cy={r.y + 3} r="4"
                        fill="white" />
                    <line x1="136" y1={r.y + 14} x2="270" y2={r.y + 14} stroke="#f1f5f9" strokeWidth="1" />
                </g>
            ))}
            {/* save button */}
            <rect x="200" y="210" width="76" height="22" rx="8" fill="#0f172a" />
            <rect x="212" y="218" width="52" height="5" rx="2.5" fill="white" opacity="0.7" />
            {/* floating cog glyph */}
            <circle cx="318" cy="72" r="20" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="318" cy="72" r="7" fill="none" stroke="#94a3b8" strokeWidth="2" />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const ox = 318 + Math.round(13 * Math.cos(rad));
                const oy = 72 + Math.round(13 * Math.sin(rad));
                return <circle key={i} cx={ox} cy={oy} r="2.5" fill="#94a3b8" />;
            })}
            <circle cx="42" cy="188" r="16" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="42" cy="188" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const ox = 42 + Math.round(10 * Math.cos(rad));
                const oy = 188 + Math.round(10 * Math.sin(rad));
                return <circle key={i} cx={ox} cy={oy} r="2" fill="#94a3b8" />;
            })}
        </svg>
    );
}

/* ─── Illustration selector ──────────────────────────────── */

function Illustration({ variant }: { variant: IllustrationVariant }) {
    switch (variant) {
        case "ai-insights": return <IllustrationAIInsights />;
        case "ai-analyst": return <IllustrationAIAnalyst />;
        case "analytics": return <IllustrationAnalytics />;
        case "forecast": return <IllustrationForecast />;
        case "anomalies": return <IllustrationAnomalies />;
        case "reports": return <IllustrationReports />;
        case "settings": return <IllustrationSettings />;
    }
}

/* ─── Main component ─────────────────────────────────────── */

export default function ComingSoon({
    title,
    featureName,
    description,
    badge = "Coming Soon",
    illustration,
    features = [],
}: ComingSoonProps) {
    const shouldReduce = useReducedMotion();

    const floatAnim = shouldReduce
        ? {}
        : {
            animate: { y: [0, -10, 0] },
            transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const },
        };

    const glowAnim = shouldReduce
        ? {}
        : {
            animate: { scale: [1, 1.06, 1], opacity: [0.45, 0.75, 0.45] },
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        };

    return (
        <div className="mx-auto max-w-4xl">
            <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-8 py-6 sm:py-10 lg:py-14"
            >
                {/* ── Illustration ─────────────────────── */}
                <motion.div
                    variants={item}
                    className="relative flex items-center justify-center"
                >
                    {/* glow ring */}
                    <motion.div
                        {...glowAnim}
                        className="absolute rounded-full"
                        style={{
                            width: "min(320px, 80vw)",
                            height: "min(320px, 80vw)",
                            background:
                                "radial-gradient(circle, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0) 68%)",
                        }}
                        aria-hidden="true"
                    />

                    {/* illustration floats */}
                    <motion.div
                        {...floatAnim}
                        className="relative"
                        style={{ width: "min(360px, 88vw)" }}
                    >
                        <Illustration variant={illustration} />
                    </motion.div>
                </motion.div>

                {/* ── Badge ────────────────────────────── */}
                <motion.div variants={item}>
                    <span
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#111111]"
                        aria-label={`Feature status: ${badge}`}
                    >
                        <Clock size={11} aria-hidden="true" />
                        {badge}
                    </span>
                </motion.div>

                {/* ── Heading ──────────────────────────── */}
                <motion.div variants={item} className="text-center">
                    {featureName && (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#999999]">
                            {featureName}
                        </p>
                    )}
                    <h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
                        {title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#666666] sm:text-sm">
                        {description}
                    </p>
                </motion.div>

                {/* ── Feature pills ─────────────────── */}
                {features.length > 0 && (
                    <motion.div
                        variants={item}
                        className="flex flex-wrap items-center justify-center gap-2.5"
                        aria-label="Planned features"
                    >
                        {features.map((f) => (
                            <div
                                key={f.label}
                                className="flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-xs font-medium text-[#111111]"
                            >
                                <span className="text-[#2563eb]" aria-hidden="true">
                                    {f.icon}
                                </span>
                                {f.label}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* ── Disabled CTA ──────────────────── */}
                <motion.div variants={item}>
                    <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-[#E5E5E5] bg-[#F7F7F7] px-4 py-2 text-xs font-semibold text-[#999999] transition"
                    >
                        <Clock size={13} aria-hidden="true" />
                        {title} — Coming Soon
                    </button>
                </motion.div>

                {/* ── Info card ─────────────────────── */}
                <motion.div
                    variants={item}
                    className="w-full max-w-sm rounded-md border border-[#E5E5E5] bg-white p-4 text-center"
                >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999999]">
                        Planned Feature
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-[#666666]">
                        This module is actively being developed and will be
                        available in a future release of InsightAI.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
