const { ApolloServer, gql } = require('apollo-server')
const Usuario = require('../models/Usuario')
const bcryptjs = require('bcryptjs')

const resolvers = {
  Query: {},
  Mutation: {
    crearUsuario: async (_, { input }, ctx) => {
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
    autenticarUsuario: async (_, { input }, ctx) => {
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
      return "Haz iniciado sesión"
    },
  },
}

module.exports = resolvers
