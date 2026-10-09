from fastapi import APIRouter, HTTPException

from app.services.insights import generate_insights


router = APIRouter(
    prefix="/api",
    tags=["AI Insights"],
)


@router.get("/insights")
def get_insights():
    try:
        return generate_insights()

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Insight generation failed: {str(error)}",
        )