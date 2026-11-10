const $ = (s) => document.querySelector(s);

/* 1) MENÚ MÓVIL */
const btnMenu = $('#btn-menu'), nav = $('#nav');
btnMenu.addEventListener('click', () => {
  btnMenu.setAttribute('aria-expanded', nav.classList.toggle('abierto'));
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') { nav.classList.remove('abierto'); btnMenu.setAttribute('aria-expanded', false); }
});

/* 2) MODO OSCURO */
const btnTema = $('#btn-tema');
function aplicarTema(t) {
  document.documentElement.dataset.tema = t;
  btnTema.textContent = t === 'oscuro' ? '☀️' : '🌙';
  try { localStorage.setItem('tema', t); } catch (e) {}
}
let guardado = null;
try { guardado = localStorage.getItem('tema'); } catch (e) {}
aplicarTema(guardado || (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'));
btnTema.addEventListener('click', () =>
  aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro'));

/* 3) CARRUSEL con botones y pausa */
const slides = document.querySelectorAll('.slide');
let actual = 0, timer = null;
function mostrar(i) {
  actual = (i + slides.length) % slides.length;
  slides.forEach(s => s.style.transform = `translateX(-${actual * 100}%)`);
}
function iniciar() { timer = setInterval(() => mostrar(actual + 1), 4000); }
function detener() { clearInterval(timer); timer = null; }
$('#next').addEventListener('click', () => mostrar(actual + 1));
$('#prev').addEventListener('click', () => mostrar(actual - 1));
$('#pausa').addEventListener('click', (e) => {
  const corriendo = timer !== null;
  corriendo ? detener() : iniciar();
  e.target.textContent = corriendo ? '▶' : '⏸';
  e.target.setAttribute('aria-label', corriendo ? 'Reanudar carrusel' : 'Pausar carrusel');
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) iniciar(); else $('#pausa').textContent = '▶';

/* 4) PROYECTOS: fetch desde JSON + FILTRO */
const lista = $('#lista-proyectos');
let proyectos = [];
function pintar(cat) {
  const v = cat === 'todos' ? proyectos : proyectos.filter(p => p.categoria === cat);
  lista.innerHTML = v.map(p => `
    <article class="proyecto"><h3>${p.titulo}</h3><p>${p.descripcion}</p><span class="etq">${p.tecnologias}</span></article>`
  ).join('') || '<p>No hay proyectos en esta categoría.</p>';
}
async function cargarProyectos() {
  try {
    const r = await fetch('data/proyectos.json');
    if (!r.ok) throw new Error(r.status);
    proyectos = await r.json();
    pintar('todos');
  } catch (e) {
    lista.textContent = 'No se pudieron cargar los proyectos. Abre el sitio con un servidor local (Live Server).';
  }
}
cargarProyectos();
document.querySelectorAll('.filtro').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.filtro').forEach(x => { x.classList.remove('activo'); x.setAttribute('aria-pressed', false); });
  b.classList.add('activo'); b.setAttribute('aria-pressed', true);
  pintar(b.dataset.filtro);
}));

/* 5) VALIDACIÓN DEL FORMULARIO */
const form = $('#form-contacto');
const reglas = {
  nombre: v => v.trim().length >= 3,
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  mensaje: v => v.trim().length >= 10
};
function validar(id) {
  const c = $('#' + id), ok = reglas[id](c.value);
  c.classList.toggle('is-invalid', !ok);
  c.classList.toggle('is-valid', ok);
  return ok;
}
Object.keys(reglas).forEach(id => $('#' + id).addEventListener('input', () => validar(id)));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = Object.keys(reglas).map(validar).every(Boolean);
  $('#exito').hidden = !ok;
  if (ok) { form.reset(); form.querySelectorAll('.is-valid').forEach(c => c.classList.remove('is-valid')); }
});
