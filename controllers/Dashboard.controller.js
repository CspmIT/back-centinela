const {
    getDashboard,
    saveDashboardLayout,
    addChartToDashboard,
    removeChartFromDashboard
  } = require('../services/DashboardService')
  
  const getUserDashboard = async (req, res) => {
    const { id = false } = req.user
    
    try {
  
      if (!id) {
        return res.status(401).json('Tenes que estar logeado')
      }
  
      const dashboard = await getDashboard(id, req.db)
  
      return res.status(200).json(dashboard)
  
    } catch (error) {
  
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
  
    }
  }
  
  const saveLayout = async (req, res) => {
    const { id = false } = req.user
  
    try {
  
      if (!id) {
        return res.status(401).json('Tenes que estar logeado')
      }
  
      const result = await saveDashboardLayout(id, req.body.layouts, req.db)
  
      return res.status(200).json(result)
  
    } catch (error) {
  
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
  
    }
  }
  
  const addChart = async (req, res) => {
    const { id = false } = req.user
  
    try {
  
      if (!id) {
        return res.status(401).json('Tenes que estar logeado')
      }
  
      const { chartId } = req.body
  
      const result = await addChartToDashboard({
        userId: id,
        chartId: chartId,
        db: req.db
      })
  
      return res.status(200).json(result)
  
    } catch (error) {
  
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
  
    }
  }
  
  const removeChart = async (req, res) => {
    const { id = false } = req.user
  
    try {
  
      if (!id) {
        return res.status(401).json('Tenes que estar logeado')
      }
  
      const { chart_id } = req.body
  
      const result = await removeChartFromDashboard({
        userId: id,
        chartId: chart_id,
        db: req.db
      })
  
      return res.status(200).json(result)
  
    } catch (error) {
  
      if (error.errors) {
        res.status(500).json(error.errors)
      } else {
        res.status(400).json(error.message)
      }
  
    }
  }
  
  // Helper para evitar repetir la validación en cada controller
  const getTargetUserId = (req, res) => {
    const targetUserId = req.params.userId ?? req.body.userId
  
    if (!targetUserId) {
      res.status(400).json('Falta identificar el usuario target')
      return null
    }
  
    return targetUserId
  }
  
  const adminGetUserDashboard = async (req, res) => {
    try {
      const targetUserId = getTargetUserId(req, res)
      if (!targetUserId) return
  
      const dashboard = await getDashboard(targetUserId, req.db)
  
      return res.status(200).json(dashboard)
  
    } catch (error) {
      error.errors
        ? res.status(500).json(error.errors)
        : res.status(400).json(error.message)
    }
  }
  
  const adminGetUsers = async (req, res) => {
    try {
  
      const users = await req.db.User.findAll({
        attributes: ['id', 'first_name', 'last_name', 'profile', 'email' ],
        include: [{
          association: 'DashboardLayouts',
          where: { visible: true },
          required: false,          
          attributes: ['id']
        }],
        order: [['last_name', 'ASC']]
      })
  
      const result = users.map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`.trim(), 
        email: u.email,
        widgetCount: u.DashboardLayouts?.length ?? 0
      }))
  
      return res.status(200).json(result)
  
    } catch (error) {
      error.errors
        ? res.status(500).json(error.errors)
        : res.status(400).json(error.message)
    }
  }
  
  const adminSaveLayout = async (req, res) => {
    try {
      const targetUserId = getTargetUserId(req, res)
      if (!targetUserId) return
  
      const result = await saveDashboardLayout(targetUserId, req.body.layouts, req.db)
  
      return res.status(200).json(result)
  
    } catch (error) {
      error.errors
        ? res.status(500).json(error.errors)
        : res.status(400).json(error.message)
    }
  }
  
  const adminAddChart = async (req, res) => {
    try {
      const targetUserId = getTargetUserId(req, res)
      if (!targetUserId) return
  
      const { chartId } = req.body
  
      const result = await addChartToDashboard({
        userId: targetUserId,
        chartId,
        db: req.db
      })
  
      return res.status(200).json(result)
  
    } catch (error) {
      error.errors
        ? res.status(500).json(error.errors)
        : res.status(400).json(error.message)
    }
  }
  
  const adminRemoveChart = async (req, res) => {
    try {
      const targetUserId = getTargetUserId(req, res)
      if (!targetUserId) return
  
      const { chart_id } = req.body
  
      const result = await removeChartFromDashboard({
        userId: targetUserId,
        chartId: chart_id,
        db: req.db
      })
  
      return res.status(200).json(result)
  
    } catch (error) {
      error.errors
        ? res.status(500).json(error.errors)
        : res.status(400).json(error.message)
    }
  }
  
  const assignChartToUser = async (req, res) => {
    try {
        const { user_id, chart_id } = req.body
        if (!user_id || !chart_id) throw new Error('user_id y chart_id son requeridos')
  
        const layout = await addChartToDashboard({
            userId: user_id,
            chartId: chart_id,
            db: req.db
        })
        res.status(201).json(layout)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
  }
  
  const unassignChartFromUser = async (req, res) => {
    try {
        const { user_id, chart_id } = req.body
        await req.db.UserDashboardLayout.destroy({ where: { user_id, chart_id } })
        res.status(200).json({ ok: true })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
  }
  
  const getUsersByChart = async (req, res) => {
    try {
        const { chartId } = req.params
        const assignments = await req.db.UserDashboardLayout.findAll({
            where: { chart_id: chartId },
            attributes: ['user_id'],
        })
        const assignedIds = assignments.map(a => a.user_id)
        res.status(200).json(assignedIds)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
  }
  
  module.exports = {
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
  }