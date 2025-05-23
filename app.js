
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const DATA_FILE = path.join(__dirname, 'invitados.json');

// Leer archivo JSON
function leerInvitados() {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Guardar en archivo JSON
function guardarInvitados(invitados) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(invitados, null, 2), 'utf-8');
}

// Normalizar texto: minúsculas, sin tildes, sin espacios extras
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")                   // separa acentos
    .replace(/\p{Diacritic}/gu, "")   // elimina diacríticos (acentos)
    .toLowerCase()
    .trim();
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Página principal
app.get('/', (req, res) => {
  const invitados = leerInvitados();
  res.render('index', { invitados });
});

// Formulario
app.get('/checkin', (req, res) => {
  res.render('checkin');
});

// Procesamiento
app.post('/checkin', (req, res) => {
  const nombreIngresado = normalizarTexto(req.body.nombre);
  const emailIngresado = req.body.email.toLowerCase().trim();
  let invitados = leerInvitados();

  const invitado = invitados.find(i =>
    normalizarTexto(i.nombre) === nombreIngresado &&
    i.email.toLowerCase().trim() === emailIngresado
  );

  if (invitado) {
    invitado.asistio = true;
    guardarInvitados(invitados);
    res.send('<h1>Invitado encontrado, asistí al evento ✅</h1>');
  } else {
    res.send('<h1>Invitado no encontrado ❌</h1>');
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
