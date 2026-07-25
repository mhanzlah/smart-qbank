from fastapi import FastAPI
from schema import Input
from prompt import generate_mcq_prompt

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Smart Qbank API"}


@app.post("/process")
async def process_input(i: Input):
    prompt = generate_mcq_prompt(i)
    return {
        "status": "success",
        "prompt": prompt,
    }
    