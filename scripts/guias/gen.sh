#!/bin/zsh
cd "$(dirname "$0")"
DATOS=$(cat datos.txt)
n=$(python3 -c "import json;print(len(json.load(open('temas.json'))))")
for i in $(seq 0 $((n-1))); do
  python3 - "$i" <<'PY' > spec_$i.txt
import json,sys
t=json.load(open('temas.json'))[int(sys.argv[1])]
datos=open('datos.txt').read()
print(f"""Escribe en español de México una guía para el sitio ComparaMotor (comparador de autos nuevos, México). Hoy es 20 de octubre de 2026.
TÍTULO (H1, no lo repitas en el cuerpo): {t['titulo']}
ENFOQUE: {t['enfoque']}
REGLAS DE FORMATO (obligatorias):
- Devuelve SOLO HTML del cuerpo (sin <html>, <head>, <body>, <h1>), usando <h2>, <h3>, <p>, <ul>, <ol>, <table> con <thead>/<tbody>, <a>.
- Cada <h2> es una pregunta literal como la buscaría una persona en Google (empieza con ¿ y termina con ?).
- El primer elemento es un <p class="answer"> con la respuesta directa en 2 o 3 frases con cifras.
- Debajo de cada <h2>, la primera frase responde directo.
- Al menos 2 tablas con <table class="tbl"> dentro de <div class="tbl-wrap">.
- 1,300 a 1,700 palabras. Frases cortas. Tono claro, directo, de tú. Sin signos de exclamación. Sin clichés ("en la era digital", "en el mundo actual", "sin lugar a dudas", "es importante destacar").
- Liga internas exactamente a las rutas que dice el enfoque, con <a href="RUTA">texto descriptivo</a>.
- Usa SOLO las cifras de la lista DATOS. No inventes precios, tasas, porcentajes, leyes, ni nombres de bancos o aseguradoras. Si algo depende de cada persona, dilo sin inventar cifras.
- Cuando cites una cifra de marca o de la AMDA, di la fuente y la fecha como aparece en DATOS.
- Termina con una sección <h2>¿Qué hacer antes de firmar?</h2> con una lista de pasos.
DATOS:
{datos}""")
PY
  ~/.local/bin/omniroute --timeout 420000 chat -m gemini/gemini-3-flash-preview --no-history --max-tokens 20000 --reasoning-effort low --file spec_$i.txt > out_$i.html 2> err_$i.txt
  echo "guia $i lista: $(wc -c < out_$i.html) bytes"
done
