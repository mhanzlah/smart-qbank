import json
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.subject import Subject
from app.models.topic import Topic
from app.schemas.question import (
    DifficultyDistribution,
    GeneratedQuestion,
    QuestionGenerationResponse,
)
from app.services.llama import LlamaService


class QuestionGenerationService:
    VALID_DIFFICULTIES = {
        "easy",
        "medium",
        "hard",
    }

    REQUIRED_FIELDS = {
        "question",
        "options",
        "correct_option",
        "difficulty",
        "cognitive_level",
        "explanation",
    }

    OPTION_KEYS = {
        "A",
        "B",
        "C",
        "D",
        "E",
    }

    async def generate(
        self,
        session: Session,
        topic_id: uuid.UUID,
        difficulty_distribution: DifficultyDistribution,
        max_tokens: int = 4096,
    ) -> QuestionGenerationResponse:

        # ------------------------------------------------------------------
        # Get topic
        # ------------------------------------------------------------------

        topic = session.get(Topic, topic_id)

        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found",
            )

        # ------------------------------------------------------------------
        # Get subject
        # ------------------------------------------------------------------

        subject = session.get(Subject, topic.subject_id)

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )

        # ------------------------------------------------------------------
        # Calculate total from distribution
        # ------------------------------------------------------------------

        total = (
            difficulty_distribution.easy
            + difficulty_distribution.medium
            + difficulty_distribution.hard
        )

        if total <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Difficulty distribution must contain at least one question.",
            )

        generated_questions: list[GeneratedQuestion] = []

        # ------------------------------------------------------------------
        # Generate each difficulty separately
        # ------------------------------------------------------------------

        distribution = {
            "easy": difficulty_distribution.easy,
            "medium": difficulty_distribution.medium,
            "hard": difficulty_distribution.hard,
        }

        for difficulty, count in distribution.items():

            if count == 0:
                continue

            questions = await self._generate_for_difficulty(
                subject_name=subject.name,
                topic=topic,
                number_of_questions=count,
                difficulty=difficulty,
                max_tokens=max_tokens,
            )

            generated_questions.extend(
                GeneratedQuestion.model_validate(question) for question in questions
            )

        # ------------------------------------------------------------------
        # Final validation
        # ------------------------------------------------------------------

        if len(generated_questions) != total:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Generated {len(generated_questions)} questions "
                    f"instead of {total}."
                ),
            )

        # ------------------------------------------------------------------
        # Validate difficulty distribution
        # ------------------------------------------------------------------

        actual_distribution = {
            "easy": 0,
            "medium": 0,
            "hard": 0,
        }

        for question in generated_questions:
            actual_distribution[question.difficulty.value] += 1

        for difficulty, expected_count in distribution.items():
            actual_count = actual_distribution[difficulty]

            if actual_count != expected_count:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        f"Generated {actual_count} {difficulty} questions "
                        f"instead of {expected_count}."
                    ),
                )

        return QuestionGenerationResponse(  # type: ignore
            questions=generated_questions,
            total_generated=len(generated_questions),
        )

    async def _generate_for_difficulty(
        self,
        subject_name: str,
        topic: Topic,
        number_of_questions: int,
        difficulty: str,
        max_tokens: int,
    ) -> list[dict]:

        if difficulty not in self.VALID_DIFFICULTIES:
            raise ValueError(
                f"Invalid difficulty: {difficulty}. "
                f"Expected one of {sorted(self.VALID_DIFFICULTIES)}."
            )

        if number_of_questions <= 0:
            return []

        prompt = f"""
You are an expert university MCQ examiner.

STUDENT LEVEL:
Undergraduate

SUBJECT:
{subject_name}

TOPIC:
{topic.name}

TOPIC DESCRIPTION:
{topic.description or ""}

KEY AREAS:
{json.dumps(topic.key_areas or [], ensure_ascii=False)}

MCQ FOCUS:
{topic.mcq_focus or ""}

COGNITIVE LEVELS:
{json.dumps(topic.cognitive_levels or [], ensure_ascii=False)}

TASK:
Generate exactly {number_of_questions} high-quality
multiple-choice questions for this topic.

DIFFICULTY:
Generate ONLY {difficulty.upper()} difficulty questions.

DIFFICULTY DEFINITIONS:

EASY:
Tests knowledge, understanding, recall of concepts, or
straightforward application with little reasoning.

MEDIUM:
Requires application, interpretation, comparison, or
moderate reasoning.

HARD:
Requires deeper analysis, evaluation, comparison,
multi-step reasoning, or solving a non-trivial problem.

COGNITIVE LEVEL:
Use ONLY the cognitive levels provided for this topic.

QUESTION REQUIREMENTS:
- Exactly 5 options.
- Exactly 1 correct answer.
- Options must be plausible.
- Options must be mutually distinguishable.
- Do not create ambiguous questions.
- Do not repeat questions.
- Stay strictly within the topic.
- Questions must be appropriate for undergraduate students.
- Do not use "all of the above".
- Do not use "none of the above".
- Do not make the correct answer obvious because of its length.
- Vary the correct answer position across A-E.

QUESTION LENGTH:
- Prefer approximately 15-250 characters.
- Keep questions concise and focused.
- Avoid unnecessary context.

OPTION LENGTH:
- Prefer approximately 5-100 characters.
- Keep options reasonably similar in length.
- Do not put explanations inside options.

EXPLANATION:
- Briefly explain why the correct answer is correct.
- Prefer approximately 30-300 characters.

LATEX:
Use LaTeX only when mathematical notation is genuinely required.

If LaTeX contains a backslash, ensure it is properly
escaped for valid JSON.

DIVERSITY:
- Do not test the same fact repeatedly.
- Vary question structures.
- Cover different key areas when possible.
- Vary correct answer positions.

OUTPUT:
Return ONLY a valid JSON array.

Each object MUST contain exactly these fields:

{{
    "question": "",
    "options": {{
        "A": "",
        "B": "",
        "C": "",
        "D": "",
        "E": ""
    }},
    "correct_option": "A",
    "difficulty": "{difficulty}",
    "cognitive_level": "Understand",
    "explanation": ""
}}

STRICT RULES:
- Return exactly {number_of_questions} questions.
- JSON ONLY.
- No markdown.
- No code fences.
- No explanation outside JSON.
- Exactly 5 options per question.
- Exactly 1 correct option.
- correct_option must be A, B, C, D, or E.
- difficulty must be exactly "{difficulty}".
- cognitive_level must be one of the provided topic levels.
- Do not include duplicate fields.
""".strip()

        output = await LlamaService.generate(
            prompt=prompt,
            system_prompt=(
                "You are an expert university MCQ examiner. "
                "Return ONLY valid JSON. "
                "Do not return Markdown, code fences, "
                "or explanations outside the JSON."
            ),
            temperature=0.1,
            max_tokens=max_tokens,
        )

        return self._parse_response(
            output=output,
            expected_count=number_of_questions,
            expected_difficulty=difficulty,
            cognitive_levels=topic.cognitive_levels or [],
        )

    @classmethod
    def _parse_response(
        cls,
        output: str,
        expected_count: int,
        expected_difficulty: str,
        cognitive_levels: list[str] | None = None,
    ) -> list[dict]:

        output = output.strip()

        if not output:
            raise ValueError("LLM returned an empty response.")

        # ------------------------------------------------------------------
        # Remove markdown code fences
        # ------------------------------------------------------------------

        if output.startswith("```"):
            lines = output.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            output = "\n".join(lines).strip()

        # ------------------------------------------------------------------
        # Extract JSON array
        # ------------------------------------------------------------------

        start = output.find("[")
        end = output.rfind("]")

        if start == -1 or end == -1 or end <= start:
            raise ValueError("LLM response does not contain a valid JSON array.")

        output = output[start : end + 1]

        # ------------------------------------------------------------------
        # Parse JSON
        # ------------------------------------------------------------------

        try:
            data = json.loads(output)

        except json.JSONDecodeError as exc:
            raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

        if isinstance(data, dict):
            data = [data]

        if not isinstance(data, list):
            raise ValueError("LLM response must be a JSON array.")

        if not data:
            raise ValueError("LLM returned an empty array.")

        # ------------------------------------------------------------------
        # Validate count
        # ------------------------------------------------------------------

        if len(data) != expected_count:
            raise ValueError(
                f"LLM returned {len(data)} questions, "
                f"but {expected_count} were requested."
            )

        # ------------------------------------------------------------------
        # Validate each question
        # ------------------------------------------------------------------

        seen_questions: set[str] = set()

        for index, question in enumerate(data):

            question_number = index + 1

            if not isinstance(question, dict):
                raise ValueError(f"Question {question_number} must be a JSON object.")

            # Fields
            fields = set(question.keys())

            if fields != cls.REQUIRED_FIELDS:
                missing = cls.REQUIRED_FIELDS - fields
                extra = fields - cls.REQUIRED_FIELDS

                details = []

                if missing:
                    details.append(f"missing fields: {sorted(missing)}")

                if extra:
                    details.append(f"unexpected fields: {sorted(extra)}")

                raise ValueError(
                    f"Question {question_number} has invalid fields. "
                    + "; ".join(details)
                )

            # Question text
            question_text = question["question"]

            if not isinstance(question_text, str):
                raise ValueError(f"Question {question_number} text must be a string.")

            question_text = question_text.strip()

            if not question_text:
                raise ValueError(f"Question {question_number} text cannot be empty.")

            normalized_question = question_text.lower()

            if normalized_question in seen_questions:
                raise ValueError(f"Question {question_number} is a duplicate.")

            seen_questions.add(normalized_question)

            # Options
            options = question["options"]

            if not isinstance(options, dict):
                raise ValueError(
                    f"Question {question_number} options must be an object."
                )

            if set(options.keys()) != cls.OPTION_KEYS:
                raise ValueError(
                    f"Question {question_number} must contain exactly "
                    "options A, B, C, D, and E."
                )

            if not all(isinstance(value, str) for value in options.values()):
                raise ValueError(
                    f"Question {question_number} options must contain " "only strings."
                )

            if any(not value.strip() for value in options.values()):
                raise ValueError(f"Question {question_number} options cannot be empty.")

            # Correct option
            correct_option = question["correct_option"]

            if correct_option not in cls.OPTION_KEYS:
                raise ValueError(
                    f"Question {question_number} has invalid "
                    f"correct_option: {correct_option}"
                )

            # Difficulty
            difficulty = question["difficulty"]

            if difficulty != expected_difficulty:
                raise ValueError(
                    f"Question {question_number} has difficulty "
                    f"'{difficulty}', expected '{expected_difficulty}'."
                )

            # Cognitive level
            cognitive_level = question["cognitive_level"]

            if not isinstance(cognitive_level, str):
                raise ValueError(
                    f"Question {question_number} cognitive_level " "must be a string."
                )

            if not cognitive_level.strip():
                raise ValueError(
                    f"Question {question_number} cognitive_level " "cannot be empty."
                )

            if cognitive_levels:
                normalized_levels = {
                    level.strip().lower() for level in cognitive_levels
                }

                if cognitive_level.strip().lower() not in normalized_levels:
                    raise ValueError(
                        f"Question {question_number} uses cognitive "
                        f"level '{cognitive_level}', which is not "
                        "allowed for this topic."
                    )

            # Explanation
            explanation = question["explanation"]

            if not isinstance(explanation, str):
                raise ValueError(
                    f"Question {question_number} explanation " "must be a string."
                )

            if not explanation.strip():
                raise ValueError(
                    f"Question {question_number} explanation " "cannot be empty."
                )

        return data
