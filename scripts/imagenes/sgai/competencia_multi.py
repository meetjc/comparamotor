"""Cruza varias notas de la competencia a la vez con SmartScraperMultiGraph (ScrapeGraphAI + OmniRoute)
para ver de dónde salen las fotos de autos y cómo las acreditan. Resultado en generados/competencia_multi.json.

Uso (desde la raíz del proyecto):
  ~/Applications/ScrapeGraphAI/.venv/bin/python -I scripts/imagenes/sgai/competencia_multi.py
"""
import json, sys, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from config_omniroute import GRAPH_CONFIG
from scrapegraphai.graphs import SmartScraperMultiGraph

URLS = [
    "https://www.eluniversal.com.mx/autopistas/cuanto-cuesta-el-nissan-kicks-2026-mas-barato/",
    "https://noticias.autocosmos.com.mx/2026/01/26/nissan-kicks-el-suv-subcompacto-que-lidera-su-segmento-en-mexico",
    "https://www.motorpasion.com.mx/pruebas-de-coches/chirey-tiggo-7-pro-mexico-video-opiniones-prueba",
    "https://www.km77.com/coches/mg/zs/2025/estandar/informacion/mg-zs-hybrid-2025-cambios-en-la-informacion",
    "https://autoproyecto.com/2026/pruebas-de-autos/enlace-patrocinado/toyota-rav4-limited-2026.html",
]
PROMPT = (
    "Para esta nota de un medio automotriz devuelve JSON con: sitio, url, dominios de donde se sirven las fotos del auto, "
    "texto exacto de cualquier crédito de foto (por ejemplo 'Foto: Nissan', 'Cortesía', nombre de fotógrafo) o null si no hay, "
    "dónde aparece el crédito (pie, alt, final de la nota), y si las fotos parecen propias de una prueba de manejo, de prensa de la marca "
    "o de stock. No inventes: si no aparece, usa null."
)
cfg = dict(GRAPH_CONFIG)
g = SmartScraperMultiGraph(prompt=PROMPT, source=URLS, config=cfg)
res = g.run()
(AQUI / "generados").mkdir(exist_ok=True)
(AQUI / "generados" / "competencia_multi.json").write_text(json.dumps(res, ensure_ascii=False, indent=2))
print(json.dumps(res, ensure_ascii=False, indent=1)[:4000])
