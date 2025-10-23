const { default: axios } = require("axios")

const createAlarmLog = async (db, alarm, currentValue, secondaryValue) => {
  
  try {
    // 🔹 Seguridad de valores nulos o indefinidos
    const safeValue = currentValue != null && !isNaN(currentValue)
      ? Number(currentValue).toFixed(2)
      : 'sin datos';

    const safeSecondary = secondaryValue != null && !isNaN(secondaryValue)
      ? Number(secondaryValue).toFixed(2)
      : 'sin datos';

    let message = '';

    // 🔹 ALARMA SIMPLE
    if (alarm.type === 'single') {
      message = `"${alarm.name}" (${alarm.variable?.name} ${alarm.condition} ${alarm.value}${
        alarm.condition === 'entre' ? ' y ' + alarm.value2 : ''
      }) disparada con valor ${safeValue}`;
    }

    // 🔹 ALARMA COMBINADA
    else if (alarm.type === 'combined') {
      message = `"${alarm.name}" combinada disparada:
      ${alarm.variable?.name}: ${safeValue} (${alarm.condition} ${alarm.value}${
        alarm.condition === 'entre' ? ' y ' + alarm.value2 : ''
      })
      ${alarm.logicOperator}
      ${alarm.secondaryVariable?.name}: ${safeSecondary} (${alarm.secondaryCondition} ${alarm.secondaryValue})`;
    }

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

    try {
      await discord(db, message)
    } catch (err) {
      console.error('No se pudo notificar a Discord:', err.message)
    }
    registro = log.message
    return registro

  } catch (error) {
    console.error('Error al crear log:', error)
    throw error
  }
}

const discordCredentials = async (db) => {
  try {
    const credentials = await db.Discord.findOne({ where: { id: 1 } })
    return credentials
  } catch (e) {
    throw e
  }
}

async function discord(db, message) {
  try {
    const credentials = await discordCredentials(db)
    const webhookURL = `https://discord.com/api/webhooks/${credentials.webhook}`
    await axios.post(webhookURL, {
      username: credentials.username,
      avatar_url: 'https://masagua.cooptech.com.ar/assets/img/Logo/Logo.png',
      content: `Nuevo registro de alarma.`,
      embeds: [
        {
          title: `:warning: ${message}`,
          // description: `**Ingresa a Mas Agua para ver todos los detalles**`,
          color: 15007526,
          url: 'https://masagua.cooptech.com.ar/',
          // image: {
          // 	url: 'https://masagua.cooptech.com.ar/assets/img/Logo/Logo.png',
          // },
        },
      ],
    })
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
  }
}

module.exports = {
  createAlarmLog,
}
