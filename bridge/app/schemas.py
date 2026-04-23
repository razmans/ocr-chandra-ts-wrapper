from pydantic import BaseModel, Field
from typing import Any


class ProcessOptions(BaseModel):
    pageRange: str | None = None
    includeImages: bool | None = True
    includeHeadersFooters: bool | None = False
    formats: list[str] | None = Field(default_factory=lambda: ["markdown", "html", "layout"])
    outputDir: str | None = None
    maxOutputTokens: int | None = None
    batchSize: int | None = None
    maxWorkers: int | None = None
    metadata: dict[str, Any] | None = None


class ProcessFileRequest(BaseModel):
    inputPath: str
    options: ProcessOptions | None = None
