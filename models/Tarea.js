const moongoose = require('mongoose')

const TareaShema = new moongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  creador: {
    type: moongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  proyecto: {
    type: moongoose.Schema.Types.ObjectId,
    ref: 'Proyecto',
  },
  estado: {
    type: Boolean,
    default: false,
  },
})

module.exports = moongoose.model('Tarea', TareaShema)
