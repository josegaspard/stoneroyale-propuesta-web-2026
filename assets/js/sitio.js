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
    if (a.dataset.uso) preseleccionar({ uso: a.parentNode.querySelector('.t-m').textContent });
    if (a.dataset.material) preseleccionar({ material: a.dataset.material });
    if (a.dataset.filtroIr) { var fb = $('.filtros button[data-filtro="' + a.dataset.filtroIr + '"]'); if (fb) fb.click(); }
    irA(h);
  });

  /* ---------- Cabecera y menú ---------- */
  var cab = $('.cabecera'), wa = $('.wa-fijo'), ultimo = 0;
  function alScroll() {
    var y = w.scrollY;
    cab.classList.toggle('solida', y > 40);
    cab.classList.toggle('oculta', y > 600 && y > ultimo + 4 && !d.body.classList.contains('menu-abierto'));
    if (y < ultimo - 4) cab.classList.remove('oculta');
    var hz = $('.heroe'); if (wa) wa.classList.toggle('escondido', !!hz && y < hz.offsetHeight - w.innerHeight * .5);
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
    $$('[data-en-placeholder]').forEach(function (el) {
      if (el.dataset.esPlaceholder === undefined) el.dataset.esPlaceholder = el.placeholder;
      el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.esPlaceholder;
    });
    $$('[data-en-alt]').forEach(function (el) {
      if (el.dataset.esAlt === undefined) el.dataset.esAlt = el.alt;
      el.alt = lang === 'en' ? el.dataset.enAlt : el.dataset.esAlt;
    });
    $$('[data-partir]').forEach(partir);
    pintarContacto(); pintarInstagram();
    $$('[data-idioma]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.idioma === lang)); });
    pintarCatalogo(); pintarListas(); pintarSelects(); pintarFicha(primera); pintarPanel(false);
  }
  $$('[data-idioma]').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.idioma; try { localStorage.setItem('sr-idioma', lang); } catch (e) {}
      aplicarIdioma(false); if (ST) ST.refresh();
    });
  });

  /* ---------- Catálogo ---------- */
  var filtro = 'todos';
  function imgDe(m) { return SR.base + 'assets/img/' + (m[4] ? m[4] : 'mat/' + m[0]) + '.webp'; }
  function tarjeta(m) {
    var tipo = SR.tipos[m[2]][lang === 'en' ? 1 : 0];
    var cuerpo = '<div class="muestra"><img src="' + imgDe(m) + '" alt="' + m[1] + ', ' + tipo.toLowerCase() + '" width="640" height="640" loading="lazy"></div>' +
      '<h3>' + m[1] + '</h3><p class="meta"><span>' + tipo + '</span>' + (m[3] ? '<em>' + L('Ver acabados', 'See finishes') + '</em>' : '<span>' + L('Cotizar', 'Quote') + '</span>') + '</p>';
    var dentro = m[3] ? '<a href="' + SR.rutaFicha + '?m=' + m[3] + '">' + cuerpo + '</a>' : '<button type="button" class="abrir" data-material="' + m[1] + '">' + cuerpo + '</button>';
    return '<li class="material' + (filtro !== 'todos' && filtro !== m[2] ? ' fuera' : '') + '" data-tipo="' + m[2] + '">' + dentro + '</li>';
  }
  function pintarCatalogo() {
    var ul = $('#materiales'); if (!ul) return;
    ul.innerHTML = SR.catalogo.map(tarjeta).join('');
    $$('.filtros button').forEach(function (b) {
      var f = b.dataset.filtro;
      var n = f === 'todos' ? SR.catalogo.length : SR.catalogo.filter(function (m) { return m[2] === f; }).length;
      b.querySelector('sup').textContent = n; b.hidden = f !== 'todos' && !n;
    });
    $$('[data-cuenta]').forEach(function (el) {
      var n = SR.catalogo.filter(function (m) { return m[2] === el.dataset.cuenta; }).length;
      el.textContent = n + ' ' + L(n === 1 ? 'material' : 'materiales', n === 1 ? 'material' : 'materials');
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

  /* ---------- Teléfono (una sola variable en datos.js) ---------- */
  function pintarContacto() {
    var num = SR.numero(lang === 'en'), dig = SR.digitos(lang === 'en');
    $$('[data-solo-tel]').forEach(function (el) { el.hidden = !num; });
    $$('[data-tel-texto]').forEach(function (el) {
      if (el.tagName === 'SPAN') { el.hidden = !num; el.textContent = num ? num + ' · ' : ''; } else el.textContent = num;
    });
    $$('[data-tel]').forEach(function (el) { el.href = num ? 'tel:+' + dig : '#'; el.textContent = num; });
    $$('[data-wa]').forEach(function (el) { el.href = num ? 'https://wa.me/' + dig : '#'; });
  }

  /* ---------- Instagram: perfil oficial con sus últimas publicaciones (se carga al acercarse) ---------- */
  function pintarInstagram() {
    var caja = $('#ig-embed'); if (!caja) return;
    var u = SR.instagram, url = 'https://www.instagram.com/' + u + '/', seguir = $('#ig-seguir'), usuario = $('#ig-usuario');
    if (usuario) usuario.textContent = u;
    if (seguir) seguir.href = url;
    if (caja.dataset.espera) return;
    caja.dataset.espera = '1';
    var poner = function () {
      caja.innerHTML = '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '?utm_source=ig_embed" data-instgrm-version="14"><a href="' + url + '" target="_blank" rel="noopener">@' + u + '</a></blockquote>';
      if (w.instgrm && w.instgrm.Embeds) w.instgrm.Embeds.process();
      else { var sc = d.createElement('script'); sc.async = true; sc.src = 'https://www.instagram.com/embed.js'; d.body.appendChild(sc); }
    };
    if ('IntersectionObserver' in w) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); poner(); } }, { rootMargin: '900px 0px' }).observe(caja);
    else poner();
  }

  /* ---------- Cotizador: ubicación → material → acabado → formato → m², luego datos de contacto ---------- */
  function fichaDe(nombre) {
    var m = SR.catalogo.filter(function (x) { return x[1] === nombre; })[0];
    return m && m[3] ? SR.fichas[m[3]] : null;
  }
  function pintarAcabados() {
    var sm = $('#f-material'), sa = $('#f-acabado'); if (!sa) return;
    var co = $('#campo-otro'); if (co) co.hidden = sm.value !== '__otro';
    var va = sa.value, f = fichaDe(sm.value);
    var lista = f ? f.acabados : SR.acabados;
    sa.innerHTML = '<option value="">' + L('Por definir', 'To be defined') + '</option>' + lista.map(function (x) { return '<option value="' + x[0] + '">' + L(x[0], x[1]) + '</option>'; }).join('');
    if (va && lista.some(function (x) { return x[0] === va; })) sa.value = va;
  }
  function pintarSelects() {
    var sm = $('#f-material'), sf = $('#f-formato');
    if (!sm) return;
    var vm = sm.value, vf = sf.value;
    sm.innerHTML = '<option value="">' + L('Aún no lo sé', 'Not sure yet') + '</option>' + SR.catalogo.map(function (m) { return '<option>' + m[1] + '</option>'; }).join('') +
      '<option value="__otro">' + L('Otro material (escríbelo)', 'Other material (type it)') + '</option>';
    sf.innerHTML = '<option value="">' + L('Por definir', 'To be defined') + '</option>' + SR.formatos.map(function (x) { return '<option value="' + x[0] + '">' + L(x[0], x[1]) + '</option>'; }).join('');
    if (vm) sm.value = vm; if (vf) sf.value = vf;
    pintarAcabados();
  }
  function preseleccionar(o) {
    if (o.material && $('#f-material')) { $('#f-material').value = o.material; pintarAcabados(); }
    var c = $('#f-msg');
    if (o.uso && c && !c.value) c.value = L('Uso: ', 'Use: ') + o.uso + '. ';
  }
  var form = $('#formulario'), token = null;
  function direccion() {
    var g = function (n) { return form && form.elements[n] ? (form.elements[n].value || '').trim() : ''; };
    var cp = g('cp') ? L('C.P. ', 'ZIP ') + g('cp') : '';
    return [g('calle'), g('colonia') ? L('Col. ', '') + g('colonia') : '', cp, g('ciudad'), g('estado'), g('pais')].filter(Boolean).join(', ');
  }
  /* WhatsApp del cotizador: lleva lo que ya se llenó del formulario (material, acabado, formato, m² y dirección). */
  $$('.cotizar-wa [data-wa]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!form || a.getAttribute('href') === '#') return;
      var g = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
      var mat = g('material') === '__otro' ? g('material_otro') : g('material');
      var l = [L('Hola, quiero cotizar:', 'Hi, I would like a quote:')];
      if (mat) l.push(L('Material: ', 'Material: ') + mat);
      if (g('acabado')) l.push(L('Acabado: ', 'Finish: ') + g('acabado'));
      if (g('formato')) l.push(L('Formato: ', 'Format: ') + g('formato'));
      if (g('m2')) l.push(L('Metros cuadrados: ', 'Square meters: ') + g('m2'));
      if (g('calle') || g('colonia') || g('cp') || g('ciudad') || g('estado')) l.push(L('Ubicación de la obra: ', 'Project location: ') + direccion());
      if (g('nombre')) l.push(L('Nombre: ', 'Name: ') + g('nombre'));
      a.href = a.href.split('?')[0] + (l.length > 1 ? '?text=' + encodeURIComponent(l.join('\n')) : '');
    });
  });
  function pedirToken() {
    if (token || !w.fetch) return;
    token = {};
    fetch(SR.envio, { method: 'GET', mode: 'cors', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { token = j; }).catch(function () { token = null; });
  }
  if (form) {
    $('#f-material').addEventListener('change', pintarAcabados);
    form.addEventListener('focusin', pedirToken);
    if ('IntersectionObserver' in w) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { pedirToken(); o.disconnect(); } }, { rootMargin: '600px' }).observe(form);
    var pm = new URLSearchParams(w.location.search).get('material');
    if (pm) setTimeout(function () { preseleccionar({ material: pm }); }, 0);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (form.elements[n].value || '').trim(); };
      var aviso = $('#aviso'), boton = $('button[type="submit"]', form);
      var mal = function (msg, campo) { aviso.textContent = msg; aviso.classList.add('error'); aviso.classList.remove('bien'); if (campo) form.elements[campo].focus(); };
      if (v('nombre').length < 2) return mal(L('Escribe tu nombre.', 'Please add your name.'), 'nombre');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('correo'))) return mal(L('Revisa tu correo: lo necesitamos para enviarte la cotización.', 'Please check your email: we need it to send you the quote.'), 'correo');
      if (v('m2') && !/^\d{1,6}([.,]\d{1,2})?$/.test(v('m2'))) return mal(L('Escribe los metros cuadrados solo con números (ej. 45 o 12.5).', 'Use numbers only for square meters (e.g. 45 or 12.5).'), 'm2');
      if (v('telefono') && !/^[0-9+()\s.-]{7,25}$/.test(v('telefono'))) return mal(L('Revisa el teléfono: solo números, espacios y +.', 'Please check the phone: numbers, spaces and + only.'), 'telefono');
      var usa = v('pais') === 'Estados Unidos';
      if (!(usa ? /^\d{5}(-\d{4})?$/ : /^\d{5}$/).test(v('cp'))) return mal(usa ? L('Escribe el código postal (ZIP) de 5 dígitos.', 'Please add the 5-digit ZIP code.') : L('Escribe el código postal de 5 dígitos de la obra.', 'Please add the 5-digit postal code.'), 'cp');
      if (v('ciudad').length < 2) return mal(L('Escribe la ciudad o municipio de la obra.', 'Please add the city.'), 'ciudad');
      if (v('estado').length < 2) return mal(L('Escribe el estado de la obra.', 'Please add the state.'), 'estado');
      if (!token || !token.s) { pedirToken(); return mal(L('Un momento, preparando el envío… vuelve a pulsar «Enviar solicitud».', 'One moment, getting ready… please press “Send request” again.')); }
      var datos = { t: token.t, s: token.s, idioma: lang, pagina: w.location.href.split('#')[0] };
      ['pais', 'calle', 'colonia', 'cp', 'ciudad', 'estado', 'material', 'acabado', 'formato', 'm2', 'nombre', 'correo', 'telefono', 'comentario', 'sitio_web'].forEach(function (n) { datos[n] = v(n); });
      datos.ubicacion = direccion().slice(0, 120);
      if (datos.material === '__otro') datos.material = L('Otro: ', 'Other: ') + (v('material_otro') || L('por definir', 'to be defined'));
      aviso.classList.remove('error', 'bien'); aviso.textContent = L('Enviando…', 'Sending…'); boton.disabled = true;
      fetch(SR.envio, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
        .then(function (r) {
          boton.disabled = false;
          if (r.ok) {
            form.reset(); pintarAcabados(); token = null; pedirToken();
            aviso.textContent = L('Gracias, recibimos tu solicitud. Te enviaremos la cotización a tu correo.', 'Thank you, we received your request. We will email you the quote.');
            aviso.classList.add('bien');
          } else if (r.j && r.j.msg === 'limite') mal(L('Recibimos varias solicitudes seguidas. Escríbenos a ' + SR.correo + '.', 'We received several requests in a row. Please email ' + SR.correo + '.'));
          else { token = null; pedirToken(); mal(L('No se pudo enviar. Revisa los datos e inténtalo de nuevo, o escríbenos a ' + SR.correo + '.', 'It could not be sent. Check the details and try again, or email ' + SR.correo + '.')); }
        })
        .catch(function () { boton.disabled = false; mal(L('No se pudo enviar por un problema de conexión. Escríbenos a ' + SR.correo + '.', 'It could not be sent due to a connection problem. Please email ' + SR.correo + '.')); });
    });
  }

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
      '<div class="ficha-visual"><div class="grande"><img id="ficha-img" src="' + SR.base + 'assets/img/fin/' + ac[2] + '.webp" alt="' + f.nombre + ' ' + L(ac[0], ac[1]).toLowerCase() + '" width="800" height="800"></div></div>' +
      '<div class="ficha-datos">' +
      '<nav class="migas" aria-label="' + L('Ruta', 'Breadcrumb') + '"><a href="' + SR.rutaInicio + '#catalogo">' + L('Catálogo', 'Catalog') + '</a> / ' + tipo + '</nav>' +
      '<h1 class="t-xl">' + f.nombre + '</h1>' +
      '<p class="ficha-desc">' + (f.tipo === 'marmol'
        ? L('El mármol es una roca metamórfica formada a partir de rocas calizas sometidas a altas temperaturas y presiones, que alcanza un alto grado de cristalización; su componente básico es el carbonato de calcio.', 'Marble is a metamorphic rock formed from limestone subjected to high temperatures and pressures, reaching a high degree of crystallization; its basic component is calcium carbonate.')
        : L('Travertino mexicano de las canteras con las que trabaja Stone Royale, disponible en ' + f.acabados.length + ' acabados.', 'Mexican travertine from the quarries Stone Royale works with, available in ' + f.acabados.length + ' finishes.')) + '</p>' +
      '<h2>' + L('Acabados', 'Finishes') + ' <span class="meta">(' + f.acabados.length + ')</span></h2>' +
      '<ul class="acabados-lista">' + f.acabados.map(function (a, i) {
        return '<li><button type="button" data-i="' + i + '" aria-pressed="' + (i === actual) + '"><img src="' + SR.base + 'assets/img/fin/' + a[2] + '.webp" alt="" width="200" height="200" loading="lazy"><span>' + L(a[0], a[1]) + '</span></button></li>';
      }).join('') + '</ul>' +
      '<h2>' + L('Formatos', 'Formats') + '</h2><ul class="simple">' + SR.formatos.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul>' +
      '<h2>' + L('Medidas estándar', 'Standard sizes') + '</h2><ul class="simple"><li>.305 × .305 · .40 × .40 · .60 × .60 × 1</li><li>.305 / .40 / .60 × ' + L('largo libre', 'free length') + ' × 1</li><li>' + L('Lámina promedio: 2.40 × 1.70 × 2 cm', 'Average slab: 2.40 × 1.70 × 2 cm') + '</li></ul>' +
      '<p class="nota">' + L('Al ser piedra natural, cada pieza puede variar en tono y veta.', 'Being natural stone, each piece may vary in tone and vein.') + '</p>' +
      '<div class="acciones"><a class="boton" href="' + SR.rutaInicio + '?material=' + encodeURIComponent(f.nombre) + '#cotizar">' + L('Cotizar este material', 'Quote this material') + '</a>' +
      (SR.numero(lang === 'en') ? '<a class="boton boton--claro" target="_blank" rel="noopener" href="https://wa.me/' + SR.digitos(lang === 'en') + '?text=' + encodeURIComponent(L('Hola, quiero cotizar ', 'Hi, I would like a quote for ') + f.nombre) + '">WhatsApp</a>' : '') + '</div>' +
      '</div>';
    var otras = $('#otras');
    if (otras) otras.innerHTML = Object.keys(SR.fichas).filter(function (k) { return k !== id; }).map(function (k) {
      var o = SR.fichas[k];
      return '<li class="material"><a href="' + SR.rutaFicha + '?m=' + k + '"><div class="muestra"><img src="' + SR.base + 'assets/img/fin/' + o.acabados[0][2] + '.webp" alt="' + o.nombre + '" width="400" height="400" loading="lazy"></div><h3>' + o.nombre + '</h3><p class="meta"><span>' + o.acabados.length + ' ' + L('acabados', 'finishes') + '</span></p></a></li>';
    }).join('');
    $$('.acabados-lista button', cont).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i, a = f.acabados[i], img = $('#ficha-img');
        cont.dataset.acabado = i;
        $$('.acabados-lista button', cont).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        img.classList.add('saliendo');
        setTimeout(function () { img.src = SR.base + 'assets/img/fin/' + a[2] + '.webp'; img.alt = f.nombre + ' ' + L(a[0], a[1]).toLowerCase(); img.onload = function () { img.classList.remove('saliendo'); }; }, reduce ? 0 : 380);
      });
    });
  }

  /* ---------- Panel del mármol en la losa (héroe) ---------- */
  var panel = $('#heroe-ficha'), sec = SR.heroe, enPanel = 0;
  function datosMarmol(m) {
    var ficha = m[3] && SR.fichas[m[3]];
    var acab = ficha ? ficha.acabados.map(function (a) { return L(a[0], a[1]); }) : SR.acabados.map(function (a) { return L(a[0], a[1]); });
    return {
      nombre: m[1],
      tipo: SR.tipos[m[2]][lang === 'en' ? 1 : 0],
      desc: m[2] === 'marmol'
        ? L('Roca metamórfica formada a partir de rocas calizas sometidas a altas temperaturas y presiones; su componente básico es el carbonato de calcio.', 'A metamorphic rock formed from limestone subjected to high temperatures and pressures; its basic component is calcium carbonate.')
        : L('El ónix es de origen natural: cada pieza puede presentar variantes en sus tonos y vetas.', 'Onyx is a natural stone: each piece may vary in its tones and veins.'),
      acabados: acab.join(' · '),
      ficha: ficha ? SR.rutaFicha + '?m=' + m[3] : null
    };
  }
  function pintarPanel(animar) {
    if (!panel) return;
    var m = sec.marmoles[enPanel], x = datosMarmol(m);
    $('.hf-nombre', panel).textContent = x.nombre;
    $('.hf-tipo', panel).textContent = x.tipo + (x.ficha ? ' · ' + L('con ficha de acabados', 'with finishes sheet') : '');
    $('.hf-desc', panel).textContent = x.desc;
    $('.hf-acabados', panel).textContent = x.acabados;
    $('.hf-formatos', panel).textContent = SR.formatos.map(function (f) { return L(f[0], f[1]); }).join(' · ');
    $('.hf-medidas', panel).textContent = L('De .305 × .305 a .60 × .60 × 1, largo libre y lámina promedio de 2.40 × 1.70 × 2 cm', 'From .305 × .305 to .60 × .60 × 1, free length and average slab of 2.40 × 1.70 × 2 cm');
    $('.hf-usos', panel).textContent = SR.usos.filter(function (u) { return u[0] !== 'Otro'; }).map(function (u) { return L(u[0], u[1]); }).join(' · ');
    var ver = $('.hf-ver', panel);
    ver.href = x.ficha || '#catalogo';
    ver.textContent = x.ficha ? L('Ver ficha', 'See sheet') : L('Ver en el catálogo', 'See in catalog');
    $('.hf-cotizar', panel).dataset.material = x.nombre;
    var mini = $('.hf-miniaturas', panel);
    if (!mini.children.length) mini.innerHTML = sec.marmoles.map(function (mm, i) {
      return '<button type="button" data-i="' + i + '" aria-label="' + mm[1] + '"><img src="' + SR.base + 'assets/img/mat/' + mm[0] + '.webp" alt="" width="104" height="104"></button>';
    }).join('');
    $$('button', mini).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === enPanel)); });
    if (animar && gsap && !reduce) gsap.fromTo($$('.hf-a', panel), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, stagger: .05, ease: 'power3.out', overwrite: true });
  }
  function mostrarMarmol(i) {
    if (i === enPanel) return;
    enPanel = i; pintarPanel(true);
    var est = $('.heroe-estatico img'); if (est) est.src = SR.base + 'assets/img/mat/' + sec.marmoles[i][0] + '-hd.webp';
    if (d.documentElement.classList.contains('sin-webgl')) { var n = $('#nombre-losa'); if (n) n.textContent = sec.marmoles[i][1]; }
  }
  d.addEventListener('sr:marmol', function (e) { mostrarMarmol(e.detail); });
  // Sin WebGL: el mismo cálculo que la losa, sobre el avance del scroll
  w.addEventListener('scroll', function () {
    if (!panel || !d.documentElement.classList.contains('sin-webgl')) return;
    var h = $('.heroe'), r = h.getBoundingClientRect(), tot = r.height - w.innerHeight;
    var p = tot > 0 ? Math.min(1, Math.max(0, -r.top / tot)) : 0, q = Math.max(0, (p - sec.inicio) / (1 - sec.inicio));
    var tr = Math.min(sec.marmoles.length - 1.0001, q * (sec.marmoles.length - 0.6)), i = Math.floor(tr);
    mostrarMarmol((tr - i) > 0.78 ? i + 1 : i);
  }, { passive: true });
  // Miniaturas: llevan el scroll al punto donde ese mármol ocupa la losa
  d.addEventListener('click', function (e) {
    var b = e.target.closest('.hf-miniaturas button'); if (!b) return;
    var i = +b.dataset.i, h = $('.heroe'), tot = h.offsetHeight - w.innerHeight;
    var tramo = i === 0 ? 0.3 : i + 0.25;
    var p = sec.inicio + (1 - sec.inicio) * (tramo / (sec.marmoles.length - 0.6));
    var y = h.getBoundingClientRect().top + w.scrollY + p * tot;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else w.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });

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
      gsap.from('.heroe h1 .linea', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out', stagger: .14, delay: .15 });
      gsap.from('.heroe .entrada, .heroe-botones, .heroe-material', { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out', delay: .55, stagger: .1 });
      if (ST) ST.matchMedia({ '(min-width: 821px)': function () {
        gsap.to('.heroe-texto, .heroe-material', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.heroe', start: 'top top', end: '9% top', scrub: true } });
        gsap.fromTo('#heroe-ficha', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.heroe', start: '8% top', end: '13% top', scrub: true } });
        gsap.to('.heroe-avance i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.heroe', start: 'top top', end: 'bottom bottom', scrub: true } });
      } });
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
  var mapaSVG = '<svg viewBox="0 0 400 300" role="img" aria-label="' + L('De México a Estados Unidos', 'From Mexico to the United States') + '">' +
    '<circle cx="246" cy="206" r="5" fill="#A8854F"/><circle cx="246" cy="206" r="14" fill="none" stroke="#A8854F" stroke-opacity=".4"/>' +
    '<circle cx="150" cy="62" r="4" fill="#DCDBD6"/>' +
    '<path class="ruta" d="M246 206 C 260 140, 200 75, 150 62"/>' +
    '<text x="246" y="238" text-anchor="middle">' + L('México', 'Mexico') + '</text><text x="150" y="40" text-anchor="middle">' + L('Estados Unidos', 'United States') + '</text>' +
    '</svg>';
  $$('.cantera-visual .mapa, .mapa-movil, .am-foto.mapa').forEach(function (el) { el.innerHTML = mapaSVG; });
  if ('IntersectionObserver' in w) $$('.am-foto.mapa').forEach(function (el) {
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { el.classList.add('activa'); o.disconnect(); } }, { threshold: .4 }).observe(el);
  }); else $$('.am-foto.mapa').forEach(function (el) { el.classList.add('activa'); });

  /* ---------- Material destacado: placa natural / en obra ---------- */
  var dv = $('.destacado-visual');
  if (dv) d.addEventListener('click', function (e) {
    var b = e.target.closest('.dv-conmutador button'); if (!b) return;
    var v = b.dataset.vista;
    $$('.dv-conmutador button', dv).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $$('.dv-img', dv).forEach(function (im) { im.classList.toggle('activa', im.dataset.vista === v); });
    dv.classList.toggle('obra-activa', v === 'obra');
  });

  /* ---------- Proyectos: lista de obras con visor ---------- */
  var oLista = $('#obras-lista'), oImg = $('#obra-img'), oNom = $('#obra-nombre');
  if (oLista && oImg) oLista.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.getAttribute('aria-pressed') === 'true') return;
    $$('button', oLista).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    var sp = b.querySelectorAll('span'), nombre = sp[0].textContent + (sp[1] ? ' · ' + sp[1].textContent : ''), uso = $('.obras-visor figcaption a');
    var cambiar = function () {
      oImg.onload = function () { oImg.classList.remove('cambiando'); };
      oImg.src = SR.base + 'assets/img/usos/' + b.dataset.img + '.webp'; oImg.alt = L(b.dataset.alt, b.dataset.altEn); oImg.removeAttribute('data-en-alt'); oNom.textContent = nombre;
      if (uso) uso.dataset.uso = sp[0].textContent;
    };
    if (reduce) cambiar(); else { oImg.classList.add('cambiando'); setTimeout(cambiar, 250); }
  });
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
      $('p', visor).textContent = b.dataset.pie || b.parentNode.querySelector('.t-m').textContent;
      visor.classList.add('abierto'); if (lenis) lenis.stop(); $('.cerrar', visor).focus();
      return;
    }
    if (visor && visor.classList.contains('abierto') && (e.target === visor || e.target.closest('.cerrar'))) cerrarVisor();
  });

  w.addEventListener('load', function () { if (ST) ST.refresh(); });
})(window, document);
