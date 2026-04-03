import json
import os
import urllib.request

from .. import models


def build_inventory_context(products: list[models.Product]) -> str:
    if not products:
        return "The inventory is currently empty."

    return "\n".join(
        f"- {product.name} (SKU: {product.sku}): {product.stock} in stock, "
        f"Status: {product.status}, Price: ${product.unit_price}"
        for product in products
    )


def call_openai_api(prompt: str, context: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "Error: OPENAI_API_KEY is not set in the backend .env file. Please add it to enable the real AI chatbot!"

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    system_message = (
        "You are the Inventix AI Assistant. You help users manage their inventory. "
        "Here is the real-time live database of their inventory:\n"
        f"{context}\n\n"
        "Answer the user's question accurately, natively, and concisely based ONLY on the data above. "
        "Do not invent new products. Be polite and professional."
    )
    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 150,
    }

    try:
        request = urllib.request.Request(url, headers=headers, data=json.dumps(data).encode("utf-8"))
        with urllib.request.urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return payload["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as exc:
        if exc.code == 429:
            return "AI Service Error: Your OpenAI API Key has hit its rate limit or run out of free credits! Please check your billing dashboard at platform.openai.com."
        if exc.code == 401:
            return "AI Service Error: Your OpenAI API Key is invalid or incorrect."
        return f"AI Service Error: OpenAI API returned an HTTP {exc.code} error."
    except Exception as exc:  # noqa: BLE001
        return f"AI Service Error: Could not connect to OpenAI API. Details: {exc}"


def get_chatbot_reply(products: list[models.Product], prompt: str) -> str:
    return call_openai_api(prompt, build_inventory_context(products))
