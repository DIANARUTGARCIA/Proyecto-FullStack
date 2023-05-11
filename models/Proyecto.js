const moongoose = require('mongoose')

const ProyectoShema = new moongoose.Schema({
    nombre:{
      type: String,
      required: true,
      trim: true,
    },
    creador:{
      type: moongoose.Schema.Types.ObjectId,
      ref:'Usuario'
    },
    creado:{
      type: Date,
      default: Date.now()
    }
})

module.exports = moongoose.model('Proyecto',ProyectoShema)