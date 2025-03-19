const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🚀 Configuração do CORS para produção
const allowedOrigins = [
  "http://localhost:5173", // Ambiente local
  "https://ayran-vieira-dev.vercel.app", // Frontend na Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Acesso bloqueado por CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ⚠️ Necessário para autenticação e cookies
}));

app.options('*', cors());

// Middleware para JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Erro ao conectar com o servidor de email:", error);
  } else {
    console.log("Servidor de email pronto para envio.");
  }
});

app.post("/form", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
  }

  const mailOptions = {
    from: `${email}`,
    to: "ayran.developer@gmail.com",
    subject: `Nova mensagem de ${name}`,
    text: `Você recebeu uma nova mensagem do formulário:
      Nome: ${name}
      Email: ${email}
      Whatsapp: ${phone}
      Mensagem: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Sua mensagem foi enviada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    res.status(500).json({ error: "Falha ao enviar o email." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
