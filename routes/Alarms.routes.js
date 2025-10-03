const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { 
    getAlarms,
    addAlarms,
    editAlarm,
    toggleAlarmStatus
 } = require('../controllers/Alarms.controller')
const router = express.Router()

router.get('/getAlarms', verifyToken, getAlarms)
router.post('/createAlarm', verifyToken, addAlarms)
router.put('/updateAlarm/:id', verifyToken, editAlarm)
router.put('/changeStatusAlarm', verifyToken, toggleAlarmStatus)

module.exports = router
