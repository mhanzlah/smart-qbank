from schema import Input

def generate_mcq_prompt(i:Input):
    option_letters = [chr(65 + i) for i in range(5)]  # A, B, C, D, E...

    prompt = f"""You are an expert exam question generator. Generate {i.num_questions} multiple choice questions (MCQs) in English for the subject "{i.subject}", suitable for a student at the "{i.level}" level, based on the following content:

"{i.content}"

Requirements:
- Difficulty level: {i.difficulty}
- Each question must have exactly {5} options ({", ".join(option_letters)})
- Questions must test understanding, not just memorization
- Questions must be appropriate for a "{i.level}" student
- Do not repeat the same concept across multiple questions
- The entire response must be written in English only

Return ONLY valid JSON, with no extra text, no markdown, and no explanations outside the JSON. Use exactly this structure:

{{
  "subject": "{i.subject}",
  "level": "{i.level}",
  "difficulty": "{i.difficulty}",
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

Now generate the JSON output with {i.num_questions} questions.
"""
    return prompt
