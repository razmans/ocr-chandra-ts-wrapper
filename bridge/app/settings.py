import os

HOST = os.getenv("CHANDRA_BRIDGE_HOST", "127.0.0.1")
PORT = int(os.getenv("CHANDRA_BRIDGE_PORT", "8282"))
SERVICE_NAME = "chandra-bridge"
SERVICE_VERSION = "0.1.0"
CHANDRA_VERSION = "0.2.0"
MODEL_NAME = "datalab-to/chandra-ocr-2"
