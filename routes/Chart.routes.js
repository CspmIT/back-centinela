const routes = require('express').Router()
const {
    findAllCharts,
    createChart,
} = require('../controllers/Charts.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.get('/charts', verifyToken, findAllCharts)
routes.post('/charts', verifyToken, createChart)

module.exports = routes
