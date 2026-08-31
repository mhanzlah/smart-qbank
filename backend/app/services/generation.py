import json
from typing import Any


class GenerationParser:
    @staticmethod
    def clean_response(response: str) -> str:
        response = response.strip()

        if not response:
            raise ValueError("LLM returned an empty response.")

        if response.startswith("```"):
            lines = response.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            response = "\n".join(lines).strip()

        return response

    @classmethod
    def parse_json_object(cls, response: str) -> dict[str, Any]:
        response = cls.clean_response(response)

        start = response.find("{")
        end = response.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise ValueError("LLM response does not contain a valid JSON object.")

        try:
            data = json.loads(response[start : end + 1])
        except json.JSONDecodeError as exc:
            raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

        if not isinstance(data, dict):
            raise ValueError("LLM response must be a JSON object.")

        return data

    @classmethod
    def parse_json_array(cls, response: str) -> list[Any]:
        response = cls.clean_response(response)

        start = response.find("[")
        end = response.rfind("]")

        if start == -1 or end == -1 or end <= start:
            raise ValueError("LLM response does not contain a valid JSON array.")

        try:
            data = json.loads(response[start : end + 1])
        except json.JSONDecodeError as exc:
            raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

        if not isinstance(data, list):
            raise ValueError("LLM response must be a JSON array.")

        return data
