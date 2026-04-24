import os
from litellm import completion

def generate_completion(
    messages,
    api_key=None,
    model=None,
    base_url=None,
    temperature=1,
    max_tokens=None
):
    # Default to OpenAI if no custom config provided
    final_model = model if model else "gpt-4o-mini"
    
    kwargs = {
        "model": final_model,
        "messages": messages,
        "temperature": temperature,
    }

    if max_tokens:
        kwargs["max_tokens"] = max_tokens

    # If user provided custom key/url, use them. Otherwise, litellm defaults to env vars.
    if api_key:
        kwargs["api_key"] = api_key.strip()
    elif not os.environ.get("OPENAI_API_KEY") and final_model.startswith("gpt"):
        # Just a safety check if no key provided and no global key
        pass 

    if base_url:
        kwargs["api_base"] = base_url.strip()

    try:
        response = completion(**kwargs)
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"LLM Error: {str(e)}")
