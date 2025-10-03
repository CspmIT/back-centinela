const { db } = require('../models')

const listAlarms = async () => {
  try {
    const alarms = await db.Alarms.findAll({
      include: [
        {
          model: db.InfluxVar,
          as: 'variable',
          attributes: ['id', 'name'],
        },
      ],
    })

    return alarms.map((a) => {
      const json = a.toJSON()
      return {
        ...json,
        var_name: json.variable?.name || null,
      }
    })
  } catch (error) {
    throw error
  }
}

const postAlarm = async (data) => {
	console.log(data)
	try {
		const newAlarm = await db.Alarms.create(data)
		return newAlarm
	} catch (error) {
		throw error
	}
}

const updateAlarm = async (id, data) => {
	try {
	  const [updatedRows] = await db.Alarms.update(data, {
		where: { id },
	  })
	  if (updatedRows === 0) {
		throw new Error('No se encontró la alarma para actualizar')
	  }
	  const updatedAlarm = await db.Alarms.findByPk(id)
	  return updatedAlarm
	} catch (error) {
	  throw error
	}
  }

  const changeStatusAlarm = async (id, status) => {
	try {
	  const [updatedRows] = await db.Alarms.update(
		{ status: !status },
		{ where: { id } }
	  )
  
	  if (updatedRows === 0) {
		throw new Error('No se encontró la alarma para actualizar estado')
	  }
  
	  const updatedAlarm = await db.Alarms.findByPk(id)
	  return updatedAlarm
	} catch (error) {
	  throw error
	}
  }

module.exports = {
	listAlarms,
	postAlarm,
	updateAlarm,
	changeStatusAlarm
}