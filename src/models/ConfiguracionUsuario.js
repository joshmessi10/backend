const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfiguracionUsuarioSchema = new Schema({
    id_usuario: { 
        type: Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: 'Billetera', 
        required: true 
    },
    modo_alerta: { 
        type: String, 
        enum: ['silencio','vibración', 'sonido'], 
        default: 'sonido' 
    },
    umbral_sensibilidad_acl_g: { 
        type: Number, 
        default: 4 
    },
    desbloqueo_remoto: { 
        type: Boolean, 
        default: false 
    },
    alerta_sonora: { 
        type: Boolean, 
        default: false 
    },
    notificaciones_activas: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ConfiguracionUsuario', ConfiguracionUsuarioSchema);
