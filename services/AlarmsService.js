const { db } = require('../models')
const { createAlarmLog } = require('./LogsAlarmsService')
const { getSimpleInfluxData, getHistorcalInfluxData } = require('../controllers/Influx.controller')

const listAlarms = async () => {
	try {
		const alarms = await db.Alarms.findAll({
			include: [
				{ model: db.InfluxVar, as: 'variable', attributes: ['id', 'name'] },
				{ model: db.InfluxVar, as: 'secondaryVariable', attributes: ['id', 'name'] },
			],
			order: [['id', 'ASC']],
		})

		return alarms.map((a) => {
			const json = a.toJSON()
			return {
				...json,
				var_name: json.variable?.name || null,
				secondaryVarName: json.secondaryVariable?.name || '',
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
			include: [
				{ model: db.InfluxVar, as: 'variable' },
				{ model: db.InfluxVar, as: 'secondaryVariable' }
			],
			raw: true,
			nest: true,
		})

		console.log(
			!alarms.length
				? `No hay alarmas activas en la db: ${db.sequelize.config.database}`
				: `Se encontraron ${alarms.length} alarmas activas en la db: ${db.sequelize.config.database}`
		)

		const results = []

		for (const alarm of alarms) {
			// FUNCION AUXILIAR PARA LEER VALORES
			const getValueForVar = async (influxVar) => {
				if (!influxVar) return null

				if (influxVar.type === 'history') {
					const historyData = await getHistorcalInfluxData(influxVar, user)
					if (!Array.isArray(historyData) || historyData.length === 0) return null
					const lastPoint = historyData.at(-1)
					return parseFloat(lastPoint?._value)
				} else {
					const simpleData = await getSimpleInfluxData(influxVar, user)
					if (!simpleData || Object.keys(simpleData).length === 0) return null

					if (typeof simpleData.value !== 'undefined') {
						return parseFloat(simpleData.value)
					} else {
						const firstKey = Object.keys(simpleData)[0]
						return parseFloat(simpleData[firstKey]?.value)
					}
				}
			}

			// LEER VALOR VARIABLE PRINCIPAL
			const primaryValue = await getValueForVar(alarm.variable)
			if (primaryValue === null || isNaN(primaryValue)) {
				console.log(`La alarma "${alarm.name}" tiene valor nulo o inválido ${alarm.variable.name}: (${primaryValue})`)
				continue
			}

			// EVALUAR CONDICIÓN PRINCIPAL
			const evaluateCondition = (val, cond, val1, val2) => {
				switch (cond) {
					case '>': return val > val1
					case '<': return val < val1
					case '=': return val === val1
					case '>=': return val >= val1
					case '<=': return val <= val1
					case 'entre': return val >= val1 && val <= val2
					default: return false
				}
			}

			let triggered = false
			let secondaryValue = null;

			// SI ES UNA ALARMA SIMPLE
			if (alarm.type === 'single') {
				triggered = evaluateCondition(primaryValue, alarm.condition, alarm.value, alarm.value2)
			}

			// SI ES UNA ALARMA COMBINADA
			else if (alarm.type === 'combined') {
				secondaryValue = await getValueForVar(alarm.secondaryVariable)
				if (secondaryValue === null || isNaN(secondaryValue)) {
					console.log(`La alarma combinada "${alarm.name}" no tiene valor secundario válido ${alarm.secondaryVariable.name}: (${secondaryValue})`)
					continue
				}

				const primaryTriggered = evaluateCondition(primaryValue, alarm.condition, alarm.value, alarm.value2)
				const secondaryTriggered = evaluateCondition(
					secondaryValue,
					alarm.secondaryCondition,
					alarm.secondaryValue
				)

				if (alarm.logicOperator === 'AND') {
					triggered = primaryTriggered && secondaryTriggered
				} else if (alarm.logicOperator === 'OR') {
					triggered = primaryTriggered || secondaryTriggered
				}

				console.log(
					`Evaluando combinada "${alarm.name}": ${alarm.variable.name}=${primaryValue} ${alarm.condition} ${alarm.value} ${alarm.logicOperator} ${alarm.secondaryVariable.name}=${secondaryValue} ${alarm.secondaryCondition} ${alarm.secondaryValue}`
				)
			}

			const status = triggered ? 'triggered' : 'ok'
			const msg = triggered
				? `🚨 Alarma "${alarm.name}" disparada`
				: `✅ Alarma "${alarm.name}" no disparada`

			if (triggered) await createAlarmLog(db, alarm, primaryValue, secondaryValue)

			results.push({
				name: alarm.name,
				type: alarm.type,
				status,
				variables:
					alarm.type === 'single'
						? [{ name: alarm.variable?.name, value: primaryValue }]
						: [
							{ name: alarm.variable?.name, value: primaryValue },
							{ name: alarm.secondaryVariable?.name, value: secondaryValue },
						],
				message: msg,
			})
		}

		const triggeredCount = results.filter(r => r.status === 'triggered').length
		const logMessage =
			triggeredCount === 0
				? 'No se disparó ninguna alarma'
				: `${triggeredCount} alarma(s) disparada(s)`

		await db.Logs_Cronjob.create({
			message: {
				message: logMessage,
				results,
			},
		})

		return {
			message: logMessage,
			results,
		}

	} catch (err) {
		console.error('Error en checkAlarms:', err)
		if (user?.db?.Logs_Cronjob) {
			await user.db.Logs_Cronjob.create({
				message: {
					error: err.message,
					stack: err.stack,
					timestamp: new Date().toISOString(),
				},
			})
		}
		throw err
	}
}

const listLogs_Alarms = async () => {
	try {
		const Logs_Alarms = await db.Logs_Alarms.findAll({
			order: [['triggeredAt', 'DESC']],
		})

		const formattedLogs = Logs_Alarms.map(log => {
			const originalDate = new Date(log.triggeredAt)
			const formattedDate = originalDate.toLocaleString('es-AR', {
				timeZone: 'America/Argentina/Cordoba',
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

const changeViewedAlarm = async (id) => {
	if (id) {
		const alert = await db.Logs_Alarms.findByPk(id);
		if (!alert) throw new Error('Alerta no encontrada');
		await alert.update({ viewed: true });
		return alert;
	} else {
		const [updatedCount] = await db.Logs_Alarms.update(
			{ viewed: true },
			{ where: { viewed: false } }
		);
		return { updatedCount };
	}
};


module.exports = {
	listAlarms,
	postAlarm,
	updateAlarm,
	changeStatusAlarm,
	alarmsChecked,
	listLogs_Alarms,
	changeViewedAlarm
}