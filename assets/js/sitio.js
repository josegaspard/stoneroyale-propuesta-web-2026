/* Stone Royale · interacciones: idioma, scroll suave, revelados, catálogo, recorrido, cotizador, ficha. */
(function (w, d) {
  'use strict';
  var SR = w.SR, gsap = w.gsap, ST = w.ScrollTrigger;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var lang = 'es';
  try { lang = localStorage.getItem('sr-idioma') || 'es'; } catch (e) {}
  var L = function (es, en) { return lang === 'en' ? (en || es) : es; };

  /* ---------- Scroll suave ---------- */
  var lenis = null;
  if (gsap && ST) gsap.registerPlugin(ST);
  if (!reduce && w.Lenis && gsap) {
    lenis = new w.Lenis({ duration: 1.15, easing: function (t) { return 1 - Math.pow(1 - t, 4); }, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    w.srLenis = lenis;
  }
  function irA(destino) {
    var el = typeof destino === 'string' ? $(destino) : destino;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.4 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.length < 2 || !$(h)) return;
    e.preventDefault();
    cerrarMenu();
    if (a.dataset.uso) preseleccionar({ uso: a.dataset.uso });
    irA(h);
  });

  /* ---------- Cabecera y menú ---------- */
  var cab = $('.cabecera'), wa = $('.wa-fijo'), ultimo = 0;
  function alScroll() {
    var y = w.scrollY;
    cab.classList.toggle('solida', y > 40);
    cab.classList.toggle('oculta', y > 600 && y > ultimo + 4 && !d.body.classList.contains('menu-abierto'));
    if (y < ultimo - 4) cab.classList.remove('oculta');
    if (wa) wa.classList.toggle('escondido', !!d.querySelector('.heroe') && y < w.innerHeight * .8);
    ultimo = y;
  }
  w.addEventListener('scroll', alScroll, { passive: true }); alScroll();
  var mb = $('.menu-boton');
  function cerrarMenu() { d.body.classList.remove('menu-abierto'); if (mb) { mb.setAttribute('aria-expanded', 'false'); } if (lenis) lenis.start(); }
  if (mb) mb.addEventListener('click', function () {
    var abre = !d.body.classList.contains('menu-abierto');
    d.body.classList.toggle('menu-abierto', abre); mb.setAttribute('aria-expanded', String(abre));
    mb.setAttribute('aria-label', abre ? L('Cerrar menú', 'Close menu') : L('Abrir menú', 'Open menu'));
    if (lenis) abre ? lenis.stop() : lenis.start();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { cerrarMenu(); cerrarVisor(); } });

  /* ---------- Idioma ---------- */
  function partir(el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (p) { return '<span class="palabra" aria-hidden="true"><span>' + p + '</span></span>'; }).join(' ');
  }
  function aplicarIdioma(primera) {
    d.documentElement.lang = lang;
    $$('[data-en]').forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent.trim();
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    $$('[data-partir]').forEach(partir);
    $$('[data-idioma]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.idioma === lang)); });
    pintarCatalogo(); pintarListas(); pintarSelects(); pintarFicha(primera);
  }
  $$('[data-idioma]').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.idioma; try { localStorage.setItem('sr-idioma', lang); } catch (e) {}
      aplicarIdioma(false); if (ST) ST.refresh();
    });
  });

  /* ---------- Catálogo ---------- */
  var filtro = 'todos';
  function imgDe(m) { return 'assets/img/' + (m[4] ? m[4] : 'mat/' + m[0]) + '.webp'; }
  function tarjeta(m) {
    var tipo = SR.tipos[m[2]][lang === 'en' ? 1 : 0];
    var cuerpo = '<div class="muestra"><img src="' + imgDe(m) + '" alt="' + m[1] + ', ' + tipo.toLowerCase() + '" width="640" height="640" loading="lazy"></div>' +
      '<h3>' + m[1] + '</h3><p class="meta"><span>' + tipo + '</span>' + (m[3] ? '<em>' + L('Ver acabados', 'See finishes') + '</em>' : '<span>' + L('Cotizar', 'Quote') + '</span>') + '</p>';
    var dentro = m[3] ? '<a href="ficha.html?m=' + m[3] + '">' + cuerpo + '</a>' : '<button type="button" class="abrir" data-material="' + m[1] + '">' + cuerpo + '</button>';
    return '<li class="material' + (filtro !== 'todos' && filtro !== m[2] ? ' fuera' : '') + '" data-tipo="' + m[2] + '">' + dentro + '</li>';
  }
  function pintarCatalogo() {
    var ul = $('#materiales'); if (!ul) return;
    ul.innerHTML = SR.catalogo.map(tarjeta).join('');
    $$('.filtros button').forEach(function (b) {
      var f = b.dataset.filtro;
      b.querySelector('sup').textContent = f === 'todos' ? SR.catalogo.length : SR.catalogo.filter(function (m) { return m[2] === f; }).length;
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('.filtros button');
    if (b) {
      filtro = b.dataset.filtro;
      $$('.filtros button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var items = $$('#materiales .material');
      items.forEach(function (li) { li.classList.toggle('fuera', filtro !== 'todos' && li.dataset.tipo !== filtro); });
      if (gsap && !reduce) gsap.fromTo(items.filter(function (li) { return !li.classList.contains('fuera'); }), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .03, ease: 'power3.out', clearProps: 'transform' });
      if (ST) ST.refresh();
      return;
    }
    var m = e.target.closest('button.abrir');
    if (m) { preseleccionar({ material: m.dataset.material }); irA('#cotizar'); }
  });
  function pintarListas() {
    var a = $('#lista-acabados'), f = $('#lista-formatos');
    if (a) a.innerHTML = SR.acabados.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('');
    if (f) f.innerHTML = SR.formatos.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('');
  }

  /* ---------- Cotizador ---------- */
  function pintarSelects() {
    var sm = $('#f-material'), su = $('#f-uso'), sa = $('#f-acabado');
    if (!sm) return;
    var vm = sm.value, vu = su.value, va = sa.value;
    sm.innerHTML = '<option value="">' + L('Aún no lo sé', 'Not sure yet') + '</option>' + SR.catalogo.map(function (m) { return '<option>' + m[1] + '</option>'; }).join('');
    su.innerHTML = SR.usos.map(function (u) { return '<option value="' + u[0] + '">' + L(u[0], u[1]) + '</option>'; }).join('');
    sa.innerHTML = '<option value="">' + L('Por definir', 'To be defined') + '</option>' + SR.acabados.map(function (x) { return '<option value="' + x[0] + '">' + L(x[0], x[1]) + '</option>'; }).join('');
    if (vm) sm.value = vm; if (vu) su.value = vu; if (va) sa.value = va;
  }
  function preseleccionar(o) {
    if (o.material && $('#f-material')) $('#f-material').value = o.material;
    if (o.uso && $('#f-uso')) $('#f-uso').value = o.uso;
  }
  var form = $('#formulario');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var via = (e.submitter && e.submitter.dataset.via) || 'wa';
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    var aviso = $('#aviso');
    if (!v('nombre') || (!v('correo') && !v('tel'))) {
      aviso.textContent = L('Escribe tu nombre y un correo o teléfono para poder responderte.', 'Add your name and an email or phone so we can reply.');
      aviso.classList.add('error'); (v('nombre') ? form.elements.correo : form.elements.nombre).focus(); return;
    }
    aviso.classList.remove('error');
    var lineas = [
      L('Hola, quiero una cotización de Stone Royale.', 'Hi, I would like a quote from Stone Royale.'),
      L('Nombre: ', 'Name: ') + v('nombre'),
      v('correo') && (L('Correo: ', 'Email: ') + v('correo')),
      v('tel') && (L('Teléfono: ', 'Phone: ') + v('tel')),
      L('País de entrega: ', 'Delivery country: ') + v('pais'),
      L('Material: ', 'Material: ') + (v('material') || L('por definir', 'to be defined')),
      L('Uso: ', 'Use: ') + v('uso'),
      v('acabado') && (L('Acabado: ', 'Finish: ') + v('acabado')),
      v('m2') && (L('Metros cuadrados: ', 'Square meters: ') + v('m2')),
      v('mensaje') && (L('Detalles: ', 'Details: ') + v('mensaje'))
    ].filter(Boolean).join('\n');
    if (via === 'wa') w.open('https://wa.me/' + SR.wa + '?text=' + encodeURIComponent(lineas), '_blank', 'noopener');
    else w.location.href = 'mailto:' + SR.correo + '?subject=' + encodeURIComponent(L('Cotización', 'Quote') + ' · ' + (v('material') || 'Stone Royale')) + '&body=' + encodeURIComponent(lineas);
    aviso.textContent = via === 'wa' ? L('Abrimos WhatsApp con tu mensaje listo. Solo pulsa enviar.', 'WhatsApp is open with your message ready. Just press send.') : L('Abrimos tu correo con el mensaje listo. Solo pulsa enviar.', 'Your email app is open with the message ready. Just press send.');
  });

  /* ---------- Ficha de material ---------- */
  function pintarFicha(primera) {
    var cont = $('#ficha'); if (!cont) return;
    var id = new URLSearchParams(w.location.search).get('m');
    var f = SR.fichas[id] || SR.fichas['santo-tomas'];
    if (!SR.fichas[id]) id = 'santo-tomas';
    var tipo = SR.tipos[f.tipo][lang === 'en' ? 1 : 0];
    d.title = f.nombre + ' · ' + tipo + ' · Stone Royale';
    var actual = cont.dataset.acabado ? +cont.dataset.acabado : 0;
    var ac = f.acabados[actual] || f.acabados[0];
    cont.innerHTML =
      '<div class="ficha-visual"><div class="grande"><img id="ficha-img" src="assets/img/fin/' + ac[2] + '.webp" alt="' + f.nombre + ' ' + L(ac[0], ac[1]).toLowerCase() + '" width="800" height="800"></div></div>' +
      '<div class="ficha-datos">' +
      '<nav class="migas" aria-label="' + L('Ruta', 'Breadcrumb') + '"><a href="index.html#catalogo">' + L('Catálogo', 'Catalog') + '</a> / ' + tipo + '</nav>' +
      '<h1 class="t-xl">' + f.nombre + '</h1>' +
      '<p class="ficha-desc">' + (f.tipo === 'marmol'
        ? L('El mármol es una roca metamórfica formada a partir de rocas calizas sometidas a altas temperaturas y presiones, que alcanza un alto grado de cristalización; su componente básico es el carbonato de calcio.', 'Marble is a metamorphic rock formed from limestone subjected to high temperatures and pressures, reaching a high degree of crystallization; its basic component is calcium carbonate.')
        : L('Travertino mexicano de las canteras con las que trabaja Stone Royale, disponible en ' + f.acabados.length + ' acabados.', 'Mexican travertine from the quarries Stone Royale works with, available in ' + f.acabados.length + ' finishes.')) + '</p>' +
      '<h2>' + L('Acabados', 'Finishes') + ' <span class="meta">(' + f.acabados.length + ')</span></h2>' +
      '<ul class="acabados-lista">' + f.acabados.map(function (a, i) {
        return '<li><button type="button" data-i="' + i + '" aria-pressed="' + (i === actual) + '"><img src="assets/img/fin/' + a[2] + '.webp" alt="" width="200" height="200" loading="lazy"><span>' + L(a[0], a[1]) + '</span></button></li>';
      }).join('') + '</ul>' +
      '<h2>' + L('Formatos', 'Formats') + '</h2><ul class="simple">' + SR.formatos.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul>' +
      '<h2>' + L('Medidas estándar', 'Standard sizes') + '</h2><ul class="simple"><li>.305 × .305 · .40 × .40 · .60 × .60 × 1</li><li>.305 / .40 / .60 × ' + L('largo libre', 'free length') + ' × 1</li><li>' + L('Lámina promedio: 2.40 × 1.70 × 2 cm', 'Average slab: 2.40 × 1.70 × 2 cm') + '</li></ul>' +
      '<p class="nota">' + L('Al ser piedra natural, cada pieza puede variar en tono y veta.', 'Being natural stone, each piece may vary in tone and vein.') + '</p>' +
      '<div class="acciones"><a class="boton" target="_blank" rel="noopener" href="https://wa.me/' + SR.wa + '?text=' + encodeURIComponent(L('Hola, quiero cotizar ', 'Hi, I would like a quote for ') + f.nombre) + '"><svg aria-hidden="true"><use href="#wa"/></svg>' + L('Cotizar este material', 'Quote this material') + '</a>' +
      '<a class="boton boton--claro" href="mailto:' + SR.correo + '?subject=' + encodeURIComponent(L('Cotización ', 'Quote ') + f.nombre) + '">' + L('Pedir por correo', 'Ask by email') + '</a></div>' +
      '</div>';
    var otras = $('#otras');
    if (otras) otras.innerHTML = Object.keys(SR.fichas).filter(function (k) { return k !== id; }).map(function (k) {
      var o = SR.fichas[k];
      return '<li class="material"><a href="ficha.html?m=' + k + '"><div class="muestra"><img src="assets/img/fin/' + o.acabados[0][2] + '.webp" alt="' + o.nombre + '" width="400" height="400" loading="lazy"></div><h3>' + o.nombre + '</h3><p class="meta"><span>' + o.acabados.length + ' ' + L('acabados', 'finishes') + '</span></p></a></li>';
    }).join('');
    $$('.acabados-lista button', cont).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i, a = f.acabados[i], img = $('#ficha-img');
        cont.dataset.acabado = i;
        $$('.acabados-lista button', cont).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        img.classList.add('saliendo');
        setTimeout(function () { img.src = 'assets/img/fin/' + a[2] + '.webp'; img.alt = f.nombre + ' ' + L(a[0], a[1]).toLowerCase(); img.onload = function () { img.classList.remove('saliendo'); }; }, reduce ? 0 : 380);
      });
    });
  }

  aplicarIdioma(true);

  /* ---------- Revelados ---------- */
  var io = 'IntersectionObserver' in w ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.revela').forEach(function (el) { io ? io.observe(el) : el.classList.add('visto'); });
  requestAnimationFrame(function () { d.documentElement.classList.add('listo'); });

  /* ---------- Héroe: entrada y salida del texto ---------- */
  if (gsap && $('.heroe')) {
    if (!reduce) {
      gsap.from('.heroe h1 .palabra > span', { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: .06, delay: .25 });
      gsap.from('.heroe .entrada, .heroe-botones, .heroe-material', { opacity: 0, y: 20, duration: 1.2, ease: 'power3.out', delay: .8, stagger: .12 });
      gsap.to('.heroe-texto', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.heroe', start: 'top top', end: '28% top', scrub: true } });
      gsap.to('.heroe-avance i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.heroe', start: 'top top', end: 'bottom bottom', scrub: true } });
    }
  }

  /* ---------- Proyectos: recorrido horizontal ---------- */
  var pista = $('#pista');
  if (pista && gsap && ST && !reduce) {
    ST.matchMedia({
      '(min-width: 821px)': function () {
        var dist = function () { return Math.max(0, pista.scrollWidth - w.innerWidth); };
        gsap.to(pista, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: '#proyectos', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      }
    });
  }

  /* ---------- Cantera ---------- */
  var mapaSVG = '<svg viewBox="0 0 400 300" role="img" aria-label="' + L('Ruta de Tatatila, Veracruz, a Estados Unidos', 'Route from Tatatila, Veracruz, to the United States') + '">' +
    '<circle cx="292" cy="226" r="5" fill="#A8854F"/><circle cx="292" cy="226" r="14" fill="none" stroke="#A8854F" stroke-opacity=".4"/>' +
    '<circle cx="150" cy="62" r="4" fill="#DCDBD6"/>' +
    '<path class="ruta" d="M292 226 C 300 150, 210 70, 150 62"/>' +
    '<text x="282" y="258" text-anchor="end">Tatatila, Veracruz</text><text x="150" y="40" text-anchor="middle">' + L('Estados Unidos', 'United States') + '</text>' +
    '<text x="206" y="168" fill-opacity=".55">' + L('México', 'Mexico') + '</text></svg>';
  $$('.cantera-visual .mapa, .mapa-movil').forEach(function (el) { el.innerHTML = mapaSVG; });
  var figs = $$('.cantera-visual figure');
  var mapaMovil = $('.mapa-movil'); if (mapaMovil) mapaMovil.classList.add('mapa');
  if ('IntersectionObserver' in w) {
    var io2 = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.dataset.paso;
        figs.forEach(function (f) { f.classList.toggle('activa', f.dataset.paso === n); });
        if (n === '2' && mapaMovil) mapaMovil.classList.add('activa');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('.paso').forEach(function (p) { io2.observe(p); });
  }
  if (gsap && !reduce) $$('.marca-paso').forEach(function (m) {
    gsap.from(m, { scaleX: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: m, start: 'top 80%' } });
  });

  /* ---------- Visor de fotos ---------- */
  var visor = $('#visor'), quien = null;
  function cerrarVisor() { if (!visor || !visor.classList.contains('abierto')) return; visor.classList.remove('abierto'); if (lenis) lenis.start(); if (quien) quien.focus(); }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-visor]');
    if (b && visor) {
      quien = b; var img = b.querySelector('img');
      $('img', visor).src = img.src; $('img', visor).alt = img.alt;
      $('p', visor).textContent = b.parentNode.querySelector('.t-m').textContent;
      visor.classList.add('abierto'); if (lenis) lenis.stop(); $('.cerrar', visor).focus();
      return;
    }
    if (visor && visor.classList.contains('abierto') && (e.target === visor || e.target.closest('.cerrar'))) cerrarVisor();
  });

  w.addEventListener('load', function () { if (ST) ST.refresh(); });
})(window, document);
