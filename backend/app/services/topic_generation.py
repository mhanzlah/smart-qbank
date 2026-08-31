import json

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.subject import Subject
from app.schemas.topic import (
    GeneratedTopic,
    TopicGenerationRequest,
    TopicGenerationResponse,
)
from app.services.llama import LlamaService


class TopicGenerationService:
    async def generate(
        self,
        session: Session,
        request: TopicGenerationRequest,
    ) -> TopicGenerationResponse:
        subject = session.get(Subject, request.subject_id)

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )

        generated_topics: list[GeneratedTopic] = []

        # Local LLMs may return fewer topics than requested.
        # Retry and ask specifically for the remaining topics.
        max_attempts = 3

        for attempt in range(max_attempts):
            remaining = request.number_of_topics - len(generated_topics)

            if remaining <= 0:
                break

            prompt = self._build_prompt(
                subject=subject,
                number_of_topics=remaining,
                existing_topics=generated_topics,
            )

            system_prompt = (
                "You are an expert academic curriculum designer. "
                "Return ONLY valid JSON. "
                "Do not return Markdown, code fences, explanations, "
                "or any text outside the JSON object. "
                "Every topic MUST contain all required fields."
            )

            try:
                raw_response = await LlamaService.generate(
                    prompt=prompt,
                    system_prompt=system_prompt,
                    temperature=0.1,
                    max_tokens=8000,
                )

                result = self._parse_response(raw_response)

            except HTTPException:
                # If this was the final attempt, return the error.
                if attempt == max_attempts - 1:
                    raise

                # Otherwise retry.
                continue

            # Add only unique topics.
            for topic in result.topics:
                topic_name = topic.name.strip().lower()

                already_exists = any(
                    existing.name.strip().lower() == topic_name
                    for existing in generated_topics
                )

                if not already_exists:
                    generated_topics.append(topic)

                if len(generated_topics) >= request.number_of_topics:
                    break

        if len(generated_topics) < request.number_of_topics:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    f"Unable to generate {request.number_of_topics} unique topics. "
                    f"Generated {len(generated_topics)} after {max_attempts} attempts."
                ),
            )

        return TopicGenerationResponse(
            topics=generated_topics[: request.number_of_topics],
        )

    def _build_prompt(
        self,
        subject: Subject,
        number_of_topics: int,
        existing_topics: list[GeneratedTopic],
    ) -> str:
        existing_topic_names = "\n".join(f"- {topic.name}" for topic in existing_topics)

        if existing_topics:
            existing_section = f"""
The following topics have ALREADY been generated:

{existing_topic_names}

You MUST NOT generate any of these topics again.

Generate completely different topics.
"""
        else:
            existing_section = ""

        return f"""
Generate EXACTLY {number_of_topics} NEW academic topics for this subject.

Subject:
{subject.name}

Course Learning Outcomes:
{subject.clo or "No CLOs provided"}

{existing_section}

For EVERY topic, provide ALL of these fields:

1. name
   - Concise academic topic name.

2. description
   - Brief explanation of what the topic covers.

3. cognitive_levels
   - JSON array containing relevant Bloom's taxonomy levels.
   - ONLY use:
     "Remember"
     "Understand"
     "Apply"
     "Analyze"
     "Evaluate"
     "Create"

4. mcq_focus
   - Explain what concepts from this topic should be emphasized
     when generating multiple-choice questions.

5. key_areas
   - JSON array containing important concepts or subtopics.

Requirements:

- Generate EXACTLY {number_of_topics} topic objects.
- Every object MUST contain all five fields.
- Do NOT omit any field.
- Do NOT generate duplicate topics.
- Do NOT repeat any previously generated topic.
- Topics must be relevant to the subject.
- Topics must collectively cover the CLOs.
- Topics must be distinct and non-overlapping.
- Topics must be appropriate for undergraduate education.
- Topic names must be concise and academic.
- cognitive_levels MUST be a JSON array.
- key_areas MUST be a JSON array.

Return ONLY valid JSON.

The response MUST have exactly this structure:

{{
  "topics": [
    {{
      "name": "Introduction to Programming",
      "description": "Fundamental concepts of programming and computational thinking.",
      "cognitive_levels": [
        "Remember",
        "Understand",
        "Apply"
      ],
      "mcq_focus": "Programming fundamentals, computational thinking, and basic programming concepts.",
      "key_areas": [
        "Programming concepts",
        "Computational thinking",
        "Algorithms",
        "Problem solving"
      ]
    }}
  ]
}}

CRITICAL:

The "topics" array MUST contain EXACTLY {number_of_topics} objects.

Do not return:
- Markdown
- code fences
- comments
- explanations
- text outside JSON
- additional fields
""".strip()

    def _parse_response(
        self,
        raw_response: str,
    ) -> TopicGenerationResponse:
        raw_response = raw_response.strip()

        if not raw_response:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Model returned an empty response",
            )

        # Remove Markdown code fences.
        if raw_response.startswith("```"):
            lines = raw_response.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            raw_response = "\n".join(lines).strip()

        # Extract JSON object if model added text around it.
        start = raw_response.find("{")
        end = raw_response.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Model returned no valid JSON object",
            )

        raw_response = raw_response[start : end + 1]

        try:
            data = json.loads(raw_response)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Model returned invalid JSON: {exc}",
            ) from exc

        try:
            return TopicGenerationResponse.model_validate(data)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Model returned invalid topic structure: {exc}",
            ) from exc
