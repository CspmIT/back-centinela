const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { 
    getAlarms,
    addAlarms,
    editAlarm,
    toggleAlarmStatus,
    checkAlarms,
    getLog_Alarms,
    markAlertAsViewed,
    getUnreadAlertCount,
    getLog_Cronjob
 } = require('../controllers/Alarms.controller')
const router = express.Router()

router.get('/getAlarms', verifyToken, getAlarms)
router.post('/createAlarm', verifyToken, addAlarms)
router.put('/updateAlarm/:id', verifyToken, editAlarm)
router.put('/changeStatusAlarm', verifyToken, toggleAlarmStatus)
router.get('/checkAlarms', verifyToken, checkAlarms)

router.get('/listAlerts', verifyToken, getLog_Alarms)
router.get('/listLogs', verifyToken, getLog_Cronjob)
router.put('/alerts/allviewed/', verifyToken, markAlertAsViewed)
router.put('/alerts/viewed/:id', verifyToken, markAlertAsViewed)
router.get('/alerts/unread-count', verifyToken, getUnreadAlertCount)


module.exports = router
