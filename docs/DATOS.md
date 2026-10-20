# Formato de datos de ComparaMotor

Regla de oro (JC, 20 oct 2026): **ningún dato, cifra, foto o imagen sin su fuente visible en la página**: precios con fuente y fecha, fotos con autor, liga de origen y licencia, imágenes de IA con «Imagen ilustrativa», notas y guías con lista de fuentes. Si un dato no aparece en una fuente verificable, va como `null` y se anota en `pendientes`. Nunca se infiere ni se estima.

Fecha de verificación de esta ronda: 2026-10-20 (hora de la Ciudad de México).

## Autos: `data/autos/{marca-slug}/{modelo-slug}.json`

```json
{
  "marca": "Nissan",
  "marcaSlug": "nissan",
  "modelo": "Versa",
  "slug": "versa",
  "carroceria": "sedan | hatchback | suv | pickup | van | coupe",
  "segmento": "subcompacto | compacto | mediano | suv-subcompacta | suv-compacta | suv-mediana | pickup-compacta | pickup-mediana | ...",
  "origenMarca": "japonesa | china | coreana | alemana | estadounidense | francesa | britanica-china | ...",
  "propulsion": "gasolina | hibrido | hibrido-enchufable | electrico | diesel",
  "anioModeloVigente": 2027,
  "versiones": [
    {
      "nombre": "Sense MT",
      "anio": 2027,
      "precio": 329900,
      "moneda": "MXN",
      "transmision": "manual | automatica | cvt | doble-embrague | e-cvt | directa",
      "motor": "1.6 L 4 cil.",
      "potenciaHp": 118,
      "rendimientoCombinadoKmL": null,
      "autonomiaKm": null,
      "bolsasAire": 6,
      "frenadoAutonomoEmergencia": true,
      "fuente": "Nissan México (sitio oficial)",
      "url": "https://www.nissan.com.mx/...",
      "fechaVerificacion": "2026-10-20",
      "notas": ""
    }
  ],
  "garantia": { "texto": "3 años o 60,000 km", "fuente": "...", "url": "..." },
  "ofertas": [
    { "descripcion": "...", "precioOferta": null, "condicion": "...", "vigenciaHasta": "2026-10-31", "fuente": "...", "url": "...", "fechaVerificacion": "2026-10-20" }
  ],
  "fuentes": ["https://..."],
  "pendientes": ["Rendimiento combinado oficial por versión"]
}
```

- `precio`: entero en pesos, tal como lo publica la fuente (precio de lista con IVA). Si solo hay "desde $X", usar una versión con `"nombre": "Desde (versión de entrada)"` y anotarlo en `notas`.
- Fuente preferida: sitio oficial de la marca en México. Si la marca no publica precios, usar una nota de prensa reciente (Motorpasión, Autocosmos noticias, El Universal, Expansión) y escribirlo en `fuente`.
- `rendimientoCombinadoKmL`: solo el dato oficial (marca o Conuee). Si no hay, `null`.
- `frenadoAutonomoEmergencia`: `true`, `false` o `null` (no confirmado).

## Trámites: `data/tramites/*.json`
Cada regla con `fuente`, `url` y `fechaVerificacion`. Ver los briefs de cada agente.

## Noticias y mercado: `data/noticias/*.json`, `data/mercado/*.json`
Cada nota: título, fecha de publicación de la fuente, resumen propio (no copiar), cifras con su fuente y URL.

## Imágenes (decisión de JC del 20 oct 2026)
- Solo imágenes generadas en Magnific (licencia comercial de la cuenta de JC) y gráficos propios.
- Nada de fotos de Google, agencias ni marcas en el lanzamiento.
- Fichas de modelo: silueta propia por carrocería; nunca una imagen de IA que imite un modelo real.
- Imágenes de IA: autos genéricos, sin emblemas, sin personas reales identificables, sin placas reales; leyenda «Imagen ilustrativa».
- Cada imagen se registra en `data/imagenes.json` (prompt, fecha, licencia). El build falla si falta el registro.
