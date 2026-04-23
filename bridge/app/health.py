from .settings import SERVICE_NAME, SERVICE_VERSION, CHANDRA_VERSION, MODEL_NAME, HOST, PORT


def health_payload() -> dict:
    return {
        "ok": True,
        "service": SERVICE_NAME,
        "ready": True,
        "version": SERVICE_VERSION,
        "backend": "python",
        "chandraVersion": CHANDRA_VERSION,
        "model": MODEL_NAME,
        "host": HOST,
        "port": PORT,
    }
