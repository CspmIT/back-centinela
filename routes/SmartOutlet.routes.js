const routes = require('express').Router()
const { create, edit, status, action } = require('../controllers/SmartOutlet.controller')
const { verifyToken } = require('../middleware/Auth.middleware')

routes.post('/smartoutlet', verifyToken, create)
routes.post('/smartoutlet/status', verifyToken, status)
routes.post('/smartoutlet/action', verifyToken, action)
routes.post('/smartoutlet/:id', verifyToken, edit)

module.exports = routes
