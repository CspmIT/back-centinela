const jwt = require('jsonwebtoken')
const { getTenantDb } = require('../models')
const { getUser } = require('../services/AuthService')
const secret = process.env.SECRET

const verifyToken = async (req, res, next) => {
	try {
		const token = req.cookies.token || req.headers?.authorization?.slice(7)
		if (!token) throw new Error('No se ha enviado el token')

		const decoded = jwt.verify(token, secret)

		const schema = decoded.iss.substring(4)
		// Cargar db del tenant
		req.db = await getTenantDb(schema)
		const user = await getUser(req.db, decoded.sub)

		if (!user) throw new Error('El usuario no existe')

		req.user = {
			id: user.id,
			influx_name: decoded.influx_name,
			name_coop: decoded.nameApp,
		}

		next()
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
}

module.exports = { verifyToken }
