const routes = require('express').Router()
const {
    addSeriesChart,
    updateSeriesChart,
} = require('../controllers/ChartSeries.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/chartSeries', verifyToken, addSeriesChart)
routes.post('/chartSeries/:id', verifyToken, updateSeriesChart)

module.exports = routes
