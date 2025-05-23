
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const DATA_FILE = path.join(__dirname, 'invitados.json');

// Leer archivo de invitados
function leerInvitados() {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Guardar archivo de invitados
function guardarInvitados(invitados) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(invitados, null, 2), 'utf-8');
}

// Normalizar texto (sin tildes, todo en minúscula)
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
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

// Formulario de check-in
app.get('/checkin', (req, res) => {
  res.render('checkin', { error: null });
});

// Procesar formulario
app.post('/checkin', (req, res) => {
  const { nombre, cedula, email } = req.body;
  const invitados = leerInvitados();

  const normalizadoNombre = normalizarTexto(nombre);
  const cedulaInput = cedula.trim();

  const invitado = invitados.find(i => 
    normalizarTexto(i.nombre) === normalizadoNombre &&
    i.cedula === cedulaInput
  );

  if (invitado) {
    invitado.asistio = true;
    invitado.email = email;
    guardarInvitados(invitados);
    res.send('<h1>Invitado confirmado. ¡Gracias por asistir!</h1><a href="/">Volver al listado</a>');
  } else {
    res.render('checkin', { error: "Invitado no encontrado. Verificá nombre y cédula." });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
