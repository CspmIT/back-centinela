const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { saveDiagram, getDiagrams, getObjectCanva, changeStatusDiagram } = require('../controllers/Diagram.controller')

const router = express.Router()

router.post('/saveDiagram', verifyToken, saveDiagram)
router.get('/getDiagrams', verifyToken, getDiagrams)
router.get('/getObjectCanva', verifyToken, getObjectCanva)
router.put('/changeStatusDiagram', verifyToken, changeStatusDiagram)

module.exports = router
