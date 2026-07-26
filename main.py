import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage
from langfuse import Langfuse

from config.config import RequestObject
from MarketInsight.components.agent import agent
from MarketInsight.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Market Insight API",
    description="Streaming AI market-research API backed by live financial tools.",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST"),
)

SYSTEM_PROMPT = """You are Market Insight, a careful market-research assistant.
Use the available tools whenever a question depends on current or company-specific
financial data. Resolve a company's ticker before requesting ticker-based data.
Separate facts from interpretation, state data limitations clearly, and never
invent prices, ratios, recommendations, or events. Keep answers useful and
structured, and remind users that research is not personalized financial advice
when a response could be interpreted as an investment recommendation."""


@app.get("/health")
async def health_check():
    """Return service health for hosting probes and uptime monitors."""
    return {"status": "ok", "service": "market-insight-api", "version": "1.0.0"}


@app.post("/api/chat")
async def chat(request: RequestObject):
    config = {"configurable": {"thread_id": request.thread_id}}

    async def generate():
        try:
            with langfuse.start_as_current_observation(
                as_type="span",
                name="chat-request",
                input=request.prompt.content,
            ) as span:
                span.update(metadata={"thread_id": request.thread_id})

                with langfuse.start_as_current_observation(
                    as_type="generation",
                    name="agent-stream",
                    model="agentic-workflow",
                    input=request.prompt.content,
                ) as generation:
                    full_response = ""
                    for token, _ in agent.stream(
                        {
                            "messages": [
                                SystemMessage(content=SYSTEM_PROMPT),
                                HumanMessage(content=request.prompt.content),
                            ]
                        },
                        stream_mode="messages",
                        config=config,
                    ):
                        if token.content:
                            full_response += token.content
                            yield token.content

                    generation.update(output=full_response)
                span.update(output="Request completed successfully")

        except Exception as exc:
            logger.exception("Chat request failed: %s", exc)
            yield "\n\nThe analysis service encountered an error. Please try again."

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    logger.info("Starting Market Insight API")
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
