from fastapi import APIRouter, HTTPException

from app.services.ai_insights import generate_ai_insights


router = APIRouter(
    prefix="/api",
    tags=["AI"],
)


@router.get("/ai-insights")
def get_ai_insights():

    try:
        return generate_ai_insights()

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}",
        )