require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const md5 = require('md5');
const cookieParser = require('cookie-parser');
const { PORT, URI } = require('./config/index.js');
const Router = require('./routes/index.js');
const Blacklist = require('./models/Blacklist.js');
const Verify = require('./middleware/verify.js');
const { body, validationResult } = require('express-validator');





const app = express();

app.use(express.json());

app.use(cors());
app.disable("x-powered-by"); //Reduce fingerprinting
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));



const connection = "mongodb+srv://testDatabaseDP2:testDatabasePW@cluster0.1kkmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(connection, {
}).then(() => console.log("Conectado a Mongo"))
.catch(err => console.log(err));

Router(app);

const User = require('./models/Usuario');
const Billetera = require('./models/Billetera');
const Geolocalizacion = require('./models/Geolocalizacion');
const Sensor = require('./models/Sensor');
const Evento = require('./models/Evento');
const Conexion = require('./models/Conexion');
const Celular = require('./models/Celular'); 
const ConfiguracionUsuario = require('./models/ConfiguracionUsuario'); 
const Notificacion = require('./models/Notificacion'); // Importar modelo Notificacion
const Respaldo = require('./models/Respaldo'); // Importar modelo Respaldo
const HistorialBateria = require('./models/Bateria.js');
const RegistrosActividad = require('./models/Actividad');

app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a mi Backend #1</h1><p>La API está funcionando correctamente.</p>');
});

app.listen(3000, () => {
    console.log("Servidor escuchando por el puerto 3000");
});

// Endpoint para registrar un usuario


app.post('/register', [
    body('nombre_usuario').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('apellido_usuario').notEmpty().withMessage('El apellido de usuario es requerido'),
    body('email').isEmail().withMessage('Email no es válido').normalizeEmail(),
    body('password').notEmpty().isStrongPassword({ minLength: 10, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }).withMessage('La contraseña no es segura, debe tener al menos una mayúscula, minúscula, número y símbolo'),
    body('telefono')
        .notEmpty().withMessage('El teléfono es requerido')
        .isLength({ min: 10, max: 10 }).withMessage('El número de teléfono debe tener exactamente 10 dígitos')
        .isNumeric().withMessage('El teléfono debe contener solo números'),
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        const errorMessages = errores.array().map(error => {
            return {
                campo: error.param,
                mensaje: error.msg
            };
        });
        console.log("Errores de validación:", errorMessages);
        return res.status(400).json({ error: "Error de validación", detalles: errorMessages });
    }

    const { nombre_usuario, apellido_usuario, email, password, telefono } = req.body;
    const user = new User(req.body);

    try {
        const savedUser = await user.save();
        res.status(201).send({
            msg: "Usuario guardado en la base de datos",
            user: savedUser
        });
    } catch (err) {
        console.log("Error al guardar el usuario:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                detalles: err.message
            });
        }
        if (err.code === 11000) { 
            return res.status(409).send({
                error: "Duplicado",
                detalles: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el usuario",
            detalles: err.message
        });
    }
});

// Endpoint para login
app.post('/login', [
    body('email').isEmail().withMessage('Email no es válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = md5(password); // Mantener el hash md5 para la contraseña

    try {
        // Verificar si el usuario existe y seleccionar la contraseña
        const usuario = await User.findOne({ email });
        
        if (!usuario) {
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Credenciales incorrectas",
            });
        }

        if (usuario.bloqueado) {
            return res.status(403).json({
                status: "failed",
                data: [],
                message: "Usuario bloqueado. Contacte al administrador.",
            });
        }

        // Validar la contraseña
        if (usuario.password === hashedPassword) {
            // Reiniciar intentos fallidos
            usuario.intentos_fallidos = 0;
            await usuario.save();

            let options = {
                maxAge: 20 * 60 * 1000, // Expira en 20 minutos
                httpOnly: false, // La cookie solo es accesible por el servidor
                secure: false, // Usa 'true' solo en producción
                sameSite: "None",
            };

            const token = usuario.generateAccessJWT(); // Generar token de sesión para el usuario
            res.cookie("SessionID", token, options); // Establecer la cookie con el token
            console.log(token);
            return res.status(200).json({
                status: "success",
                message: "Inicio de sesión exitoso.",
            });
        } else {
            usuario.intentos_fallidos += 1;
            if (usuario.intentos_fallidos >= 5) {
                usuario.bloqueado = true;
            }
            await usuario.save(); // Guardar cambios en el usuario
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Credenciales incorrectas",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Error en el servidor: " + error.message,
        });
    }
});



app.get('/verify-session', Verify, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Sesión verificada con éxito',
    });
});

// Endpoint to get user data
app.get('/user-data', Verify, async (req, res) => {
    try {
        // Extract the user ID from the verified session (usually set during login or token creation)
        const userId = req.userId; // Assuming `Verify` middleware attaches the userId to the request object
        
        // Fetch user data from the database
        const usuario = await User.findById(userId).select('-password'); // Exclude password from the response

        if (!usuario) {
            return res.status(404).json({
                status: "failed",
                message: "Usuario no encontrado",
            });
        }

        // Return user data
        res.status(200).json({
            status: "success",
            data: {
                nombre_usuario: usuario.nombre_usuario,
                apellido_usuario: usuario.apellido_usuario,
                email: usuario.email,
                telefono: usuario.telefono,
                fecha_creacion: usuario.fecha_creacion,
                ultimo_acceso: usuario.ultimo_acceso,
                role: usuario.role
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error en el servidor: " + error.message,
        });
    }
});

app.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['cookie']; // Obtener la cookie de sesión del encabezado de la solicitud
        if (!authHeader) return res.status(401).json({ message: "Unauthorized" }); // Si no hay cookie, responde no autorizado
        
        const cookie = authHeader.split('=')[1]; // Si hay cookie, obtener el jwt dividiendo el string
        const accessToken = cookie.split(';')[0];
        
        // Verificar si el token está en la lista negra
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted) return res.status(204).send(); // Si ya está en la lista negra, no hay contenido

        // De lo contrario, añadir el token a la lista negra
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        
        // Limpiar la cookie en el cliente
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: err.message // Puedes incluir el mensaje de error aquí si es seguro
        });
    }
});
// Endpoint para crear una billetera
app.post('/billetera', [
    body('id_usuario').notEmpty().withMessage('id_usuario es requerido'),
    body('nombre_billetera').notEmpty().withMessage('nombre_billetera es requerido')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const billetera = new Billetera(req.body);

    try {
        const savedBilletera = await billetera.save();
        res.status(201).send({
            msg: "Billetera guardada en la base de datos",
            billetera: savedBilletera
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar la billetera",
            details: err.message
        });
    }
});

// Endpoint para crear un registro de geolocalización
app.post('/geolocalizacion', [
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('latitud').isNumeric().withMessage('La latitud debe ser un número'),
    body('longitud').isNumeric().withMessage('La longitud debe ser un número')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const geolocalizacion = new Geolocalizacion(req.body);

    try {
        const savedGeolocalizacion = await geolocalizacion.save();
        res.status(201).send({
            msg: "Geolocalización guardada en la base de datos",
            geolocalizacion: savedGeolocalizacion
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar la geolocalización",
            details: err.message
        });
    }
});

// Endpoint para crear un registro de sensor
app.post('/sensor', [
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('tipo_sensor').notEmpty().withMessage('tipo_sensor es requerido'),
    body('lectura_sensor').isNumeric().withMessage('lectura_sensor debe ser un número'),
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const sensor = new Sensor(req.body);

    try {
        const savedSensor = await sensor.save();
        res.status(201).send({
            msg: "Sensor guardado en la base de datos",
            sensor: savedSensor
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el sensor",
            details: err.message
        });
    }
});

// Endpoint para crear un evento
app.post('/evento', [
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('id_sensor').notEmpty().withMessage('id_sensor es requerido'),
    body('tipo_evento').isIn(['acceso_no_autorizado', 'caida_detectada', 'desconexion', 'null']).withMessage('tipo_evento es inválido'),
    body('nivel_bateria').isNumeric().withMessage('nivel_bateria debe ser un número'),
    body('id_geolocalizacion').notEmpty().withMessage('geolocalizacion es requerida')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const evento = new Evento(req.body);

    try {
        const savedEvento = await evento.save();
        res.status(201).send({
            msg: "Evento guardado en la base de datos",
            evento: savedEvento
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el evento",
            details: err.message
        });
    }
});

// Endpoint para crear un registro de conexión
app.post('/conexion', [
    body('tipo_conexion').isBoolean().withMessage('tipo_conexion debe ser un booleano (1 para conexión, 0 para desconexión)'),
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('nivel_bateria').isNumeric().withMessage('nivel_bateria debe ser un número'),
    body('distancia').optional().isNumeric().withMessage('distancia debe ser un número si se proporciona')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const conexion = new Conexion(req.body);

    try {
        const savedConexion = await conexion.save();
        res.status(201).send({
            msg: "Conexión guardada en la base de datos",
            conexion: savedConexion
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar la conexión",
            details: err.message
        });
    }
});

// Endpoint para crear un registro de celular
app.post('/celular', [
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('id_usuario').notEmpty().withMessage('id_usuario es requerido'),
    body('nombre_dispositivo').notEmpty().withMessage('nombre_dispositivo es requerido'),
    body('direccion_mac').notEmpty().withMessage('direccion_mac es requerida'),
    body('sistema_operativo').notEmpty().withMessage('sistema operativo es requerida')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const celular = new Celular(req.body);

    try {
        const savedCelular = await celular.save();
        res.status(201).send({
            msg: "Celular guardado en la base de datos",
            celular: savedCelular
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el celular",
            details: err.message
        });
    }
});


// Endpoint para crear una configuración de usuario
app.post('/configuracion', [
    body('id_usuario').notEmpty().withMessage('id_usuario es requerido'),
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido'),
    body('modo_alerta').optional().isIn(['silencio', 'vibración', 'sonido']).withMessage('modo_alerta debe ser "silencio", "vibración" o "sonido"'),
    body('umbral_sensibilidad_acl_g').optional().isNumeric().withMessage('umbral_sensibilidad_acl_g debe ser un número'),
    body('desbloqueo_remoto').optional().isBoolean().withMessage('desbloqueo_remoto debe ser un booleano'),
    body('alerta_sonora').optional().isBoolean().withMessage('alerta_sonora debe ser un booleano')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const configuracion = new ConfiguracionUsuario(req.body);

    try {
        const savedConfiguracion = await configuracion.save();
        res.status(201).send({
            msg: "Configuración de usuario guardada en la base de datos",
            configuracion: savedConfiguracion
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar la configuración de usuario",
            details: err.message
        });
    }
});

// Endpoint para crear una notificación
app.post('/notificacion', [
    body('id_usuario').notEmpty().withMessage('id_usuario es requerido'),
    body('tipo_notificacion').notEmpty().withMessage('tipo_notificacion es requerido'),
    body('contenido_notificacion').notEmpty().withMessage('contenido_notificacion es requerido'),
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const notificacion = new Notificacion(req.body);

    try {
        const savedNotificacion = await notificacion.save();
        res.status(201).send({
            msg: "Notificación guardada en la base de datos",
            notificacion: savedNotificacion
        });
    } catch (err) {
        console.log(err);
        
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        
        res.status(500).send({
            error: "Error al guardar la notificación",
            details: err.message
        });
    }
});

// Endpoint para crear un respaldo
app.post('/respaldo', [
    body('tamaño_respaldo').isNumeric().withMessage('tamaño_respaldo debe ser un número'),
    body('estado_respaldo').isBoolean().withMessage('estado_respaldo debe ser un booleano'),
    body('version_datos').notEmpty().withMessage('version_datos es requerido'),
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const respaldo = new Respaldo(req.body);

    try {
        const savedRespaldo = await respaldo.save();
        res.status(201).send({
            msg: "Respaldo guardado en la base de datos",
            respaldo: savedRespaldo
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el respaldo",
            details: err.message
        });
    }
});

app.post('/historial-bateria', [
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido').isMongoId().withMessage('id_billetera debe ser un ObjectId válido'),
    body('nivel_bateria').isNumeric().withMessage('nivel_bateria debe ser un número'),
    body('estado_cargando').isBoolean().withMessage('estado_cargando debe ser un booleano')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const historialBateria = new HistorialBateria(req.body);

    try {
        const savedHistorial = await historialBateria.save();
        res.status(201).send({
            msg: "Historial de batería guardado en la base de datos",
            historial: savedHistorial
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el historial de batería",
            details: err.message
        });
    }
});

app.post('/registro-actividad', [
    body('id_usuario').notEmpty().withMessage('id_usuario es requerido').isMongoId().withMessage('id_usuario debe ser un ObjectId válido'),
    body('id_billetera').notEmpty().withMessage('id_billetera es requerido').isMongoId().withMessage('id_billetera debe ser un ObjectId válido'),
    body('accion').isBoolean().withMessage('accion debe ser un booleano')
], async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const registroActividad = new RegistrosActividad(req.body);

    try {
        const savedRegistro = await registroActividad.save();
        res.status(201).send({
            msg: "Registro de actividad guardado en la base de datos",
            registro: savedRegistro
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({
                error: "Error de validación",
                details: err.message
            });
        }
        if (err.code === 11000) { // Código de error para duplicados
            return res.status(409).send({
                error: "Duplicado",
                details: "El campo único ya existe"
            });
        }
        res.status(500).send({
            error: "Error al guardar el registro de actividad",
            details: err.message
        });
    }
});