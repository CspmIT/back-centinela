const routes = require('express').Router()
const { createPieChart } = require('../controllers/Pie.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/pie', verifyToken, createPieChart)

module.exports = routes
