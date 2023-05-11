const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

//crear firma jwt
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre } = usuario
  return jwt.sign({ id, email, nombre }, secreta, { expiresIn })
}

const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.usuario.id })

      return proyectos
    },
  },
  Mutation: {
    crearUsuario: async (_, { input }) => {
      const { email, password } = input
      const existeUsuario = await Usuario.findOne({ email })
      //existe usaurio
      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado,baboso')
      }
      try {
        //enmascarar constraseña

        const salt = await bcryptjs.genSalt(10)
        input.password = await bcryptjs.hash(password, salt)

        const nuevoUsuario = new Usuario(input)
        nuevoUsuario.save()
        return 'Usuario creado correctamente'
      } catch (error) {
        console(error)
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input
      //existe usuurio
      const existeUsuario = await Usuario.findOne({ email })
      if (!existeUsuario) {
        throw new Error('El usuario no existe')
      }
      //contraseña correcta
      const passwordCorrecta = await bcryptjs.compare(
        password,
        existeUsuario.password,
      )
      if (!passwordCorrecta) {
        throw new Error('Contraseña Incorrecta')
      }
      //acceso
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '2hr'),
      }
    },
    nuevoProyecto: async (_, { input }, ctx) => {
      try {
        const proyecto = new Proyecto(input)

        // asociar el creador
        proyecto.creador = ctx.usuario.id

        // almacenarlo en la BD
        const resultado = await proyecto.save()

        return resultado
      } catch (error) {
        console.log(error)
      }
    },
    actualizarProyecto: async (_, { id, input }, ctx) => {
      // Revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id)
      if (!proyecto) {
        throw new Error('Proyecto no encontrado')
      }
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar')
      }
      // Guardar proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      })
      return proyecto
    },
    eliminarProyecto: async (_, { id }, ctx) => {
      // Revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id)
      if (!proyecto) {
        throw new Error('Proyecto no encontrado')
      }
      // Revisar que si la persona que edita es el
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar')
      }
      // Eliminar proyecto
      await Proyecto.findOneAndDelete({ _id: id })
      return 'Proyecto Eliminado'
    },
  },
}

module.exports = resolvers
