const { ApolloServer, gql } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
require('dotenv').config('variables.env')

const conectarDB = require('./config/db')
const jwt = require('jsonwebtoken')

//conectar a BD
conectarDB()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || ''
    if (token) {
      try {
        const usuario = jwt.verify(token, process.env.SECRETA)
        return {
          usuario,
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url ${url}`)
})
