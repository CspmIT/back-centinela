const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const {
    listBombsPLC,
    getBombeoStatus,
    addBombs_PLC,
    executeBomb,
} = require('../controllers/Bombs_PLC.controller')
const router = express.Router()

router.get('/bombs_PLC', verifyToken, listBombsPLC)
router.get('/data_bombeo', verifyToken, getBombeoStatus)
router.post('/addBombs_PLC', verifyToken, addBombs_PLC)
router.post('/bombs_PLC/execute', verifyToken, executeBomb);



module.exports = router
