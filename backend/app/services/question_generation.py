import json
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.question import Question
from app.models.topic import Topic
from app.schemas.question import (
    DifficultyDistribution,
    GeneratedQuestion,
    QuestionDifficulty,
    QuestionGenerationRequest,
    QuestionGenerationResponse,
)
from app.services.llama import LlamaService


class QuestionGenerationService:

    async def generate(
        self,
        session: Session,
        request: QuestionGenerationRequest,
    ) -> QuestionGenerationResponse:

        # --------------------------------------------------------------
        # Get topic
        # --------------------------------------------------------------

        topic = session.get(Topic, request.topic_id)

        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found",
            )

        distribution = request.difficulty_distribution

        total_questions = distribution.total

        # --------------------------------------------------------------
        # Generate questions for each difficulty
        # --------------------------------------------------------------

        generated_questions: list[GeneratedQuestion] = []

        difficulty_counts = {
            QuestionDifficulty.easy: distribution.easy,
            QuestionDifficulty.medium: distribution.medium,
            QuestionDifficulty.hard: distribution.hard,
        }

        for difficulty, count in difficulty_counts.items():

            if count == 0:
                continue

            questions = await self._generate_for_difficulty(
                topic=topic,
                difficulty=difficulty,
                count=count,
            )

            generated_questions.extend(questions)

        # --------------------------------------------------------------
        # Final count check
        # --------------------------------------------------------------

        if len(generated_questions) != total_questions:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Generated {len(generated_questions)} questions "
                    f"instead of {total_questions}"
                ),
            )

        # --------------------------------------------------------------
        # Save validated questions
        # --------------------------------------------------------------

        db_questions: list[Question] = []

        for generated in generated_questions:

            question = Question(
                topic_id=topic.id,
                question=generated.question,
                options=list(generated.options.values()),
                correct_option=generated.correct_option,
                difficulty=generated.difficulty,
                cognitive_level=generated.cognitive_level,
                explanation=generated.explanation,
                # LLM validation succeeded.
                is_validated=True,
                # Human reviewer has not reviewed it yet.
                review_status="pending",
            )

            db_questions.append(question)

        session.add_all(db_questions)
        session.commit()

        # Refresh database-generated values.
        for question in db_questions:
            session.refresh(question)

        # --------------------------------------------------------------
        # Return
        # --------------------------------------------------------------

        return QuestionGenerationResponse(
            questions=db_questions,
            total_generated=len(db_questions),
            difficulty_distribution=distribution,
        )

    # ==================================================================
    # Generate questions for one difficulty
    # ==================================================================

    async def _generate_for_difficulty(
        self,
        topic: Topic,
        difficulty: QuestionDifficulty,
        count: int,
    ) -> list[GeneratedQuestion]:

        generated: list[GeneratedQuestion] = []

        max_attempts = 3

        for attempt in range(max_attempts):

            remaining = count - len(generated)

            if remaining <= 0:
                break

            prompt = self._build_prompt(
                topic=topic,
                difficulty=difficulty,
                count=remaining,
                existing_questions=generated,
            )

            system_prompt = (
                "You are an expert academic multiple-choice question "
                "designer. Return ONLY valid JSON. "
                "Do not return Markdown, code fences, explanations, "
                "or any text outside the JSON object."
            )

            try:
                raw_response = await LlamaService.generate(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    temperature=0.2,
                    max_tokens=8000,
                )

                questions = self._parse_response(raw_response)

            except HTTPException:
                if attempt == max_attempts - 1:
                    raise

                continue

            # ----------------------------------------------------------
            # Validate and add unique questions
            # ----------------------------------------------------------

            for question in questions:

                # Make sure returned difficulty is correct.
                if question.difficulty != difficulty:
                    continue

                normalized = question.question.strip().lower()

                duplicate = any(
                    existing.question.strip().lower() == normalized
                    for existing in generated
                )

                if duplicate:
                    continue

                generated.append(question)

                if len(generated) >= count:
                    break

        if len(generated) != count:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Unable to generate {count} valid "
                    f"{difficulty.value} questions. "
                    f"Generated {len(generated)}."
                ),
            )

        return generated

    # ==================================================================
    # Prompt
    # ==================================================================

    def _build_prompt(
        self,
        topic: Topic,
        difficulty: QuestionDifficulty,
        count: int,
        existing_questions: list[GeneratedQuestion],
    ) -> str:

        existing_section = ""

        if existing_questions:
            existing_text = "\n".join(
                f"- {question.question}" for question in existing_questions
            )

            existing_section = f"""
Questions already generated in this request:

{existing_text}

DO NOT repeat or closely duplicate these questions.
"""

        return f"""
Generate EXACTLY {count} multiple-choice questions.

Topic:
{topic.name}

Topic Description:
{topic.description or "No description provided"}

MCQ Focus:
{topic.mcq_focus or "No MCQ focus provided"}

Key Areas:
{", ".join(topic.key_areas) if topic.key_areas else "No key areas provided"}

Required Difficulty:
{difficulty.value}

{existing_section}

Requirements:

1. Generate EXACTLY {count} questions.
2. Every question must be relevant to the topic.
3. Every question MUST have exactly one correct answer.
4. Questions must be appropriate for undergraduate students.
5. Questions must match the requested difficulty.
6. Do not duplicate questions.
7. Do not generate ambiguous questions.
8. Do not use "all of the above".
9. Do not use "none of the above".
10. Every question must contain an explanation.
11. Every question must contain a cognitive_level.
12. Options must be labeled A, B, C, D.
13. correct_option MUST be one of:
    "A", "B", "C", "D"

Difficulty definition:

Easy:
- Recall and basic understanding.
- Tests definitions, facts, terminology, and straightforward concepts.

Medium:
- Understanding and application.
- Requires applying concepts or interpreting information.

Hard:
- Analysis and evaluation.
- Requires reasoning, comparison, interpretation, or deeper analysis.

Return ONLY valid JSON.

Use EXACTLY this structure:

{{
  "questions": [
    {{
      "question": "What is ...?",
      "options": {{
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      }},
      "correct_option": "B",
      "difficulty": "{difficulty.value}",
      "cognitive_level": "Understand",
      "explanation": "The correct answer is B because ..."
    }}
  ]
}}

CRITICAL:

The "questions" array MUST contain EXACTLY {count} objects.

Do not return:
- Markdown
- code fences
- comments
- explanations outside JSON
- additional fields
""".strip()

    # ==================================================================
    # Parse LLM response
    # ==================================================================

    def _parse_response(
        self,
        raw_response: str,
    ) -> list[GeneratedQuestion]:

        raw_response = raw_response.strip()

        if not raw_response:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Model returned an empty response",
            )

        # Remove accidental Markdown fences.
        if raw_response.startswith("```"):

            lines = raw_response.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            raw_response = "\n".join(lines).strip()

        # Extract JSON object.
        start = raw_response.find("{")
        end = raw_response.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Model returned no valid JSON object",
            )

        raw_response = raw_response[start : end + 1]

        # Parse JSON.
        try:
            data = json.loads(raw_response)

        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Model returned invalid JSON: {exc}",
            ) from exc

        # Validate structure.
        try:
            questions_data = data["questions"]

            if not isinstance(questions_data, list):
                raise ValueError("'questions' must be a list")

            return [
                GeneratedQuestion.model_validate(question)
                for question in questions_data
            ]

        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(f"Model returned invalid question structure: {exc}"),
            ) from exc
