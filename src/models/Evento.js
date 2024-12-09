const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventoSchema = new Schema({
    id_billetera: { 
        type: Schema.Types.ObjectId, 
        ref: "Billetera", 
        required: true 
    },
    tipo_evento: { 
        type: String, 
        enum: ["billetera_abierta", "caida_detectada", "movimiento_brusco", "bateria_baja", "desconexion", "null"], 
        default: "null", 
        required: true 
    },
    fecha_hora: { 
        type: Date, 
        default: Date.now 
    },
    ubicacion: { 
        type: Schema.Types.ObjectId, 
        ref: "Geolocalizacion", 
        required: false 
    },
});


module.exports = mongoose.model("Evento", EventoSchema);
