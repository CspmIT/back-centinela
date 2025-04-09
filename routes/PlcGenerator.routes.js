const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/Auth.middleware')
const { createPLCProfile } = require('../controllers/PlcGenerator.controller')

router.post('/create', verifyToken, createPLCProfile)

module.exports = router
