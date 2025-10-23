const {
  listAlarms,
  postAlarm,
  updateAlarm,
  changeStatusAlarm,
  alarmsChecked,
  listLogs_Alarms,
  changeViewedAlarm
} = require('../services/AlarmsService')
const { createDbForSchema, db } = require('../models')
const { listClients, influxByClient } = require('../utils/js/clients')

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

const publicCheckAlarms = async (req, res) => {
  try {
    const { schemaName } = req.query

    let schemasToCheck = schemaName ? [schemaName] : listClients.map(client => `masagua_${client}`)

    const results = []

    for (const schema of schemasToCheck) {
      try {
        const clientKey = schema.replace('masagua_', '')
        const influx_name = influxByClient[clientKey] 

        if (!influx_name) {
          console.log(`No se encontró influx_name para el cliente ${clientKey}`)
          results.push({ schema, error: 'No se encontró influx_name para este cliente' })
          continue
        }

        const localDb = createDbForSchema(schema)
        const user = { influx_name, db: localDb }
        const result = await alarmsChecked(user)

        results.push({ schema, result })
      } catch (err) {
        console.error(`Error revisando alarmas en ${schema}:`, err)
        results.push({ schema, error: err.message })
      }
    }

    return res.json({ results })
  } catch (err) {
    console.error('Error general en publicCheckAlarms:', err)
    return res.status(500).json({ error: err.message })
  }
}


const getLog_Alarms = async (req, res) => {
  try {
    const Logs_Alarms = await listLogs_Alarms();
    return res.status(200).json(Logs_Alarms)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const markAlertAsViewed = async (req, res) => {
  try {
    const { id } = req.params
    const updatedAlarm = await changeViewedAlarm(id)
    return res.status(200).json(updatedAlarm)
  } catch (error) {
    if (error.errors) {
      res.status(500).json(error.errors)
    } else {
      res.status(400).json(error.message)
    }
  }
}

const getUnreadAlertCount = async (req, res) => {
  try {
    const count = await db.Logs_Alarms.count({
      where: { viewed: 0 }
    })
    res.json({ count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al contar alertas no vistas' })
  }
}

module.exports = {
  getAlarms,
  addAlarms,
  editAlarm,
  toggleAlarmStatus,
  checkAlarms,
  publicCheckAlarms,
  getLog_Alarms,
  markAlertAsViewed,
  getUnreadAlertCount
}