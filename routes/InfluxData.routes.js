const express = require('express')
const router = express.Router()
const {
    InfluxConection,
    InfluxChart,
    SeriesDataInflux,
    getMultipleSimpleValues
} = require('../controllers/Influx.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

// router.get('/', InfluxConection)
router.post('/dataInflux', verifyToken, InfluxChart)
router.post('/seriesDataInflux', verifyToken, SeriesDataInflux)
router.post('/multipleDataInflux', verifyToken, getMultipleSimpleValues)

module.exports = router
