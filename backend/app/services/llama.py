import httpx

from app.core.config import settings

LLAMA_SERVER_URL = settings.LLAMA_SERVER_URL

timeout = httpx.Timeout(
    connect=10.0,
    read=6000.0,
    write=30.0,
    pool=30.0,
)


class LlamaService:
    @staticmethod
    async def generate(
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
        max_tokens: int = 8192,
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

        async with httpx.AsyncClient(timeout=timeout) as client:
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

        try:
            print(data["choices"][0]["message"]["content"])
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError("Invalid response received from Llama server.") from exc
