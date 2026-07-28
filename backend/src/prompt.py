from schema import Input


def generate_mcq_prompt(i: Input) -> str:
    option_letters = ["A", "B", "C", "D"]

    return f"""
You are an expert exam question generator.

Generate exactly {i.num_questions} multiple-choice questions (MCQs) in English for the subject "{i.subject.value}", suitable for a "{i.level.value}" student, based only on the following content.

Content:
\"\"\"
{i.content}
\"\"\"

Requirements:
- Difficulty: {i.difficulty.value}
- Generate exactly {i.num_questions} questions.
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
  "subject": "{i.subject.value}",
  "level": "{i.level.value}",
  "difficulty": "{i.difficulty.value}",
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

Now generate exactly {i.num_questions} questions.
""".strip()
