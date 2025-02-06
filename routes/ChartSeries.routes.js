const routes = require('express').Router()
const { addSeriesChart } = require('../controllers/ChartSeries.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/chartSeries', verifyToken, addSeriesChart)

module.exports = routes
