const routes = require('express').Router()
const {
    findIndicatorCharts,
    createChart,
    findAllCharts,
    statusChart,
    findChartById,
    editChart,
    findDashboardCharts,
    findBoards,
    findChartByUser,
    getProfilesByChart,
    setProfilesByChart
} = require('../controllers/Charts.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.get('/indicatorCharts', verifyToken, findIndicatorCharts)
routes.get('/dashboardCharts', verifyToken, findDashboardCharts)
routes.get('/charts/:id', verifyToken, findChartById)
routes.get('/allCharts', verifyToken, findAllCharts)
routes.post('/charts', verifyToken, createChart)
routes.post('/charts/:id', verifyToken, editChart)
routes.put('/charts/status', verifyToken, statusChart)
routes.get('/boards', verifyToken, findBoards)
routes.get('/chartbyuser/:userId', verifyToken, findChartByUser)
routes.get('/charts/:chartId/profiles', verifyToken, getProfilesByChart)
routes.put('/charts/:chartId/profiles', verifyToken, setProfilesByChart)

module.exports = routes
