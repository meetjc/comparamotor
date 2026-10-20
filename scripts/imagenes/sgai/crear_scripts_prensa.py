"""Genera, con ScrapeGraphAI (ScriptCreatorMultiGraph) y OmniRoute, scripts de extracción
para galerías de salas de prensa de marcas. Guarda el script combinado y el de cada sitio
en scripts/imagenes/sgai/generados/.

Uso (desde la raíz del proyecto):
  ~/Applications/ScrapeGraphAI/.venv/bin/python -I scripts/imagenes/sgai/crear_scripts_prensa.py

No inicia sesión ni descarga imágenes: solo lee el HTML público de cada página.
Revisa los scripts generados antes de correrlos (el modelo puede inventar selectores).
"""
import json, sys, time, pathlib
AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from config_omniroute import GRAPH_CONFIG
from scrapegraphai.graphs import ScriptCreatorMultiGraph, ScriptCreatorGraph

GALERIAS = {
    "chevrolet-tracker": "https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/oct/1029_Tracker26MY.html",
    "chevrolet-groove": "https://pressroom.chevrolet.com.mx/content/gmbx/mx/es/chevrolet/pressroom/news.detail.html/Pages/news/mx/es/2025/jul/0722-GrooveMexico.html",
    "nissan-versa": "https://mexico.nissannews.com/es-MX/releases/release-e753262aecb841cf03e379a163160058?gallery=release-e753262aecb841cf03e379a163160058&viewallTab=photos",
    "mg-zs-europa": "https://news.mgmotor.eu/es/press/mg-zs-hybrid-premio/",
}
PROMPT = (
    "Escribe un script que extraiga de esta página de sala de prensa automotriz: "
    "1) cada foto del vehículo con la URL de descarga en la mayor resolución disponible (enlaces de descarga o src), "
    "su título o texto alternativo; 2) el texto y la URL de cualquier aviso de licencia, derechos reservados o términos "
    "de uso (por ejemplo enlaces a Creative Commons) en el pie de página. Devuelve JSON con las claves 'fotos' y 'licencia'."
)

salida = AQUI / "generados"
salida.mkdir(exist_ok=True)
cfg = dict(GRAPH_CONFIG)
cfg["loader_kwargs"] = {"requires_js_support": True}  # varias salas de prensa cargan la galería con JavaScript

registro = {}
# 1) Un script por sitio (ScriptCreatorGraph), una llamada a la vez.
for nombre, url in GALERIAS.items():
    t = time.time()
    try:
        g = ScriptCreatorGraph(prompt=PROMPT, source=url, config=cfg)
        codigo = g.run()
        (salida / f"extraer_{nombre.replace('-', '_')}.py").write_text(
            f'"""Generado por ScriptCreatorGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para:\n{url}\nRevisar antes de usar."""\n' + str(codigo))
        registro[nombre] = {"url": url, "ok": True, "seg": round(time.time() - t)}
    except Exception as e:
        registro[nombre] = {"url": url, "ok": False, "error": str(e)[:300]}
    print(nombre, registro[nombre], flush=True)

# 2) Script combinado (ScriptCreatorMultiGraph) para las dos galerías de Chevrolet, que comparten plantilla.
t = time.time()
try:
    mg = ScriptCreatorMultiGraph(prompt=PROMPT, source=[GALERIAS["chevrolet-tracker"], GALERIAS["chevrolet-groove"]], config=cfg)
    combinado = mg.run()
    (salida / "extraer_pressroom_chevrolet_multi.py").write_text(
        '"""Generado por ScriptCreatorMultiGraph (ScrapeGraphAI + OmniRoute) el 2026-10-20 para la sala de prensa de Chevrolet México.\nRevisar antes de usar."""\n' + str(combinado))
    registro["multi-chevrolet"] = {"ok": True, "seg": round(time.time() - t)}
except Exception as e:
    registro["multi-chevrolet"] = {"ok": False, "error": str(e)[:300]}
print("multi", registro["multi-chevrolet"], flush=True)
(salida / "registro.json").write_text(json.dumps(registro, ensure_ascii=False, indent=2))
