const express = require('express')
const { saveConfigTable, getColumnsUserTable } = require('../controllers/ConfigUser.controller')
const { verifyToken } = require('../middleware/Auth.middleware')
const {
	getListUser,
	getAllMenu,
	abmMenu,
	deleteMenu,
	getPermission,
	savePermission,
	getProfiles,
} = require('../controllers/User.controller')
const router = express.Router()

router.post('/saveConfigTable', verifyToken, saveConfigTable)
router.post('/getColumnsTable', verifyToken, getColumnsUserTable)
router.get('/listUsers', verifyToken, getListUser)
router.get('/listProfiles', verifyToken, getProfiles)

router.get('/getAllMenu', verifyToken, getAllMenu)
router.post('/saveMenu', verifyToken, abmMenu)
router.post('/deleteMenu', verifyToken, deleteMenu)

router.get('/getPermission', verifyToken, getPermission)
router.post('/savePermission', verifyToken, savePermission)

module.exports = router
