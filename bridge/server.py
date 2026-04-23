from fastapi import FastAPI
import uvicorn
from app.routes import router
from app.settings import HOST, PORT

app = FastAPI(title="chandra-bridge", version="0.1.0")
app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
