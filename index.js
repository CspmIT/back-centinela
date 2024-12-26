require('dotenv').config()
const express = require('express')
const app = express()
// const http = require('http')
// const socketConfig = require('./config/socket')
const cookieParser = require('cookie-parser')

// Rutas
const publicRoutes = require('./routes/Public.routes')
const AuthRoutes = require('./routes/Auth.routes')
const UserRoutes = require('./routes/User.routes')
const DiagramRoutes = require('./routes/Diagram.routes')
// Configuracion para los cors
const corsConfig = require('./config/app.conf')
app.use(corsConfig)
app.use(cookieParser())

// Configuracion para el body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', publicRoutes)
app.use('/api', AuthRoutes)
app.use('/api', UserRoutes)
app.use('/api', DiagramRoutes)

// const server = http.createServer(app)
// app.use('/api', async (req, res, next) => {
// 	await socketConfig.init(server, req, res)
// 	next()
// })
app.listen(4000, () => {
	console.log('Server is running on port 4000')
	console.log('http://localhost:4000')
})
