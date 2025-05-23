
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const invitadosPath = path.join(__dirname, 'invitados.json');
let invitados = require(invitadosPath);

// Ruta principal para formulario de check-in
app.get('/', (req, res) => {
  res.render('checkin', { error: null });
});

// Ruta para procesar el check-in
app.post('/checkin', (req, res) => {
  const { nombre, cedula, email } = req.body;
  const nombreNormalizado = nombre.trim().toLowerCase();
  const cedulaNormalizada = cedula.trim();

  const invitado = invitados.find(inv =>
    inv.nombre.trim().toLowerCase() === nombreNormalizado &&
    inv.cedula === cedulaNormalizada
  );

  if (invitado) {
    invitado.asistio = true;
    invitado.email = email;

    fs.writeFileSync(invitadosPath, JSON.stringify(invitados, null, 2));
    res.render('checkin', { error: null, exito: true });
  } else {
    res.render('checkin', { error: 'Invitado no encontrado.', exito: false });
  }
});

// Ruta para ver la lista de invitados
app.get('/lista', (req, res) => {
  res.render('index', { invitados });
});

// Puerto dinámico para Render o 3000 local
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
