import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schema import Input
from prompt import generate_mcq_prompt
from model import model

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Smart Qbank API"}


@app.post("/process")
async def process_input(i: Input):
    prompt = generate_mcq_prompt(i)

    response = model.generate(prompt)

    response = re.sub(r"^```json\s*|^```\s*|\s*```$", "", response.strip())  # type: ignore

    try:
        response_json = json.loads(response)
    except json.JSONDecodeError:
        return {
            "status": "error",
            "message": "Model did not return valid JSON.",
            "raw_response": response,
        }

    return {
        "status": "success",
        "response": response_json,
    }
