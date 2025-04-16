const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/Auth.middleware')
const {
    createPLCProfile,
    searchAllPLC,
    searchById,
    deleteFilePLC,
} = require('../controllers/PlcGenerator.controller')

router.get('/list', verifyToken, searchAllPLC)
router.get('/status/:id', verifyToken, searchById)
router.get('/delete/:id', verifyToken, deleteFilePLC)
router.post('/create', verifyToken, createPLCProfile)

module.exports = router
