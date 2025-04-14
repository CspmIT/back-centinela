const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/Auth.middleware')
const {
    createPLCProfile,
    searchAllPLC,
} = require('../controllers/PlcGenerator.controller')

router.get('/list', verifyToken, searchAllPLC)
router.post('/create', verifyToken, createPLCProfile)

module.exports = router
