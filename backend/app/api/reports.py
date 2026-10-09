import re
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import Response

from app.services.dataset_store import has_dataset
from app.services.report import build_pdf_report, get_full_report

router = APIRouter(
    prefix="/api",
    tags=["Reports"],
)


@router.get("/report")
def get_report():
    """
    Get the comprehensive report data for the currently active dataset.
    """
    if not has_dataset():
        raise HTTPException(
            status_code=404,
            detail="No dataset available. Please upload a dataset to generate a report.",
        )

    try:
        report = get_full_report()
        return report
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(exc)}",
        )


@router.get("/report/pdf")
def download_report_pdf():
    """
    Generate and download a professional PDF report using ReportLab.
    """
    if not has_dataset():
        raise HTTPException(
            status_code=404,
            detail="No dataset available. Please upload a dataset to generate a PDF report.",
        )

    try:
        report_data = get_full_report()
        pdf_bytes = build_pdf_report(report_data)

        raw_filename = report_data.get("dataset_info", {}).get("name", "dataset")
        # Strip extension if present
        clean_name = re.sub(r"\.[^.]+$", "", raw_filename)
        # Sanitize for header
        clean_name = re.sub(r"[^\w\-_\.]", "_", clean_name)
        pdf_filename = f"InsightAI_Report_{clean_name}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{pdf_filename}"',
                "Content-Type": "application/pdf",
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF report: {str(exc)}",
        )
