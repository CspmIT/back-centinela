const {
  listAlarms,
  postAlarm,
  updateAlarm,
  changeStatusAlarm,
  alarmsChecked
} = require('../services/AlarmsService')

const { db } = require('../models')

const getAlarms = async (req, res) => {
  try {
    const Alarms = await listAlarms();
    return res.status(200).json(Alarms)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const addAlarms = async (req, res) => {
  try {
    const newAlarm = await postAlarm(req.body);
    return res.status(200).json(newAlarm)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const editAlarm = async (req, res) => {
  try {
    const { id } = req.params
    const updatedAlarm = await updateAlarm(id, req.body)
    return res.status(200).json(updatedAlarm)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const toggleAlarmStatus = async (req, res) => {
  try {
    const { id } = req.body
    const { status } = req.body

    const updatedAlarm = await changeStatusAlarm(id, status)
    return res.status(200).json(updatedAlarm)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const checkAlarms = async (req, res) => {
  try {
    const { user = false } = req
    const alarmsCheck = await alarmsChecked(user)
    return res.status(200).json(alarmsCheck)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

// 🔒 versión pública, con validación por secret o por influx_name
const publicCheckAlarms = async (req, res) => {
  try {
    const { secret, influx_name } = req.query

    // Validar secret simple
    if (!secret || secret !== process.env.ALARMS_SECRET_KEY) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (!influx_name) {
      return res.status(400).json({ error: 'Missing influx_name parameter' })
    }
   

    const user = { influx_name }
    const result = await alarmsChecked(user)

    return res.status(200).json({ result })
  } catch (err) {
    console.error('Error en publicCheckAlarms:', err)
    return res.status(500).json({ error: err.message })
  }
}


module.exports = {
  getAlarms,
  addAlarms,
  editAlarm,
  toggleAlarmStatus,
  checkAlarms,
  publicCheckAlarms
}