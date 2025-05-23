const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let invitados = require('./invitados.json');

const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

app.get('/', (req, res) => {
  const { error, confirmado } = req.query;
  res.render('checkin', { error, confirmado });
});

app.post('/checkin', (req, res) => {
  const { nombre, cedula, email } = req.body;

  const nombreNormalizado = normalizar(nombre);
  const cedulaLimpia = cedula.trim();

  let encontrado = false;

  for (let invitado of invitados) {
    const invitadoNombre = normalizar(invitado.nombre);
    const invitadoCedula = invitado.cedula.trim();

    if (invitadoNombre === nombreNormalizado && invitadoCedula === cedulaLimpia) {
      invitado.asistio = true;
      invitado.email = email;
      encontrado = true;
      break;
    }
  }

  if (encontrado) {
    fs.writeFileSync('invitados.json', JSON.stringify(invitados, null, 2));
    res.redirect('/?confirmado=true');
  } else {
    res.redirect('/?error=1');
  }
});

app.get('/lista', (req, res) => {
  res.render('index', { invitados });
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
