"""Configuración de ScrapeGraphAI con OmniRoute (router local con API compatible con OpenAI).

Probada el 2026-10-20 con scrapegraphai 2.3.1 y OmniRoute en el puerto 20128.
- "openai/" delante del nombre hace que LangChain use ChatOpenAI contra base_url.
- OmniRoute no pide clave: cualquier texto sirve como api_key.
- model_tokens evita el recorte silencioso a 8192 tokens.
- Las llamadas a OmniRoute van una tras otra (no en paralelo): batchsize=1 en los grafos Multi.
"""

OMNIROUTE_URL = "http://127.0.0.1:20128/v1"
MODELO = "openai/gemini/gemini-3-flash-preview"

GRAPH_CONFIG = {
    "llm": {
        "model": MODELO,
        "base_url": OMNIROUTE_URL,
        "api_key": "omniroute",
        "model_tokens": 200000,
        "temperature": 0,
        "timeout": 420,
    },
    "library": "beautifulsoup4",
    "headless": True,
    "verbose": False,
    "batchsize": 1,
    "loader_kwargs": {"requires_js_support": False},
}
