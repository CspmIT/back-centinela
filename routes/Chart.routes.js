const routes = require('express').Router()
const {
    findCharts,
    createChart,
    findAllCharts,
    statusChart,
} = require('../controllers/Charts.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.get('/charts', verifyToken, findCharts)
routes.get('/allCharts', verifyToken, findAllCharts)
routes.post('/charts', verifyToken, createChart)
routes.post('/charts/status', verifyToken, statusChart)

module.exports = routes
