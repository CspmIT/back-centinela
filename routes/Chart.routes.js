const routes = require('express').Router()
const {
    findCharts,
    createChart,
    findAllCharts,
    statusChart,
    findChartById,
    editChart,
} = require('../controllers/Charts.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.get('/charts', verifyToken, findCharts)
routes.get('/charts/:id', verifyToken, findChartById)
routes.get('/allCharts', verifyToken, findAllCharts)
routes.post('/charts', verifyToken, createChart)
routes.post('/charts/:id', verifyToken, editChart)
routes.post('/charts/status', verifyToken, statusChart)

module.exports = routes
