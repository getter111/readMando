from fastapi import FastAPI, BackgroundTasks, Response
from melo.api import TTS

import os
import tempfile #provides safe OS way to create directories 
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://readmando.netlify.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def delete_file(path: str):
    if os.path.exists(path):
        os.remove(path)

# Initialize the TTS model once at the app startup to improve performance
model = None

@app.on_event("startup")
async def startup():
    global model
    model = TTS(language="ZH", device="auto")
    
@app.get("/")
def read_root():
    return {"message": "Hello MeloTTS Microservice!"}

#stateless tts generation
@app.get("/tts")
async def tts(text: str, background_tasks: BackgroundTasks, id: int, type: str):
    """Takes in Chinese text and returns audio speech"""

    #tempfile creates the correct os temp dir for the system. it was erroring b4 bc we were hard coding unix path for a windows os
    output_path = os.path.join(tempfile.gettempdir(), f"readMando_{type}_audio_{id}.wav")

    speaker_ids = model.hps.data.spk2id
    model.tts_to_file(text, speaker_ids['ZH'], output_path, speed=1.0)
    print("OUTPUT PATH: " + output_path)

    if os.path.exists(output_path):
        # Read the file content into memory
        with open(output_path, "rb") as f:
            file_bytes = f.read()

        # Schedule deletion AFTER response is sent
        background_tasks.add_task(delete_file, output_path)

        # Send the bytes manually — this forces 200 OK
        return Response(content=file_bytes, media_type="audio/wav", background=background_tasks)
    else:
        return {"error": "Audio file not generated successfully"}