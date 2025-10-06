const { db } = require('../models')
const { generateQuery } = require('../utils/js/queryBuilder')
const { ConsultaInflux } = require('./InfluxServices')
const { createAlarmLog } = require('./LogsAlarmsService')
const { getSimpleInfluxData, getHistorcalInfluxData } = require('../controllers/Influx.controller')

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

const alarmsChecked = async (user) => {
	try {
	  const alarms = await db.Alarms.findAll({
		where: { status: true },
		include: [{ model: db.InfluxVar, as: 'variable' }],
		raw: true,
		nest: true,
	  });
  
	  for (const alarm of alarms) {
		const influxVar = alarm.variable;
		if (!influxVar) {
		  console.warn(`⚠️ La alarma "${alarm.name}" no tiene variable vinculada`);
		  continue;
		}
  
		let currentValue;
		// 🔹 Tipo history
		if (influxVar.type === 'history') {
		  const historyData = await getHistorcalInfluxData(influxVar, user);
		  if (!Array.isArray(historyData) || historyData.length === 0) {
			console.warn(`⚠️ Sin datos históricos para ${alarm.name}`);
			continue;
		  }
		  const lastPoint = historyData.at(-1); // último valor
		  currentValue = parseFloat(lastPoint?._value);
		  console.log(`📈 Valor histórico actual de "${alarm.name}":`, currentValue);
		}
  
		// 🔹 Tipo simple
		else {
		  const simpleData = await getSimpleInfluxData(influxVar, user);
		  if (!simpleData || Object.keys(simpleData).length === 0) {
			console.warn(`⚠️ Sin datos simples para ${alarm.name}`);
			continue;
		  }
		  const firstKey = Object.keys(simpleData)[0];
		  currentValue = parseFloat(simpleData[firstKey]?.value);
		  console.log(`💧 Valor simple actual de "${alarm.name}":`, currentValue);
		}
  
		if (isNaN(currentValue)) continue;
  
		// 🔹 Evaluar condición
		let triggered = false;
		switch (alarm.condition) {
		  case '>': triggered = currentValue > alarm.value; break;
		  case '<': triggered = currentValue < alarm.value; break;
		  case '=': triggered = currentValue === alarm.value; break;
		  case '>=': triggered = currentValue >= alarm.value; break;
		  case '<=': triggered = currentValue <= alarm.value; break;
		  case 'entre': triggered = currentValue >= alarm.value && currentValue <= alarm.value2; break;
		}
  
		console.log(`🧩 ${alarm.name}: valor ${currentValue}, triggered: ${triggered}`);
  
		// 🔹 Registrar log
		if (triggered) {
		  await createAlarmLog(alarm, currentValue);
		  console.log(`🔔 Alarma "${alarm.name}" disparada con valor ${currentValue}`);
		}
	  }
	} catch (err) {
	  console.error('❌ Error en checkAlarms:', err);
	  throw err;
	}
  };
  

module.exports = {
	listAlarms,
	postAlarm,
	updateAlarm,
	changeStatusAlarm,
	alarmsChecked
}