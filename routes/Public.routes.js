const express = require('express')
const { db } = require('../models')
const router = express.Router()
const { publicCheckAlarms } = require('../controllers/Alarms.controller')

// router.get('/interruptions', interruptions)
router.get('/test', async (req, res) => {
	db.sequelize
		.authenticate()
		.then(() => {
			res.json('conexion exitosa')
		})
		.catch((err) => {
			return res.status(401).json({ err: err.stack })
		})
})
router.get('/public_CheckAlarms', publicCheckAlarms)



module.exports = router
