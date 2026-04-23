import json
from fastapi import APIRouter, UploadFile, File, Form
from .health import health_payload
from .processing import process_file, process_upload
from .schemas import ProcessFileRequest
from .settings import SERVICE_NAME, SERVICE_VERSION, CHANDRA_VERSION, MODEL_NAME, HOST, PORT

router = APIRouter()


@router.get("/health")
def get_health():
    return health_payload()


@router.get("/info")
def get_info():
    return {
        "ok": True,
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "backend": "python",
        "chandraVersion": CHANDRA_VERSION,
        "model": MODEL_NAME,
        "config": {
            "host": HOST,
            "port": PORT,
        },
        "capabilities": {
            "processFilePath": True,
            "processUpload": True,
            "includeImages": True,
            "includeHeadersFooters": True,
            "layoutOutput": True,
            "htmlOutput": True,
            "markdownOutput": True,
            "jsonOutput": True,
        },
    }


@router.post("/process/file")
def post_process_file(payload: ProcessFileRequest):
    return process_file(payload.inputPath, payload.options.model_dump() if payload.options else None)


@router.post("/process/upload")
async def post_process_upload(
    file: UploadFile = File(...),
    options: str | None = Form(default=None),
    filename: str | None = Form(default=None),
):
    parsed_options = json.loads(options) if options else {}
    upload_bytes = await file.read()
    return process_upload(filename or file.filename or "upload.bin", parsed_options, upload_bytes)
