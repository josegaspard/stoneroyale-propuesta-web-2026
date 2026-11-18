/* Contenido real de stoneroyale.com.mx (catálogo, fichas, acabados y medidas). */
window.SR = {
  /* TELÉFONO: el anterior (+1 956 404 6619) ya no es válido. Escribir aquí el nuevo con lada internacional,
     p. ej. '+52 55 1234 5678', y aparece solo en tel:, WhatsApp, menú, contacto y pie. Vacío = no se muestra.
     telefonoEN (opcional) = número de EUA para la versión en inglés; si va vacío se usa el mismo. */
  telefono: '',
  telefonoEN: '',
  correo: 'alexvmh@stoneroyale.com.mx',
  /* INSTAGRAM: usuario sin @ (p. ej. 'stoneroyale') y, si se quiere, enlaces de publicaciones para incrustarlas. */
  instagram: '',
  instagramPosts: [],
  /* Envío del cotizador (correo con antispam en servidor). */
  envio: 'https://josegaspard.dev/cotizador/stoneroyale.php',
  /* MATERIALES QUE NO SE MANEJAN: poner aquí el slug (primera columna del catálogo) y desaparecen del catálogo,
     del héroe y del cotizador. Ej.: ['serpentino', 'onix-lava'] */
  ocultar: [],
  tipos: { marmol: ['Mármol', 'Marble'], travertino: ['Travertino', 'Travertine'], onix: ['Ónix', 'Onyx'] },
  // [slug de imagen, nombre, tipo, ficha]
  catalogo: [
    ['bego', 'Bego', 'marmol'],
    ['travertino-rojo', 'Travertino Rojo', 'travertino'],
    ['puebla-fiorito', 'Puebla Fiorito', 'travertino', 'travertino-puebla'],
    ['puebla-veta', 'Puebla Veta', 'travertino', 'travertino-puebla'],
    ['xalapa-fiorito', 'Xalapa Fiorito', 'travertino', 'travertino-xalapa'],
    ['xalapa-veta', 'Xalapa Veta', 'travertino', 'travertino-xalapa'],
    ['beige-maya', 'Beige Maya', 'marmol', 'beige-maya'],
    ['veneciano', 'Veneciano', 'marmol'],
    ['crema-marfil', 'Crema Marfil', 'marmol'],
    ['tikul', 'Tikul', 'marmol'],
    ['aqua-blue', 'Aqua Blue', 'marmol'],
    ['sto-tomas', 'Santo Tomás', 'marmol', 'santo-tomas'],
    ['dorado-tepexi', 'Dorado Tepexi', 'marmol', 'dorado-tepeji'],
    ['marmol-arena', 'Mármol Arena', 'marmol'],
    ['cafe-cordoba', 'Café Córdoba', 'marmol'],
    ['gris-tepeaca', 'Gris Tepeaca', 'marmol'],
    ['negro-queretaro', 'Negro Querétaro', 'marmol'],
    ['bellagio', 'Bellagio', 'marmol'],
    ['grano-de-sal', 'Grano de Sal', 'marmol'],
    ['travertino-oro', 'Travertino Oro', 'travertino'],
    ['serpentino', 'Serpentino', 'marmol'],
    ['blanco-arena', 'Blanco Arena', 'marmol', 'blanco-arena', 'fin/blanco-arena-mate'],
    ['rokali', 'Rokali', 'marmol', 'rokali', 'fin/rokali-pulido'],
    ['onix-agata', 'Ágata', 'onix'],
    ['onix-exotico', 'Ónix Exótico', 'onix'],
    ['onix-blanco', 'Ónix Blanco', 'onix'],
    ['onix-lava', 'Ónix Lava', 'onix'],
    ['blanco-iceberg', 'Blanco Iceberg', 'onix']
  ],
  fichas: {
    'travertino-puebla': { nombre: 'Travertino Puebla', tipo: 'travertino', acabados: [['Fiorito', 'Fiorito', 'travertino-puebla-fiorito'], ['A la veta', 'Vein cut', 'travertino-puebla-a-la-veta'], ['Busardeado', 'Bush-hammered', 'travertino-puebla-busardeado']] },
    'travertino-xalapa': { nombre: 'Travertino Xalapa', tipo: 'travertino', acabados: [['Fiorito', 'Fiorito', 'travertino-xalapa-fiorito'], ['A la veta', 'Vein cut', 'travertino-xalapa-a-la-veta'], ['Avejentado', 'Aged', 'travertino-xalapa-avejentado'], ['Al ácido', 'Acid-washed', 'travertino-xalapa-al-acido'], ['Al corte', 'Saw cut', 'travertino-xalapa-al-corte']] },
    'beige-maya': { nombre: 'Beige Maya', tipo: 'marmol', acabados: [['Pulido', 'Polished', 'beige-maya-pulido'], ['A la veta', 'Vein cut', 'beige-maya-a-la-veta']] },
    'blanco-arena': { nombre: 'Blanco Arena', tipo: 'marmol', acabados: [['Busardeado', 'Bush-hammered', 'blanco-arena-busardeado'], ['Mate', 'Matte', 'blanco-arena-mate']] },
    'dorado-tepeji': { nombre: 'Dorado Tepeji', tipo: 'marmol', acabados: [['Pulido', 'Polished', 'dorado-tepeji-pulido'], ['Busardeado', 'Bush-hammered', 'dorado-tepeji-busardeado']] },
    'santo-tomas': { nombre: 'Santo Tomás', tipo: 'marmol', acabados: [['Silver', 'Silver', 'santo-tomas-silver'], ['Busardeado', 'Bush-hammered', 'santo-tomas-busardeado'], ['Martelinado', 'Hammered', 'santo-tomas-martelinado'], ['Pulido', 'Polished', 'santo-tomas-pulido']] },
    'rokali': { nombre: 'Rokali', tipo: 'marmol', acabados: [['Pulido', 'Polished', 'rokali-pulido'], ['Busardeado', 'Bush-hammered', 'rokali-busardeado']] }
  },
  acabados: [['Natural', 'Natural'], ['Pulido mate', 'Matte polished'], ['Pulido y abrillantado', 'Polished and honed to shine'], ['Sanblasteado', 'Sandblasted'], ['Flameado y cepillado', 'Flamed and brushed'], ['Martelinado', 'Hammered'], ['Avejentado', 'Aged'], ['Tomboleado', 'Tumbled']],
  formatos: [['Placa', 'Slab'], ['Largos libres', 'Free lengths'], ['En formato', 'Cut to format'], ['Personalizado', 'Custom']],
  // Héroe: [slug de imagen, nombre en catálogo, tipo, ficha]. 'inicio' = parte del scroll reservada al titular.
  heroe: { inicio: 0.15, marmoles: [['blanco-iceberg', 'Blanco Iceberg', 'onix'], ['dorado-tepexi', 'Dorado Tepexi', 'marmol', 'dorado-tepeji'], ['onix-lava', 'Ónix Lava', 'onix'], ['sto-tomas', 'Santo Tomás', 'marmol', 'santo-tomas']] },
  usos: [['Regadera', 'Shower'], ['Encimera', 'Countertop'], ['Exterior', 'Exterior'], ['Paredes', 'Interior wall'], ['Alberca', 'Pool'], ['Lavadero', 'Backsplash'], ['Otro', 'Other']]
};

/* Rutas y origen de los archivos (en WordPress los archivos se sirven desde GitHub Pages). */
(function (SR, c) {
  c = window.SR_CFG || {};
  SR.base = c.base || '';
  SR.rutaInicio = c.inicio || 'index.html';
  SR.rutaFicha = c.ficha || 'ficha.html';
  var fuera = function (m) { return SR.ocultar.indexOf(m[0]) === -1; };
  SR.catalogo = SR.catalogo.filter(fuera);
  SR.heroe.marmoles = SR.heroe.marmoles.filter(fuera);
  SR.numero = function (en) { return (en && SR.telefonoEN) || SR.telefono; };
  SR.digitos = function (en) { return SR.numero(en).replace(/\D/g, ''); };
})(window.SR);
