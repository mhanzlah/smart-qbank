import httpx

LLAMA_SERVER_URL = "http://127.0.0.1:8080"


class LlamaService:
    @staticmethod
    async def generate(
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
        max_tokens=2048,
    ) -> str:
        messages = []

        if system_prompt:
            messages.append(
                {
                    "role": "system",
                    "content": system_prompt,
                }
            )

        messages.append(
            {
                "role": "user",
                "content": prompt,
            }
        )

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{LLAMA_SERVER_URL}/v1/chat/completions",
                json={
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]
