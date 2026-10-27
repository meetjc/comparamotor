# Cómo la competencia usa fotos de marca, y qué hacemos nosotros
Consultado el 24 de octubre de 2026. Complementa `docs/IMAGENES-FUENTES.md`.

## Resumen ejecutivo
- Se revisaron 20 páginas reales (7 medios de autos y 3 sitios de crédito/seguros). Nadie usa Wikimedia ni Flickr: todos alojan fotos de prensa de marca o propias.
- Mediana en notas de medios: 6 fotos por 1,000 palabras (rango 3.9 a 11.4). En guías largas baja a 2 o 3 (km77, Kavak); en sitios bancarios, 1 foto genérica.
- Posición típica: portada (siempre), una tras el primer párrafo y luego una por sección H2.
- Pie de foto: solo Autoproyecto, El Universal y km77 lo ponen. Autocosmos y Motorpasión no ponen pie ni crédito visible.
- Texto alternativo: pobre en Motorpasión («Vento 2 1») y Autocosmos (titular repetido); bueno en Autoproyecto (descripción del auto y el ángulo).
- Ninguno dice «cortesía». El crédito es «Foto: {marca}» o el fotógrafo propio.
- Fotos abiertas de prensa (sin registro, sin aceptar términos, con cláusula editorial): solo Kia America (K4 sedán 2027, 3 fotos). Las demás marcas exigen aceptar licencia, registro, o no publican términos.
- Consecuencia: la base visual sigue siendo Wikimedia Commons y Flickr CC; la prensa se usa como complemento y la decide JC marca por marca.

## Competencia por sitio
| Sitio y páginas | Fotos (tipo) | Origen | Tamaño típico | Pie y crédito | Alt | Galería |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Autocosmos, 4 notas (Nissan nanotecnología, Chirey Q, VW Lamando L, Lexus ES) | 3 a 6 por nota (prensa de marca y fotos de primer contacto) | CDN propio: `acnews.blob.core.windows.net` (`/imgnews/large`, `/medium`, `/paragraph`) | Hero 1200 o más (og large); en el cuerpo 912x608 (webp) | Ninguno. Solo pie del autor. | Titular + « - Autocosmos» o vacío | Sí, en el Chirey Q (800x600) |
| Motorpasión México, 4 notas (Vento, Uber eléctrico, volante cuadrado, seguros Mapfre) | 3 a 6 (propias de archivo, de marca y de agencias) | CDN de Webedia: `i.blogs.es` | Hero 840x560 (og); srcset hasta 1366 px | Ninguno; sin crédito visible | Derivado del nombre del archivo («Vento 2 1») | No |
| Autoproyecto, 2 notas (Pathfinder 2027, Atlas 2027) | 3 y 6 (prensa de marca) | Alojadas: `autoproyecto.com/wp-content/uploads` | 900x550 y 820x450 | «{frase descriptiva}. Foto: Nissan» / «Foto: Volkswagen» | Descriptivo largo (modelo, color, ángulo) | Sí (plugin de galería) |
| El Universal Autopistas, 3 notas (Kia Seltos, Kia EV3, Cadillac Escalade-V Checo Pérez) | 3 a 5 (fotógrafo propio y marca) | Arc Publishing: `cloudfront-us-east-1.images.arcpublishing.com/eluniversal` | Originales de 4889 a 6000 px; Cadillac 1201x740 | «{frase}. Foto: Esteban Torreblanca»; «Foto: Cadillac»; «Foto: Instagram @cadillacmexico» | Casi siempre vacío; repite el pie en las notas de marca | No |
| Motoryracing (nota de baterías eléctricas) | 1 portada (ilustrativa) | Propio: `motoryracing.com/images/noticias/portada` | 1500x938 (webp y jpg, 5 tamaños) | «Existen múltiples factores que degradan la batería del coche» (sin crédito) | Titular | No |
| km77 (comparativa Corolla vs Golf) | 8 (fotos de prueba y de marca) | Propio: `km77.com/revista/wp-content/uploads` | 1024x683 | «Foto de Nacho Oller.» / «Imagen de Volkswagen.» / «Foto de Loren Serrano.» | Presente solo en 2 de 8 | Sí |
| Carwow UK (página Toyota Corolla, 55 imágenes entre miniaturas y galería) | Galería de prensa y estudio más miniaturas | Prismic y WP: `images.prismic.io/carwow`, `images-wp.carwow.co.uk` | Miniaturas 104x68 hasta 280 px | Sin pie ni crédito | «Toyota Corolla thumbnail» | Sí, carrusel |
| BBVA México (requisitos de crédito) | 1 de archivo (persona en auto) | Propio | Banner | Ninguno | «Mujer en auto» | No |
| Kavak (simulador de crédito) | 6 de archivo y de marca | CDN `images.prd.kavak.io` | Variable | Ninguno | Genérico («Comprar coche en Kavak») | No |
| Rankia México (mejores créditos) | 1 ilustrativa | `d31dn7nfpuwjnm.cloudfront.net` | 626x419 | Ninguno | Vacío | No |

Fotos por 1,000 palabras (fotos editoriales; se excluyen avatares, logotipos y relacionadas):
Autocosmos 6.4 a 10.4; Motorpasión 3.9 a 6.8; Autoproyecto 4.0 y 4.9; El Universal 5.6 a 11.4; Motoryracing 0.6; km77 2.3; BBVA 1.3; Kavak 1.9; Rankia 0.6. Carwow no se calculó porque mezcla miniaturas con la galería.

Avisos legales de imágenes (lo que se pudo leer):
- Autocosmos: enlaza «Términos y condiciones» (`autocosmos.com.mx/institucional/terminoscondiciones`), pero la página no cargó al consultarla (error 404 de su propio sitio). Sin dato.
- Motorpasión (Webedia): `weblogssl.com/contenidos` dice que sus contenidos se licencian con Creative Commons de atribución y no comercial, pero advierte que no todas las fotos y videos son propios y que sobre esos no puede aplicar su licencia. No hay «cortesía».
- El Universal: los términos reservan los derechos de autor sobre fotografía, ilustración y video, y la suscripción no otorga derechos de reproducción.
- km77 (Condiciones Legales): se declara titular, propio o por licencia, de los derechos sobre imágenes, audio, vídeo y textos de sus páginas, y pide avisar por formulario si se infringen derechos de terceros.
- Carwow (T&C): no se encontró cláusula específica de fotos de marca.
- Autoproyecto y Motoryracing: no se encontró enlace a aviso legal en la portada.
- Ningún sitio revisado dice «Imagen: cortesía».

## Patrones
1. Cantidad: 5 a 8 fotos en notas de 500 a 900 palabras; 2 o menos por 1,000 palabras en guías largas y sitios de finanzas.
2. Posición: hero arriba (siempre), segunda foto tras el primer bloque de texto, luego una por H2 (Autocosmos las mete dentro del H2; Autoproyecto y km77 cada 2 o 3 párrafos).
3. Tipos de pie: (a) frase descriptiva + «Foto: Marca» (Autoproyecto, El Universal); (b) «Foto de {fotógrafo}.» / «Imagen de {marca}.» (km77); (c) frase corta sin crédito (Motoryracing); (d) nada (Autocosmos, Motorpasión, Carwow, sitios financieros).
4. Hospedaje: todos sirven la imagen desde su propio dominio o CDN contratado. Nadie hace hot-link a la sala de prensa de la marca.
5. Tamaño servido: 840 a 1200 px de ancho en hero, 900 a 1024 en el cuerpo, en webp o jpg con varios tamaños (srcset).
6. Galería: aparece en notas de prueba y comparativas, no en notas cortas.
7. Alt: solo Autoproyecto lo escribe como descripción útil.

## Receta para Autocifras
| Elemento | Nota o noticia (500 a 900 palabras) | Guía (1,200 a 1,800 palabras) |
| :--- | :--- | :--- |
| Fotos | 3 a 4 | 4 a 6 (unas 3 por 1,000 palabras, mejor que las 1 o 2 de finanzas) |
| Posición | Hero; una tras la respuesta directa; una en la sección de datos | Hero tras el título; una junto a la respuesta de las primeras 2 o 3 líneas; una cada 2 H2; ninguna entre tabla y su explicación |
| Galería | No | Solo si hay 6 o más fotos del mismo modelo |
| Pie | Frase descriptiva de 8 a 15 palabras + crédito. Ej.: «Nissan Versa 2024 en vista frontal tres cuartos. Foto: {autor} / Wikimedia Commons, CC BY-SA 4.0.» | Igual |
| Alt | Modelo, año, ángulo y color, sin repetir el titular ni «foto de» | Igual |
| Tamaño | Hero 1200 px de ancho; cuerpo 900 px; webp con srcset; alojadas en nuestro CDN | Igual |
| Aviso global | Línea al pie: «Las fotos de marca se usan con fines informativos; los créditos están en cada pie» | Igual |

Qué fuente por tipo de foto:
| Tipo de foto | Fuente | Condición |
| :--- | :--- | :--- |
| Modelo de ficha o guía (cuerpo del texto) | Wikimedia Commons y Flickr CC comercial | Crédito en pie con licencia; CC BY-SA editada se comparte igual |
| Modelo con prensa de marca | Kia America para el K4 (verificada abierta). Resto: ver tabla de abajo | Solo editorial, nunca en anuncios ni redes pagadas; descargar a nuestro servidor, sin hot-link |
| Noticias de lanzamiento | Prensa de marca que JC acepte (Nissan, Toyota, Mazda, VW BR) | Requiere que JC acepte los términos de descarga una vez por sala |
| Ilustración de finanzas o seguros | Unsplash/Pexels propios o imágenes generadas | Sin marcas visibles |
| Comparadores y capturas de configurador | Evitar: las capturas de configurador de marca no traen licencia | Pedir permiso por escrito |

## Fotos de prensa abiertas, por marca (24 de octubre de 2026)
Se aplicó el criterio estricto: se ve y se descarga sin registro, sin inicio de sesión y sin aceptar términos de descarga, y los términos publicados permiten uso editorial. No se registró nada, no se aceptaron términos y no se descargó ninguna foto completa (ver nota al final).

| Marca / modelo pedido | Sala revisada | Resultado | Motivo |
| :--- | :--- | :--- | :--- |
| Kia K3 | Kia America (`kiamedia.com/us/en`) | Abierta, 3 fotos del K4 2027 (ver JSON) | Enlace directo de descarga sin cuenta; aviso «Images on this website are for editorial use only.» Falta confirmar que el K4 sea el K3 de México |
| Nissan Versa, Nissan Kicks | Nissan México (`mexico.nissannews.com`) | Requiere aceptar licencia, lo hace JC | Los botones de descarga son `license-check-download` y abren una ventana de licencia; solo la vista previa (928x522) se ve libre. Cláusula: uso exclusivamente editorial |
| Renault Kwid | Renault México (`prensa.ren-mex.com`) | No sirve | Las fotos están en una carpeta de Google Drive y el sitio no publica términos de imágenes |
| Toyota Corolla, Corolla HEV, Hilux | Toyota Global y Toyota USA | Requiere aceptar términos, lo hace JC | Download Agreement / «I agree»; pressroom.toyota.com bloquea con verificación anti bots y no se intentó saltar. Toyota México no tiene sala de prensa |
| Chevrolet Aveo | Chevrolet México (`pressroom.chevrolet.com.mx`) | No sirve | Sala abierta con enlace a CC BY 4.0 en el pie, pero no hay noticias ni fotos del Aveo (solo Trax, Tracker, Captiva, Corvette, Silverado) y la nota legal contradice la licencia |
| VW Virtus | Volkswagen de México (Prezly) | No sirve | No publica términos de uso de imágenes; VW News BR exige aceptar el «Termo de Uso – Download» |
| BYD Dolphin Mini | BYD Europe (`media.byd.com`, Dolphin Surf) | Requiere registro, lo hace JC | «Log in is required to download assets». BYD UK devuelve verificación anti bots; BYD México prohíbe la descarga |
| Honda HR-V | Honda US (`hondanews.com`) | No sirve | Los términos no autorizan uso editorial ni reproducción en otros sitios |
| Mazda CX-5 | Mazda USA (`news.mazdausa.com`) | Requiere aceptar licencia, lo hace JC | Ventana «Download Authorization – License Agreement»; Mazda México prohíbe publicar en otros sitios |

Conteo de fotos abiertas por marca: Kia 3; Nissan, Renault, Toyota, Chevrolet, Volkswagen, BYD, Honda y Mazda 0.
Marcas que no sirven ni con ayuda de JC: Renault (México y global), Honda, Chevrolet para el Aveo, Volkswagen México (sin términos).
Marcas que sirven si JC acepta los términos una vez: Nissan, Toyota, Mazda, VW BR, BYD Europe (con registro).

## Limitaciones
- Para medir el tamaño de las fotos de Kia se pidió el primer bloque de 64 KB de tres archivos y se borró de inmediato; no se conservó ninguna foto. Las fotos de las demás salas no se tocaron.
- Hyundai, MG, Chirey y Ford no tienen modelos en la lista de 12 y no se revisaron en esta ronda.
- Las páginas de Autocosmos y Carwow se leyeron con el HTML publicado; el carrusel de Carwow mezcla miniaturas, por eso no se calculó su densidad.
- Los datos de portadas y notas son del 24 de octubre de 2026 y cambian.

## Fuentes consultadas
Autocosmos: https://noticias.autocosmos.com.mx/2026/10/23/primer-contacto-desde-china-chirey-q-el-electrico-que-llegara-a-mexico-en-2027 ; https://noticias.autocosmos.com.mx/2026/10/21/lexus-es-hybrid-2027-llega-a-mexico-precio-potencia-y-equipamiento-del-sedan-hibrido-de-lujo ; https://noticias.autocosmos.com.mx/2026/10/20/volkswagen-anuncia-la-llegada-de-un-nuevo-modelo-a-mexico-antes-de-que-termine-2026 ; https://noticias.autocosmos.com.mx/2026/10/23/nissan-utiliza-nanotecnologia-para-mantener-tu-auto-limpio-hasta-por-30-dias
Motorpasión: https://www.motorpasion.com.mx/industria/estas-fallas-comunes-motor-volkswagen-vento-mexico-debes-estar-atento-a-estas-senales ; https://www.motorpasion.com.mx/industria/usar-auto-electrico-como-uber-mexico-que-ganas-que-pierdes-al-despedirte-gasolina ; https://www.motorpasion.com.mx/industria/crean-volante-cuadrado-conexion-fisica-al-chasis-llegara-a-autos-2027-podriamos-verlo-mexico ; https://www.motorpasion.com.mx/n/seguros-de-cobertura-amplia-vs-low-cost-cual-te-ayuda-a-cuidar-mejor-tu-auto ; legal: https://www.weblogssl.com/contenidos
Autoproyecto: https://autoproyecto.com/2026/noticias/nissan-pathfinder-2027-precios-special-edition.html ; https://autoproyecto.com/2026/pruebas-de-autos/volkswagen-atlas-2027-precio-versiones-equipamiento.html
El Universal: https://www.eluniversal.com.mx/autopistas/kia-seltos-hibrida-y-combustion-cuales-son-sus-diferencias/ ; https://www.eluniversal.com.mx/autopistas/kia-ev3-el-suv-electrico-fabricado-en-mexico-que-combina-tecnologia-y-hasta-605-km-de-autonomia/ ; https://www.eluniversal.com.mx/autopistas/cuanto-cuesta-la-nueva-camioneta-cadillac-edicion-checo-perez/ ; legal: https://www.eluniversal.com.mx/terminos-y-condiciones/
Motoryracing: https://www.motoryracing.com/electricos/noticias/cuanto-dura-bateria-coche-electrico-que-la-degrada/
km77: https://www.km77.com/revista/comparativas/toyota-corolla-vs-volkswagen-golf-cual-elijo/ ; legal: https://www.km77.com/aviso-legal
Carwow: https://www.carwow.co.uk/toyota/corolla ; legal: https://www.carwow.co.uk/terms-and-conditions
Crédito y seguros: https://www.bbva.mx/educacion-financiera/creditos/credito-automotriz/requisitos-para-un-credito-auto.html ; https://kavak.com/mx/blog/simulador-de-credito-automotriz-consultar-antes-de-comprar ; https://www.rankia.mx/blog/creditos-hipotecarios/4387153-mejores-creditos-para-comprar-auto
Salas de prensa: https://www.kiamedia.com/us/en/media/gallery ; https://www.kiamedia.com/us/en/corporate/terms-of-use ; https://mexico.nissannews.com/es-MX/pages/derechos_reservados_2024_nissan ; https://prensa.ren-mex.com/ ; https://pressroom.chevrolet.com.mx/gmbx/mx/es/chevrolet/pressroom.html ; https://volkswagen-mexico.prezly.com/ ; https://media.byd.com/byd-dolphin-surf/?lang=eng ; https://news.mazdausa.com/ ; https://pressroom.toyota.com/ ; https://global.toyota/en/newsroom/ ; https://hondanews.com/en-US
