const { ApolloServer, gql } = require('apollo-server')
const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' })

//crear firma jwt
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email } = usuario
  return jwt.sign({ id, email }, secreta, { expiresIn })
}

const resolvers = {
  Query: {},
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
    nuevoProyecto: async (_, { input }) => {
      try {
        const proyecto = new Proyecto(input)
        const resultado = await proyecto.save()
        return resultado
      } catch (error) {
        console.log(error)
      }
      console.log('creando proyecto')
    },
  },
}

module.exports = resolvers
