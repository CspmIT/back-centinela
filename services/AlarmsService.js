const { db } = require('../models')
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
		const db = user.db
		const alarms = await db.Alarms.findAll({
			where: { status: true },
			include: [{ model: db.InfluxVar, as: 'variable' }],
			raw: true,
			nest: true,
		});
		console.log(!alarms.length ? 'No hay alarmas activas' : `Se encontraron ${alarms.length} alarmas activas`);
		const results = []

		for (const alarm of alarms) {
			const influxVar = alarm.variable;
			if (!influxVar) {
				console.log(`La alarma "${alarm.name}" no tiene variable vinculada`);
				continue;
			}

			let currentValue;
			// Tipo history
			if (influxVar.type === 'history') {
				const historyData = await getHistorcalInfluxData(influxVar, user);
				if (!Array.isArray(historyData) || historyData.length === 0) {
					console.log(`Sin datos históricos para ${alarm.name}`);
					continue;
				}
				const lastPoint = historyData.at(-1); // último valor
				currentValue = parseFloat(lastPoint?._value);
			}

			// Tipo simple
			else {
				const simpleData = await getSimpleInfluxData(influxVar, user);
				if (!simpleData || Object.keys(simpleData).length === 0) {
					console.log(`Sin datos simples para ${alarm.name}`);
					continue;
				}
				const firstKey = Object.keys(simpleData)[0];
				currentValue = parseFloat(simpleData[firstKey]?.value);
				console.log(`💧 Valor simple actual de "${alarm.name}":`, currentValue);
			}

			if (isNaN(currentValue)) continue;

			// Evaluar condición
			let triggered = false;
			switch (alarm.condition) {
				case '>': triggered = currentValue > alarm.value; break;
				case '<': triggered = currentValue < alarm.value; break;
				case '=': triggered = currentValue === alarm.value; break;
				case '>=': triggered = currentValue >= alarm.value; break;
				case '<=': triggered = currentValue <= alarm.value; break;
				case 'entre': triggered = currentValue >= alarm.value && currentValue <= alarm.value2; break;
			}

			if (triggered) {
				await createAlarmLog(alarm, currentValue);
				const msg = `Alarma "${alarm.name}" disparada`;
				console.log(msg);
				results.push({ alarm: alarm.name, status: 'triggered', value: currentValue, message: msg });
			} else {
				const msg = `Alarma "${alarm.name}" no disparada`;
				results.push({ alarm: alarm.name, status: 'ok', value: currentValue, message: msg });
			}
		}

		// Si ninguna se disparó
		const triggeredCount = results.filter(r => r.status === 'triggered').length;
		if (triggeredCount === 0) {
			console.log('No se disparó ninguna alarma');
			return { message: 'No se disparó ninguna alarma', results };
		}

		return { message: `${triggeredCount} alarma(s) disparada(s)`, results };

	} catch (err) {
		console.error('Error en checkAlarms:', err);
		throw err;
	}
};

const listLogs_Alarms = async () => {
	try {
	  const Logs_Alarms = await db.Logs_Alarms.findAll()
  
	  // Formatear y restar 3 horas
	  const formattedLogs = Logs_Alarms.map(log => {
		const originalDate = new Date(log.triggeredAt)
		const adjustedDate = new Date(originalDate.getTime() - 3 * 60 * 60 * 1000)
		const formattedDate = adjustedDate.toLocaleString('es-AR', {
			timeZone: 'America/Argentina/Buenos_Aires',
			hour12: false,
			year: '2-digit',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		  })
		
		return {
		  ...log.toJSON(),
		  triggeredAt: formattedDate
		}
	  })
  
	  return formattedLogs
	} catch (error) {
	  throw error
	}
  }
  

module.exports = {
	listAlarms,
	postAlarm,
	updateAlarm,
	changeStatusAlarm,
	alarmsChecked,
	listLogs_Alarms
}