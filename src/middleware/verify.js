const User = require("../models/Usuario.js");
const jwt = require("jsonwebtoken");
const { SECRET_ACCESS_TOKEN } = require("../config/index.js");
const Blacklist = require("../models/Blacklist.js");
const cookieParser = require("cookie-parser");

async function Verify(req, res, next) {
  try {
    // Asegúrate de que cookie-parser está siendo utilizado en tu app.js
    // app.use(cookieParser());  <- Esto debe estar en tu archivo principal para usar req.cookies

    // Obtenemos la cookie "SessionID" de la solicitud
    const token = req.cookies.SessionID;

    if (!token) {
      return res.status(401).json({ message: "No token found. Please login." });
    }

    // Verificar si el token está en la lista negra
    const checkIfBlacklisted = await Blacklist.findOne({ token });
    if (checkIfBlacklisted) {
      return res
        .status(401)
        .json({ message: "This session has expired. Please login" });
    }

    // Verifica la validez del token
    const decoded = jwt.verify(token, SECRET_ACCESS_TOKEN);
    const { id } = decoded;

    // Buscar al usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Eliminamos la contraseña del objeto de usuario antes de pasarlo al siguiente middleware
    const { password, ...userData } = user._doc;
    req.user = userData; // Guardamos los datos del usuario en la solicitud

    next(); // Pasamos al siguiente middleware o controlador
  } catch (err) {
    // Manejo de errores en caso de que ocurra algún fallo en la validación del token
    console.error("Error en la verificación del token:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

module.exports = Verify;
