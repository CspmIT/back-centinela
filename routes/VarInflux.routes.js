const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const {
    saveVariable,
    listVariables,
    getVar,
} = require('../controllers/Variable-Influx.controller')

const router = express.Router()

router.post('/saveVariable', verifyToken, saveVariable)
router.get('/getVarsInflux', verifyToken, listVariables)
router.get('/getVar/:id', verifyToken, getVar)

module.exports = router
