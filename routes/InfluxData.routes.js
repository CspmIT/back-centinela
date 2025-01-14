const express = require('express')
const router = express.Router()
const {
    InfluxConection,
    InfluxChart,
} = require('../controllers/Influx.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

// router.get('/', InfluxConection)
router.post('/dataInflux', verifyToken, InfluxChart)

module.exports = router
