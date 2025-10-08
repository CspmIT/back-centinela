const createAlarmLog = async (db, alarm, currentValue) => {
  try {
    const message = `Alarma "${alarm.name}" (${alarm.condition} ${alarm.value}${
      alarm.condition === 'entre' ? ' y ' + alarm.value2 : ''
    }) disparada con valor ${currentValue}`
     
    const log = await db.Logs_Alarms.create({
      message,
      value: currentValue,
      triggeredAt: new Date(),
    })
    console.log('Log creado:', message, ',en base de datos:', db.sequelize.config.database)
    return log
  } catch (error) {
    throw error
  }
}

module.exports = {
    createAlarmLog,
  }