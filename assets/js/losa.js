/* Héroe 3D: dos losas como el logotipo de Stone Royale (gris delante, negra detrás).
   La losa frontal lleva fotos reales de su catálogo y cambia de mármol con el scroll; la luz sigue al ratón. */
import * as THREE from '../vendor/three.module.min.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const doc = document.documentElement;
const lienzo = document.getElementById('losa');
const heroe = document.querySelector('.heroe');
const nombre = document.getElementById('nombre-losa');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const SEC = window.SR.heroe;
const MARMOLES = SEC.marmoles.map((m) => [m[0], m[1], m[3] ? 'ficha.html?m=' + m[3] : '#catalogo']);

function sinWebGL() { doc.classList.add('sin-webgl'); }

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { sinWebGL(); }

if (renderer && lienzo && heroe) iniciar();

function iniciar() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camara.position.set(0, 0, 7.2);

  // Muro que recibe la sombra
  const muro = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
  muro.position.z = -1.6; muro.receiveShadow = true; escena.add(muro);

  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(-3, 4, 6); sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024); sol.shadow.radius = 10; sol.shadow.blurSamples = 20;
  Object.assign(sol.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  escena.add(sol);
  const brillo = new THREE.PointLight(0xffffff, 14, 9, 1.6);
  brillo.position.set(1, 1, 3); escena.add(brillo);
  escena.add(new THREE.AmbientLight(0xffffff, 0.35));

  const cargador = new THREE.TextureLoader();
  const W = 1.3, H = 1.9, F = 0.07;
  const recorte = (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.repeat.set(W / H, 1); t.offset.set((1 - W / H) / 2, 0);
    return t;
  };
  let cargadas = 0;
  const alCargar = () => { if (++cargadas === MARMOLES.length + 1) { lienzo.style.opacity = 1; } };
  const texturas = MARMOLES.map(([s]) => recorte(cargador.load(`assets/img/mat/${s}-hd.webp`, alCargar, undefined, sinWebGL)));
  const texNegro = recorte(cargador.load('assets/img/mat/negro-queretaro-hd.webp', alCargar, undefined, sinWebGL));

  // Material de la losa frontal: mezcla dos fotos de mármol según el avance del scroll
  const uni = { uMap2: { value: texturas[1] }, uMix: { value: 0 } };
  const matFrente = new THREE.MeshPhysicalMaterial({ map: texturas[0], roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.55 });
  matFrente.onBeforeCompile = (sh) => {
    sh.uniforms.uMap2 = uni.uMap2; sh.uniforms.uMix = uni.uMix;
    sh.fragmentShader = 'uniform sampler2D uMap2;\nuniform float uMix;\n' + sh.fragmentShader.replace('#include <map_fragment>',
      `#ifdef USE_MAP
        vec4 c1 = texture2D( map, vMapUv );
        vec4 c2 = texture2D( uMap2, vMapUv );
        float diag = vMapUv.x * 0.4 + vMapUv.y * 0.6;
        float borde = uMix * 1.4 - 0.2;
        diffuseColor *= mix( c1, c2, 1.0 - smoothstep( borde - 0.15, borde + 0.15, diag ) );
      #endif`);
  };
  const matNegro = new THREE.MeshPhysicalMaterial({ map: texNegro, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.4 });

  const geo = new THREE.BoxGeometry(W, H, F, 1, 1, 1);
  const frente = new THREE.Mesh(geo, matFrente);
  const fondo = new THREE.Mesh(geo, matNegro);
  frente.castShadow = fondo.castShadow = true;
  const grupo = new THREE.Group();
  grupo.add(fondo, frente);
  escena.add(grupo);

  lienzo.style.opacity = 0;
  lienzo.style.transition = 'opacity 1.4s cubic-bezier(.22,.8,.2,1)';

  let ancho = 0, alto = 0, movil = false;
  function medir() {
    const r = lienzo.getBoundingClientRect();
    ancho = r.width; alto = r.height; movil = ancho < 821;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto; camara.updateProjectionMatrix();
    const vis = 2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) * camara.position.z;
    if (movil) { const bajo = alto < 700; grupo.position.set(vis * camara.aspect * 0.06, vis * (bajo ? 0.25 : 0.2), 0); grupo.scale.setScalar(Math.min(0.92, (vis * camara.aspect) / 2.4, (vis * (bajo ? 0.29 : 0.36)) / 2.1)); }
    else { grupo.position.set(vis * camara.aspect * 0.2, 0.05, 0); grupo.scale.setScalar(1.08); }
  }
  medir();
  addEventListener('resize', medir);

  const raton = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { raton.tx = (e.clientX / innerWidth) * 2 - 1; raton.ty = -((e.clientY / innerHeight) * 2 - 1); }, { passive: true });

  let visible = true, actual = -1, suave = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(heroe);
  lienzo.addEventListener('webglcontextlost', (e) => { e.preventDefault(); sinWebGL(); });

  const reloj = new THREE.Clock();
  function avance() {
    const r = heroe.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  }
  function cuadro() {
    requestAnimationFrame(cuadro);
    if (!visible) return;
    const t = reloj.getElapsedTime();
    const p = avance();
    suave += (p - suave) * (reduce ? 1 : 0.08);
    raton.x += (raton.tx - raton.x) * 0.05; raton.y += (raton.ty - raton.y) * 0.05;
    const m = reduce ? 0 : 1;

    // Textura: 4 tramos, el cambio ocurre en el último 35 % de cada uno
    const q = Math.max(0, (suave - SEC.inicio) / (1 - SEC.inicio));
    const tramo = Math.min(MARMOLES.length - 1.0001, q * (MARMOLES.length - 0.6));
    const i = Math.floor(tramo), f = tramo - i;
    const mezcla = THREE.MathUtils.smoothstep(f, 0.55, 1);
    matFrente.map = texturas[i]; uni.uMap2.value = texturas[Math.min(i + 1, texturas.length - 1)]; uni.uMix.value = mezcla;
    const cerca = mezcla > 0.5 ? i + 1 : i;
    if (cerca !== actual) { actual = cerca; if (nombre) { nombre.textContent = MARMOLES[cerca][1]; nombre.href = MARMOLES[cerca][2]; } document.dispatchEvent(new CustomEvent('sr:marmol', { detail: cerca })); }

    // Movimiento: giro con el scroll, inclinación con el ratón, flotación lenta
    grupo.rotation.y = -0.5 + suave * 0.95 + raton.x * 0.22 * m;
    grupo.rotation.x = 0.06 - raton.y * 0.12 * m + Math.sin(t * 0.5) * 0.02 * m;
    grupo.rotation.z = -0.03 + Math.sin(t * 0.33) * 0.01 * m;
    frente.position.set(-0.16 - suave * 0.12, 0.14 + Math.sin(t * 0.6) * 0.025 * m, 0.22 + suave * 0.25);
    fondo.position.set(0.2 + suave * 0.28, -0.16, -0.22 - suave * 0.2);
    fondo.rotation.y = suave * 0.18;
    brillo.position.set(raton.x * 3 + (movil ? 0 : 1.2), raton.y * 2 + 0.6, 2.6);

    renderer.render(escena, camara);
  }
  cuadro();
}
