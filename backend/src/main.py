from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Smart Qbank API"}

def generate_mcq_prompt(subject, contents, student_level, num_questions=10, difficulty="easy", options_count=5):
    option_letters = [chr(65 + i) for i in range(options_count)]  # A, B, C, D, E...

    prompt = f"""You are an expert exam question generator. Generate {num_questions} multiple choice questions (MCQs) in English for the subject "{subject}", suitable for a student at the "{student_level}" level, based on the following content:

"{contents}"

Requirements:
- Difficulty level: {difficulty}
- Each question must have exactly {options_count} options ({", ".join(option_letters)})
- Questions must test understanding, not just memorization
- Questions must be appropriate for a "{student_level}" student
- Do not repeat the same concept across multiple questions
- The entire response must be written in English only

Return ONLY valid JSON, with no extra text, no markdown, and no explanations outside the JSON. Use exactly this structure:

{{
  "subject": "{subject}",
  "student_level": "{student_level}",
  "difficulty": "{difficulty}",
  "questions": [
    {{
      "question_number": 1,
      "question_text": "...",
      "options": {{
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      }},
      "correct_answer": "A"
    }}
  ]
}}

Now generate the JSON output with {num_questions} questions.
"""
    return prompt
