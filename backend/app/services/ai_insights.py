import json
import os

from dotenv import load_dotenv
from openai import OpenAI

from app.services.insights import generate_insights


load_dotenv()


def generate_ai_insights() -> dict:
    """
    Generate natural-language business reasoning
    using verified analytics from our existing
    InsightAI engine.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY is not configured."
        )

    client = OpenAI(api_key=api_key)

    # --------------------------------------------------
    # Get verified business insights
    # --------------------------------------------------

    business_data = generate_insights()

    # --------------------------------------------------
    # Prepare compact context for the LLM
    # --------------------------------------------------

    context = {
        "metrics": business_data.get(
            "metrics",
            {},
        ),
        "summary": business_data.get(
            "summary",
            {},
        ),
        "insights": business_data.get(
            "insights",
            [],
        ),
    }

    context_json = json.dumps(
        context,
        indent=2,
        ensure_ascii=False,
    )

    # --------------------------------------------------
    # AI Instructions
    # --------------------------------------------------

    instructions = """
You are InsightAI, an expert business intelligence analyst.

Analyze the verified business metrics and findings provided
to you.

Your job is NOT to recalculate numbers.

The numbers supplied by the application are authoritative.

You should:

1. Explain the most important business findings.
2. Identify risks and opportunities.
3. Explain WHY a finding matters.
4. Give practical business recommendations.
5. Prioritize the most important actions.
6. Never invent metrics, products, regions or facts.
7. Never change numerical values.
8. Keep recommendations specific and actionable.

Write for a business owner or manager, not a data scientist.

Return valid JSON with exactly this structure:

{
  "executive_summary": "string",
  "key_findings": [
    {
      "title": "string",
      "explanation": "string",
      "impact": "high | medium | low"
    }
  ],
  "recommendations": [
    {
      "title": "string",
      "action": "string",
      "priority": "high | medium | low"
    }
  ],
  "risk_summary": "string",
  "growth_opportunity": "string"
}

Do not include markdown.
Do not include code fences.
"""

    prompt = f"""
Here is the verified business analysis:

{context_json}

Generate the business intelligence response.
"""

    # --------------------------------------------------
    # Call OpenAI Responses API
    # --------------------------------------------------

    response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=instructions,
        input=prompt,
    )

    output_text = response.output_text.strip()

    # --------------------------------------------------
    # Parse JSON
    # --------------------------------------------------

    try:
        result = json.loads(output_text)

    except json.JSONDecodeError:
        result = {
            "executive_summary": output_text,
            "key_findings": [],
            "recommendations": [],
            "risk_summary": "",
            "growth_opportunity": "",
        }

    return {
        "success": True,
        "ai_analysis": result,
    }