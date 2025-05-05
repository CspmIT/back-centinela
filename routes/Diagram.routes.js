const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { saveDiagram, getDiagrams, getObjectCanva } = require('../controllers/Diagram.controller')

const router = express.Router()

router.post('/saveDiagram', verifyToken, saveDiagram)
router.get('/getDiagrams', verifyToken, getDiagrams)
router.get('/getObjectCanva', verifyToken, getObjectCanva)

module.exports = router
