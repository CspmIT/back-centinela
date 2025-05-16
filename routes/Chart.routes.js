const routes = require('express').Router()
const {
    findIndicatorCharts,
    createChart,
    findAllCharts,
    statusChart,
    findChartById,
    editChart,
    findDashboardCharts,
} = require('../controllers/Charts.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.get('/indicatorCharts', verifyToken, findIndicatorCharts)
routes.get('/dashboardCharts', verifyToken, findDashboardCharts)
routes.get('/charts/:id', verifyToken, findChartById)
routes.get('/allCharts', verifyToken, findAllCharts)
routes.post('/charts', verifyToken, createChart)
routes.post('/charts/:id', verifyToken, editChart)
routes.put('/charts/status', verifyToken, statusChart)

module.exports = routes
