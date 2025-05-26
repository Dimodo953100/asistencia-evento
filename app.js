const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // <== Asegurate de tener axios instalado: npm install axios
const app = express();

const PORT = process.env.PORT || 3000;
const invitadosPath = path.join(__dirname, "invitados.json");

// Cambiá esta URL por la tuya si llegara a cambiar
const GOOGLE_SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbw2Sk6TCMFeVhPVXnPYfukKU2XNYGbrSVgO8WKGxBEraFW1a3zDtebBqOWQIZoiD-6Irw/exec";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Función para normalizar texto
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Cargar y guardar invitados
function cargarInvitados() {
  return JSON.parse(fs.readFileSync(invitadosPath, "utf-8"));
}

function guardarInvitados(data) {
  fs.writeFileSync(invitadosPath, JSON.stringify(data, null, 2));
}

// Redirige al checkin
app.get("/", (req, res) => {
  res.redirect("/checkin");
});

// Mostrar formulario
app.get("/checkin", (req, res) => {
  res.render("checkin", { error: null, exito: null });
});

// Procesar formulario
app.post("/checkin", async (req, res) => {
  const { nombre, cedula, email } = req.body;
  const nombreNormalizado = normalizar(nombre);
  const invitados = cargarInvitados();

  const invitado = invitados.find(inv =>
    normalizar(inv.nombre) === nombreNormalizado &&
    inv.cedula.trim() === cedula.trim()
  );

  if (invitado) {
    invitado.asistio = true;
    invitado.email = email;
    guardarInvitados(invitados);

    // Enviar a Google Sheets
    try {
      await axios.post(GOOGLE_SHEET_WEBHOOK, {
        nombre: invitado.nombre,
        cedula: invitado.cedula,
        email: email,
        asistio: "Sí"
      });
    } catch (error) {
      console.error("Error enviando a Google Sheets:", error.message);
    }

    res.render("checkin", {
      error: null,
      exito: `Asistencia confirmada para ${invitado.nombre}`
    });
  } else {
    res.render("checkin", {
      error: "Invitado no encontrado. Verificá nombre y cédula.",
      exito: null
    });
  }
});

// Ver lista de invitados
app.get("/lista", (req, res) => {
  const invitados = cargarInvitados();
  res.render("index", { invitados });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
