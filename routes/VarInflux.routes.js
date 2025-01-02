const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { saveVariable, listVariables } = require('../controllers/Variable-Influx.controller')

const router = express.Router()

router.post('/saveVariable', verifyToken, saveVariable)
router.get('/getVarsInflux', verifyToken, listVariables)

module.exports = router
