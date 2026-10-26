// Plantilla general: <head>, menú de seis salidas, barra «Lo último», migas, pie y scripts.
import path from 'node:path';
import { SITE, esc, ld, orgLD, breadcrumbLD } from './lib.mjs';

// Contexto por página: resuelve ligas absolutas (sitio real) o relativas (vista previa en artefacto)
export function makeCtx(route, opts) {
  const preview = !!opts.preview;
  const u = (to) => {
    if (!to) return '#';
    if (/^(https?:|mailto:|tel:|#)/.test(to)) return to;
    const [p, hash = ''] = to.split('#');
    if (!preview) return p + (hash ? '#' + hash : '');
    const fromDir = route.endsWith('/') ? route : path.posix.dirname(route) + '/';
    let target = p.endsWith('/') ? p + 'index.html' : p;
    let rel = path.posix.relative(fromDir, target) || 'index.html';
    return rel + (hash ? '#' + hash : '');
  };
  return { route, preview, u, asset: (f) => u('/assets/' + f), opts };
}

const MARK = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><rect id="cm-spoke" x="-4.5" y="-29.5" width="9" height="24" rx="4.5"/><mask id="cm-tread" maskUnits="userSpaceOnUse" x="-50" y="-50" width="100" height="100"><rect x="-50" y="-50" width="100" height="100" fill="#fff"/>${Array.from({ length: 24 }, (_, i) => `<rect x="-2.3" y="-49" width="4.6" height="5.2" rx="0.8" transform="rotate(${i * 15 + 7.5})" fill="#000"/>`).join('')}<circle r="36" fill="#000"/></mask><mask id="cm-hub" maskUnits="userSpaceOnUse" x="-50" y="-50" width="100" height="100"><rect x="-50" y="-50" width="100" height="100" fill="#fff"/><circle r="3.4" fill="#000"/></mask><symbol id="cm-mark" viewBox="-50 -50 100 100"><circle r="47.5" fill="var(--mk-a, #171513)" mask="url(#cm-tread)"/><g mask="url(#cm-hub)"><g fill="var(--mk-a, #171513)"><circle r="8.5"/>${[60, 120, 180, 240, 300].map((r) => `<use href="#cm-spoke" transform="rotate(${r})"/>`).join('')}</g><use href="#cm-spoke" fill="var(--mk-b, #d42a2c)"/></g></symbol></defs></svg>`;

const SILS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="sil-hatchback" viewBox="0 0 120 48"><path d="M6 35C6 29.5 9 26.5 15.5 25.6L33 23.4 45 12.8C48 10.4 52 9.3 57 9.3H80C86 9.3 90 11.3 93 14.8L101.5 23.6 110.5 25.6C114.5 26.6 116 29.6 116 33.6V35Z"/><path d="M47.5 15.3C50 13.6 53 13 56 13H78.5C82.5 13 85.5 14.3 87.8 17L92.6 22.6H40.6Z" fill="#fff" opacity=".6"/><circle cx="31" cy="35.5" r="8.5" fill="#111"/><circle cx="93" cy="35.5" r="8.5" fill="#111"/><circle cx="31" cy="35.5" r="3.4" fill="#d6d6d6"/><circle cx="93" cy="35.5" r="3.4" fill="#d6d6d6"/></symbol>
<symbol id="sil-sedan" viewBox="0 0 120 48"><path d="M4 35C4 30 7 27.4 13 26.6L30 24.5 42 14C45 11.6 49 10.5 54 10.5H74C80 10.5 84 12.5 87 16L94 23.6 108 25.4C113 26.2 116 29.2 116 33.4V35Z"/><path d="M45 16.3C47.5 14.6 50.5 14 53.5 14H72.5C76.5 14 79.5 15.3 81.8 18L86.2 23.2H38.6Z" fill="#fff" opacity=".6"/><circle cx="28" cy="35.5" r="8.5" fill="#111"/><circle cx="96" cy="35.5" r="8.5" fill="#111"/><circle cx="28" cy="35.5" r="3.4" fill="#d6d6d6"/><circle cx="96" cy="35.5" r="3.4" fill="#d6d6d6"/></symbol>
<symbol id="sil-suv" viewBox="0 0 120 48"><path d="M5 35C5 29.8 7.6 27 13 26L26 24 36 10.4C38 8.2 41 7 45 7H84C89 7 92.6 8.6 95.4 12L104 23.8 109.5 25C114 26 116 29 116 33V35Z"/><path d="M39.5 12.2C41 10.8 43 10.4 45.5 10.4H66V22.8H31.8ZM70 10.4H83.6C87 10.4 89.6 11.6 91.6 14L98 22.8H70Z" fill="#fff" opacity=".6"/><circle cx="30" cy="35.5" r="9" fill="#111"/><circle cx="93" cy="35.5" r="9" fill="#111"/><circle cx="30" cy="35.5" r="3.6" fill="#d6d6d6"/><circle cx="93" cy="35.5" r="3.6" fill="#d6d6d6"/></symbol>
<symbol id="sil-pickup" viewBox="0 0 120 48"><path d="M4 35C4 30.5 6.6 27.6 12 26.8L24 25 33 11.4C35 8.8 38 7.6 42 7.6H60C63 7.6 65 9.4 65 12.4V24H112C114.6 24 116 25.6 116 28V35Z"/><path d="M36.8 13C38 11.4 40 10.8 42.4 10.8H58.6C60.4 10.8 61.6 12 61.6 13.8V23.4H28.8Z" fill="#fff" opacity=".6"/><circle cx="27" cy="35.5" r="9" fill="#111"/><circle cx="95" cy="35.5" r="9" fill="#111"/><circle cx="27" cy="35.5" r="3.6" fill="#d6d6d6"/><circle cx="95" cy="35.5" r="3.6" fill="#d6d6d6"/></symbol>
</defs></svg>`;

export const NAV = [
  { label: 'Comparar', url: '/comparar/' },
  { label: 'Autos nuevos', url: '/autos/' },
  { label: 'Mejores autos', url: '/mejores/' },
  { label: 'Crédito y seguro', url: '/credito-y-seguro/' },
  { label: 'Trámites', url: '/tramites/' },
  { label: 'Noticias', url: '/noticias/' },
];

// Secciones del sitio: el menú marca la sección actual y cada página interna muestra a sus «hermanas».
export const SECCIONES = [
  { nav: '/comparar/', sub: [['Comparador', '/comparar/'], ['¿Qué auto me alcanza?', '/que-me-alcanza/']], extra: ['/que-me-alcanza/'] },
  { nav: '/autos/', sub: [['Todos los autos', '/autos/'], ['Lista de precios', '/autos/precios/']] },
  { nav: '/mejores/', sub: [['Todos los rankings', '/mejores/'], ['Baratos', '/mejores/autos-baratos/'], ['Híbridos', '/mejores/autos-hibridos/'], ['Eléctricos', '/mejores/autos-electricos/'], ['Chinos', '/autos-chinos/'], ['Camionetas', '/mejores/camionetas/'], ['Para plataformas', '/mejores/autos-para-plataformas/']], extra: ['/autos-chinos/'] },
  { nav: '/credito-y-seguro/', sub: [['Resumen', '/credito-y-seguro/'], ['Calculadora de crédito', '/credito-automotriz/'], ['Costo total', '/costo-total/'], ['Seguro', '/seguro-de-auto/'], ['Promociones', '/promociones/']], extra: ['/credito-automotriz/', '/costo-total/', '/seguro-de-auto/', '/promociones/'] },
  { nav: '/tramites/', sub: [['Resumen', '/tramites/'], ['Hoy No Circula', '/hoy-no-circula/'], ['Tenencia', '/tenencia/'], ['Verificación', '/verificacion-vehicular/'], ['Gasolina', '/precio-gasolina/']], extra: ['/hoy-no-circula/', '/tenencia/', '/verificacion-vehicular/', '/precio-gasolina/'] },
  { nav: '/noticias/', sub: [['Noticias', '/noticias/'], ['Autos más vendidos', '/autos-mas-vendidos/'], ['Lanzamientos 2027', '/lanzamientos/2027/'], ['Guías', '/guias/']], extra: ['/autos-mas-vendidos/', '/lanzamientos/', '/guias/'] },
];
export function seccionDe(route) {
  return SECCIONES.find((x) => route.startsWith(x.nav) || (x.extra || []).some((e) => route.startsWith(e))) || null;
}
export function subnav(ctx) {
  const sec = seccionDe(ctx.route); if (!sec || ctx.route === '/') return '';
  // item activo: el de prefijo más largo que coincida con la ruta
  const actual = sec.sub.map(([, u]) => u).filter((u) => ctx.route.startsWith(u)).sort((a, b) => b.length - a.length)[0];
  return `<nav class="subnav" aria-label="En esta sección">${sec.sub.map(([l, u]) => `<a href="${ctx.u(u)}"${u === actual ? (u === ctx.route ? ' aria-current="page"' : ' aria-current="true"') : ''}>${l}</a>`).join('')}</nav>`;
}

export function mark(ctx, cls = 'mk', dark = true) {
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"${dark ? ' style="--mk-a:#fff;--mk-b:#ff5a52"' : ''}><use href="#cm-mark" width="100" height="100"/></svg>`;
}

export function crumbs(ctx, items) {
  if (!items || items.length < 2) return '';
  return `<nav class="crumbs" aria-label="Migas de pan"><ol>${items.map((it, i) => i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${ctx.u(it.url)}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
}

export function ticker(ctx, items) {
  if (!items || !items.length) return '';
  const a = items.map((t) => `<a href="${ctx.u(t.url)}"><b>${esc(t.tema)}</b><span>${esc(t.titulo)}</span><time>${esc(t.fecha)}</time></a>`).join('');
  return `<div class="ticker"><div class="wrap"><span class="tk-l"><i aria-hidden="true"></i>Lo último</span><div class="tk-v"><div class="tk-t" id="tk-t">${a}</div></div></div></div>`;
}

export function page(ctx, o) {
  const {
    title, description, body, crumbsItems, schema = [], noindex = false, ogImage = 'img/comparamotor-og-1200x630.jpg',
    bodyClass = '', heroDark = false, extraHead = '', canonical = ctx.route, dataJSON = null, updated = null,
  } = o;
  const full = title.includes('ComparaMotor') ? title : `${title} | ComparaMotor`;
  const canon = SITE.url + canonical;
  const graph = [orgLD(), { '@type': 'WebSite', '@id': SITE.url + '/#web', url: SITE.url + '/', name: SITE.name, inLanguage: 'es-MX', publisher: { '@id': SITE.url + '/#org' } }];
  const lds = [ld({ '@context': 'https://schema.org', '@graph': graph })];
  if (crumbsItems && crumbsItems.length > 1) lds.push(ld(breadcrumbLD(crumbsItems)));
  for (const s of schema) lds.push(ld(s));
  const gtm = ctx.opts.gtm;
  const secActual = seccionDe(ctx.route);
  const navLinks = NAV.map((n) => `<a href="${ctx.u(n.url)}"${secActual && secActual.nav === n.url ? ' aria-current="true"' : ''}>${n.label}</a>`).join('');
  return `<!doctype html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canon}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="website"><meta property="og:locale" content="es_MX"><meta property="og:site_name" content="ComparaMotor">
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canon}">
<meta property="og:image" content="${SITE.url}/assets/${ogImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="ComparaMotor: compara autos nuevos sin letras chiquitas">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#171513">
<link rel="icon" type="image/svg+xml" href="${ctx.asset('img/comparamotor-simbolo.svg')}"><link rel="icon" type="image/png" sizes="32x32" href="${ctx.asset('img/comparamotor-favicon-32.png')}"><link rel="apple-touch-icon" href="${ctx.asset('img/comparamotor-apple-touch-180.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400..800&family=Geist+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@800&display=swap">
<link rel="stylesheet" href="${ctx.asset('css/site.css')}">
${gtm ? `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});window.cmLoadGTM=function(){if(window.cmGTM)return;window.cmGTM=1;gtag('consent','update',{analytics_storage:'granted'});dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${gtm}';document.head.appendChild(j);};var cm=null;try{cm=localStorage.getItem('cm-consent');}catch(e){}if(cm!=='no'&&cm!=='"no"')window.cmLoadGTM();</script>` : ''}
${lds.join('\n')}
${extraHead}
</head>
<body class="${bodyClass}${heroDark ? ' has-cine' : ''}">
${MARK}${SILS}
<a class="skip" href="#main">Saltar al contenido</a>
<header class="nav${heroDark ? '' : ' solid'}" id="top">
  <div class="wrap">
    <a class="logo on-dark" href="${ctx.u('/')}" aria-label="ComparaMotor, inicio">${mark(ctx)}<span class="wm">compara<b>motor</b></span></a>
    <nav class="links" id="links" aria-label="Secciones">${navLinks}</nav>
    <div class="nav-r">
      <a class="pill p-primary" href="${ctx.u('/mi-garage/')}">Mi garage</a>
      <button class="menu-btn" id="menu" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="links"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
  </div>
</header>
<main id="main">
${heroDark ? '' : `<div class="page-top">${crumbs(ctx, crumbsItems)}${subnav(ctx)}</div>`}
${body}
</main>
${footer(ctx, updated)}
${gtm ? `<div class="consent consent-lite" id="consent-bar" role="region" aria-label="Aviso de medición" hidden><p>Por ahora este sitio no muestra publicidad de ningún tipo. Solo medimos las visitas con Google Analytics para saber qué páginas sirven. <a href="${ctx.u('/aviso-de-privacidad/')}">Aviso de privacidad</a>.</p><div><button class="pill p-subtle" type="button" data-consent="no">No medir</button><button class="pill p-primary" type="button" data-consent="si">Entendido</button></div></div>` : ''}
${dataJSON ? `<script type="application/json" id="cm-data">${JSON.stringify(dataJSON).replace(/</g, '\\u003c')}</script>` : ''}
<script src="${ctx.asset('js/site.js')}" defer></script>
<aside class="print-legal" aria-hidden="true"><b>Aviso legal.</b> Documento informativo impreso desde comparamotor.com<span data-print-fecha></span>. No es una cotización, una oferta de venta ni una oferta de crédito. Los precios, ofertas y condiciones provienen de las fuentes oficiales indicadas, con su fecha de verificación, y pueden cambiar sin aviso: confírmalos con la agencia o con el otorgante antes de apartar o comprar. La mensualidad y el costo total son simulaciones con supuestos editables (tasa de ejemplo, seguro, gasolina y servicios); la tasa, el CAT y la aprobación del crédito los define cada otorgante. ComparaMotor es independiente: no está afiliado a ninguna marca, agencia, banco ni financiera, y no recibe pago por el orden de los resultados. Las marcas y nombres de modelos pertenecen a sus titulares y se mencionan solo para identificar los productos. Cada foto lleva su crédito y su fuente. ComparaMotor no se hace responsable de decisiones tomadas solo con base en este documento. Términos de uso: comparamotor.com/terminos/ · Aviso de privacidad: comparamotor.com/aviso-de-privacidad/</aside>
</body>
</html>`;
}

export function footer(ctx, updated) {
  const col = (t, links) => `<div><h2>${t}</h2><ul>${links.map(([l, h]) => `<li><a href="${ctx.u(h)}">${l}</a></li>`).join('')}</ul></div>`;
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="f-top"><a class="logo on-dark" href="${ctx.u('/')}" aria-label="ComparaMotor, inicio">${mark(ctx)}<span class="wm">compara<b>motor</b></span></a><a class="pill p-white" href="#top">Volver arriba</a></div>
    <div class="f-cols">
      ${col('Comparar', [['Comparador', '/comparar/'], ['¿Qué auto me alcanza?', '/que-me-alcanza/'], ['Autos nuevos', '/autos/'], ['Lista de precios', '/autos/precios/'], ['Mejores autos', '/mejores/']])}
      ${col('Dinero y trámites', [['Crédito automotriz', '/credito-automotriz/'], ['Seguro de auto', '/seguro-de-auto/'], ['Costo total a 5 años', '/costo-total/'], ['Hoy No Circula', '/hoy-no-circula/'], ['Tenencia', '/tenencia/'], ['Verificación', '/verificacion-vehicular/']])}
      ${col('Aprender', [['Noticias', '/noticias/'], ['Autos más vendidos', '/autos-mas-vendidos/'], ['Guías', '/guias/'], ['Glosario', '/glosario/'], ['Promociones', '/promociones/']])}
      ${col('ComparaMotor', [['Metodología', '/metodologia/'], ['Independencia', '/independencia/'], ['Quiénes somos', '/quienes-somos/'], ['Datos abiertos', '/datos/'], ['Aviso de privacidad', '/aviso-de-privacidad/'], ['Términos de uso', '/terminos/'], ['Aviso y retiro de contenido', '/aviso-y-retiro/']])}
    </div>
    <p class="f-legal">ComparaMotor es un medio independiente: no vende su ranking ni sus veredictos, y lo patrocinado se etiqueta. Los precios son informativos, con su fuente y fecha; confirma condiciones con la agencia antes de firmar. Las mensualidades son estimaciones con supuestos editables; el CAT se muestra «sin IVA, para fines informativos y de comparación». Las páginas de trámites son informativas y no pertenecen a ningún gobierno. Las fotos de modelos llevan el crédito de su fuente; las demás imágenes son ilustrativas, generadas con IA y sin relación con las marcas. Los nombres de marcas y modelos pertenecen a sus titulares y se usan solo para identificarlos.${updated ? ` Página actualizada el ${esc(updated)}.` : ''}</p>
  </div>
</footer>`;
}
