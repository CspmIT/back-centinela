const { db } = require('../models')

const createAlarmLog = async (alarm, currentValue) => {
  try {
    const message = `Alarma "${alarm.name}" (${alarm.condition} ${alarm.value}${
      alarm.condition === 'entre' ? ' y ' + alarm.value2 : ''
    }) disparada con valor ${currentValue}`

    const log = await db.Logs_Alarms.create({
      message,
      value: currentValue,
      triggeredAt: new Date(),
    })

    return log
  } catch (error) {
    throw error
  }
}

module.exports = {
    createAlarmLog,
  }