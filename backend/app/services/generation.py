import json
import re
from typing import Any


class GenerationParser:
    # Valid JSON escape sequences:
    # \" \\ \/ \b \f \n \r \t \uXXXX
    INVALID_JSON_ESCAPE = re.compile(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})')

    @classmethod
    def clean_response(cls, response: str) -> str:
        response = response.strip()

        if not response:
            raise ValueError("LLM returned an empty response.")

        # Remove Markdown code fences if the model ignores the prompt.
        if response.startswith("```"):
            lines = response.splitlines()

            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            response = "\n".join(lines).strip()

        return response

    @classmethod
    def _extract_json(
        cls,
        response: str,
        start_char: str,
        end_char: str,
    ) -> str:
        start = response.find(start_char)
        end = response.rfind(end_char)

        if start == -1 or end == -1 or end <= start:
            raise ValueError(
                f"LLM response does not contain a valid JSON "
                f"{'object' if start_char == '{' else 'array'}."
            )

        return response[start : end + 1]

    @classmethod
    def _parse_json(cls, raw_json: str) -> Any:
        # First attempt: parse the LLM response exactly as returned.
        try:
            return json.loads(raw_json)

        except json.JSONDecodeError as original_error:
            # The most common failure with your model is unescaped
            # LaTeX backslashes such as \int, \frac, \sqrt, \theta, \,
            # inside JSON strings.
            repaired_json = cls.INVALID_JSON_ESCAPE.sub(
                r"\\\g<0>",
                raw_json,
            )

            try:
                return json.loads(repaired_json)

            except json.JSONDecodeError:
                # Don't hide the original error if our repair could
                # not produce valid JSON.
                raise ValueError(
                    f"LLM returned invalid JSON: {original_error}"
                ) from original_error

    @classmethod
    def parse_json_object(cls, response: str) -> dict[str, Any]:
        response = cls.clean_response(response)

        print("\n--- LLM RESPONSE ---")
        print(response)
        print("--- END LLM RESPONSE ---\n")

        raw_json = cls._extract_json(response, "{", "}")

        data = cls._parse_json(raw_json)

        if not isinstance(data, dict):
            raise ValueError("LLM response must be a JSON object.")

        return data

    @classmethod
    def parse_json_array(cls, response: str) -> list[Any]:
        response = cls.clean_response(response)

        print("\n--- LLM RESPONSE ---")
        print(response)
        print("--- END LLM RESPONSE ---\n")

        raw_json = cls._extract_json(response, "[", "]")

        data = cls._parse_json(raw_json)

        if not isinstance(data, list):
            raise ValueError("LLM response must be a JSON array.")

        return data
