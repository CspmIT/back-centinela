const express = require('express')
const { verifyToken } = require('../middleware/Auth.middleware')
const { verifySuperAdmin } = require('../middleware/SuperAdmin.middleware')
const {
  getUserDashboard,
  saveLayout,
  addChart,
  removeChart,
  adminGetUsers,
  adminGetUserDashboard,
  adminSaveLayout,
  adminAddChart,
  adminRemoveChart,
  assignChartToUser,
  unassignChartFromUser,
  getUsersByChart
} = require('../controllers/Dashboard.controller')

const router = express.Router()

router.get('/dashboard', verifyToken, getUserDashboard)
router.post('/dashboard/layout', verifyToken, saveLayout)
router.post('/dashboard/addChart', verifyToken, addChart)
router.post('/dashboard/removeChart', verifyToken, removeChart)

// Rutas para configuración de dashboard de usuarios (solo Super Admin)
router.get('/admin/users', verifyToken, verifySuperAdmin, adminGetUsers)
router.get('/admin/userDashboard/chart/:chartId', verifyToken, verifySuperAdmin, getUsersByChart)
router.get('/admin/dashboard/:userId', verifyToken, verifySuperAdmin, adminGetUserDashboard)
router.post('/admin/dashboard/layout', verifyToken, verifySuperAdmin, adminSaveLayout)
router.post('/admin/dashboard/addChart', verifyToken, verifySuperAdmin, adminAddChart)
router.post('/admin/dashboard/removeChart', verifyToken, verifySuperAdmin, adminRemoveChart)
router.post('/admin/userDashboard/assign', verifyToken, verifySuperAdmin, assignChartToUser)
router.delete('/admin/userDashboard/assign', verifyToken, verifySuperAdmin, unassignChartFromUser)

module.exports = router