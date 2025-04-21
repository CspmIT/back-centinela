const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/Auth.middleware')
const {
    createPLCProfile,
    searchAllPLC,
    searchById,
    deleteFilePLC,
    deactivatePLCProfile,
    activatePLCProfile,
    editPLCProfile,
} = require('../controllers/PlcGenerator.controller')

router.get('/service/:id', verifyToken, searchById)
router.get('/list', verifyToken, searchAllPLC)
router.get('/delete/:id', verifyToken, deleteFilePLC)
router.get('/deactivate/:id', verifyToken, deactivatePLCProfile)
router.get('/activate/:id', verifyToken, activatePLCProfile)

router.post('/create', verifyToken, createPLCProfile)
router.post('/edit', verifyToken, editPLCProfile)

module.exports = router
