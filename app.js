const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const invitadosPath = path.join(__dirname, "invitados.json");

function cargarInvitados() {
  const data = fs.readFileSync(invitadosPath);
  return JSON.parse(data);
}

function guardarInvitados(invitados) {
  fs.writeFileSync(invitadosPath, JSON.stringify(invitados, null, 2));
}

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

app.get("/", (req, res) => {
  res.render("checkin", { error: null, exito: null });
});

app.post("/checkin", (req, res) => {
  const { nombre, cedula, email } = req.body;
  const invitados = cargarInvitados();
  const nombreNormalizado = normalizarTexto(nombre);

  const invitado = invitados.find(
    (inv) =>
      normalizarTexto(inv.nombre) === nombreNormalizado &&
      inv.cedula === cedula
  );

  if (!invitado) {
    return res.render("checkin", {
      error: "Invitado no encontrado. Verifica los datos.",
      exito: null,
    });
  }

  invitado.asistio = true;
  invitado.email = email;
  guardarInvitados(invitados);

  res.render("checkin", {
    error: null,
    exito: "Asistencia confirmada para " + invitado.nombre,
  });
});

app.get("/lista", (req, res) => {
  const invitados = cargarInvitados();
  res.render("index", { invitados });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor iniciado en http://localhost:" + PORT);
});
