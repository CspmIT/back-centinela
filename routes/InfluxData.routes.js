const express = require('express')
const router = express.Router()
const {
    InfluxConection,
    InfluxChart,
    SeriesDataInflux,
} = require('../controllers/Influx.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

// router.get('/', InfluxConection)
router.post('/dataInflux', verifyToken, InfluxChart)
router.post('/seriesDataInflux', verifyToken, SeriesDataInflux)

module.exports = router
