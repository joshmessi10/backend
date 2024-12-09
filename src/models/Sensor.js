const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SensorSchema = new Schema({
    id_billetera: { 
        type: Schema.Types.ObjectId,
        ref: "Billetera", 
        required: true 
    },
    tipo_sensor: { 
        type: String, 
        enum: ["acelerometro", "magnetico", "bateria", "bluetooth"], 
        required: true 
    }, 
    estado_sensor: { 
        type: Boolean, 
        default: true, 
    },
    lectura_sensor: { 
        type: Number, 
        required: true 
    },        
    ultima_lectura: { 
        type: Date, 
        default: Date.now 
    }
});


module.exports = mongoose.model("Sensor", SensorSchema);