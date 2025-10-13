const createAlarmLog = async (db, alarm, currentValue) => {
  try {
    const message = `Alarma "${alarm.name}" (${alarm.condition} ${alarm.value}${
      alarm.condition === 'entre' ? ' y ' + alarm.value2 : ''
    }) disparada con valor ${currentValue}`

    // Buscar último log de esta alarma
    const lastLog = await db.Logs_Alarms.findOne({
      where: { alarmId: alarm.id },
      order: [['triggeredAt', 'DESC']],
    })

    const now = new Date()
    if (lastLog && alarm.repeatInterval && alarm.repeatInterval > 0) {
      const diffMinutes = (now - new Date(lastLog.triggeredAt)) / (1000 * 60)
      if (diffMinutes < alarm.repeatInterval) {
        console.log(`No se guarda log de "${alarm.name}" — último disparo hace ${diffMinutes.toFixed(1)} min`)
        return null
      }
    }

    const formattedValue = Number(currentValue).toFixed(2)

    const log = await db.Logs_Alarms.create({
      alarmId: alarm.id,
      message,
      value: formattedValue,
      triggeredAt: now,
      viewed: false,
    })

    console.log('Log creado:', message, ', en base de datos:', db.sequelize.config.database)
    return log

  } catch (error) {
    console.error('Error al crear log:', error)
    throw error
  }
}

module.exports = {
  createAlarmLog,
}
