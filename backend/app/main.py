from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.analytics import router as analytics_router
from app.api.insights import router as insights_router
from app.api.ai_insights import router as ai_insights_router
from app.api.reports import router as reports_router


# Create FastAPI app FIRST
app = FastAPI(
    title="InsightAI API",
    description="AI-powered Business Intelligence Analyst",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers AFTER app is created
app.include_router(upload_router)
app.include_router(analytics_router)
app.include_router(insights_router)
app.include_router(ai_insights_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {
        "message": "InsightAI API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }