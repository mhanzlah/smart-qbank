from schema import Input


def generate_mcq_prompt(data: Input) -> str:
    option_letters = ["A", "B", "C", "D"]

    return f"""
You are an expert exam question generator.

Generate exactly {data.num_questions} multiple-choice questions (MCQs) in English for the subject "{data.subject.value}", suitable for a "{data.level.value}" student, based only on the following content.

Content:
\"\"\"
{data.content}
\"\"\"

Requirements:
- Difficulty: {data.difficulty.value}
- Generate exactly {data.num_questions} questions.
- Each question must have exactly 4 options (A, B, C, D).
- Only one option is correct.
- Questions should assess understanding and application, not simple memorization.
- Do not repeat concepts across questions.
- Do not invent information that is not present in the provided content.
- Write everything in English.
- Return ONLY valid JSON.
- Do NOT include markdown, explanations, or any additional text.

The JSON must exactly follow this structure:

{{
  "subject": "{data.subject.value}",
  "level": "{data.level.value}",
  "difficulty": "{data.difficulty.value}",
  "questions": [
    {{
      "question_number": 1,
      "question_text": "Question text",
      "options": {{
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      }},
      "correct_answer": "A"
    }}
  ]
}}

Now generate exactly {data.num_questions} questions.
""".strip()
