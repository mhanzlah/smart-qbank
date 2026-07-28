from transformers import AutoTokenizer, AutoModelForCausalLM


class Model:
    def __init__(self) -> None:
        model_name = "Qwen/Qwen2.5-3B-Instruct"

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            device_map="auto",
        )

        self.model.eval()

    def generate(self, prompt: str) -> str:

        messages = [
            {
                "role": "user",
                "content": prompt,
            }
        ]

        inputs = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(self.model.device)

        outputs = self.model.generate(
            **inputs,
            max_new_tokens=500,
        )

        generated_tokens = outputs[0][inputs["input_ids"].shape[-1] :]

        response = self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True,
        )

        return response.strip()


model = Model()
