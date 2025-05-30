const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let sugerencias = [];

wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  // Enviar las últimas sugerencias al conectar
  ws.send(JSON.stringify({ type: "init", data: sugerencias }));
});

app.post("/nuevo", (req, res) => {
  const sugerencia = req.body;
  sugerencias.push(sugerencia);
  if (sugerencias.length > 5) {
    sugerencias = sugerencias.slice(-5);
  }

  // Enviar a todos los clientes conectados
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "nueva", data: sugerencia }));
    }
  });

  res.status(200).send({ message: "Sugerencia recibida y enviada por WebSocket" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket corriendo en puerto ${PORT}`);
});
