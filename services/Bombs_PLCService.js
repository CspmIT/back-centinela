const axios = require('axios')
const { ConsultaInflux } = require('./InfluxServices.js')

//FUNCION PARA OBTENER INFORMACION DE SUCCION, BOMBAS Y SU ESTADO ACTUAL
const getBombs_PLC = async (influx_name, db) => {
  try {
    const [bombs, dataBombeo] = await Promise.all([
      db.Bombs_PLC.findAll({
        include: [{ model: db.Bombs_PLC_actions, as: 'actions' }],
        order: [['id', 'ASC']]
      }),
      getData_Bombeo(influx_name)
    ])

    const { bombas: bombeoStatus, info_succion } = dataBombeo

    const enrichedBombs = bombs.map(bomb => ({
      ...bomb.toJSON(),
      status: bombeoStatus?.[bomb.name] ?? null,
      actual_mode: getActualModeFromInfoSuccion(bomb.name, info_succion)
    }))

    return {
      info_succion,
      bombs: enrichedBombs
    }

  } catch (error) {
    console.error('getBombs_PLC:', error)
    throw error
  }
}

const getData_Bombeo = async (influx_name) => {
  try {
    const [bombeoStatus, infoSuccion] = await Promise.all([
      (async () => {
        const query = `
          |> range(start: -15m)
          |> filter(fn: (r) => r["topic"] == "coop/agua/osmosis_1/bombas")
          |> filter(fn: (r) =>
            r["_field"] == "QPLC0" or
            r["_field"] == "QPLC1" or
            r["_field"] == "QPLC2" or
            r["_field"] == "QPLC3" or
            r["_field"] == "QPLC4" or
            r["_field"] == "QPLC5" or
            r["_field"] == "QPLC7" or
            r["_field"] == "QPLC8"

          )
          |> aggregateWindow(every: 1m, fn: last, createEmpty: false)
          |> last()
        `

        const rows = await ConsultaInflux(query, influx_name)

        const parseQPLC = (value) =>
          value.toString(2).padStart(4, '0').split('')

        const mapByField = {
          QPLC0: [['Bomba 1', 3], ['Bomba 2', 2]],
          QPLC1: [['Bomba 3', 3], ['Bomba 4', 2], ['Bomba 5', 1], ['Bomba 6', 0]],
          QPLC2: [['Bomba 7', 3], ['Bomba 8', 2], ['Bomba 9', 1]],
          QPLC3: [['Bomba 10', 3], ['Bomba 11', 2], ['Bomba 12', 1], ['Bomba 13', 0]],
          QPLC4: [['Bomba 14', 3], ['Bomba 15', 2], ['Bomba 16', 1], ['Bomba 17', 0]],
          QPLC5: [['Bomba 18', 3], ['Bomba 19', 2], ['Bomba 20', 1]],
          QPLC7: [['Bomba 21', 3], ['Bomba 22', 2], ['Bomba 23', 1], ['Bomba 24', 0]],
          QPLC8: [['Bomba 25', 3], ['Bomba 26', 2], ['Bomba 27', 1], ['Bomba 28', 0]],
        }

        const status = {}

        rows.forEach(({ _field, _value }) => {
          if (!mapByField[_field]) return
          const bits = parseQPLC(_value)
          mapByField[_field].forEach(([name, idx]) => {
            status[name] = bits[idx] === '1'
          })
        })

        return status
      })(),
      getInfoSuccion(influx_name)
    ])

    const modos = {}

    Object.keys(bombeoStatus).forEach(bombName => {
      modos[bombName] = getActualModeFromInfoSuccion(bombName, infoSuccion)
    })

    return {
      bombas: bombeoStatus,
      modos,
      info_succion: infoSuccion
    }

  } catch (error) {
    console.error('getData_Bombeo:', error)
    throw new Error('Error obteniendo datos de bombeo')
  }
}

const getInfoSuccion = async (influx_name) => {
  try {
    const query = `
        |> range(start: -5m)
        |> filter(fn: (r) => r["topic"] == "coop/agua/osmosis_1/config")
        |> filter(fn: (r) =>
          r["_field"] == "Destino" or
          r["_field"] == "Configuracion" or
          r["_field"] == "AcM" or
          r["_field"] == "FuS" or
          r["_field"] == "var_2"
        )
        |> aggregateWindow(every: 1m, fn: last, createEmpty: false)
        |> last()
      `

    const rows = await ConsultaInflux(query, influx_name)
    const data = {}

    rows.forEach(r => {
      const field = r._field
      const value = r._value
      data[field] = value
    })

    return data

  } catch (error) {
    console.error('getInfoSuccion:', error)
    throw new Error('Error obteniendo info de succión')
  }
}

const getActualModeFromInfoSuccion = (bombName, infoSuccion) => {
  if (!infoSuccion) return 'Sin datos'

  // Extraer número de bomba
  const bombNumber = Number(
    bombName.replace('Bomba', '').trim()
  )

  const bombCode = bombNumber
    .toString()
    .padStart(3, 'B0')
  const { AcM = '', FuS = '' } = infoSuccion

  if (AcM.includes(`-${bombCode}`)) {
    return 'Encendido forzado'
  }

  if (FuS.includes(`-${bombCode}`)) {
    return 'Apagado forzado'
  }

  return 'Automático'
}


const readBombPLC = async (bombId, db) => {
  const action = await db.Bombs_PLC_actions.findOne({
    where: {
      id_bombs_PLC: bombId,
      name: 'Leer'
    }
  })
  if (!action) {
    throw new Error('Acción de lectura no encontrada')
  }

  const result = await executeBombAction({
    bombId,
    actionId: action.id
  })

  return {
    status: result?.plcResponse?.estado ?? null,
    actual_mode: result?.plcResponse?.modo ?? 'Sin datos'
  }
}

const postBombs_PLC = async (payload, db) => {
  const transaction = await db.sequelize.transaction();

  try {
    const data = Array.isArray(payload) ? payload[0] : payload;
    const {
      name, IP_PLC, rack, slot, DB_ID, variable,
      actions = []
    } = data;

    const bomb = await db.Bombs_PLC.create(
      {
        name, IP_PLC, rack, slot, DB_ID, variable
      },
      { transaction }
    );

    if (actions.length > 0) {
      const actionsToCreate = actions.map(action => ({
        name: action.name,
        comando: action.comando,
        estado: action.estado,
        id_bombs_PLC: bomb.id
      }));

      await db.Bombs_PLC_actions.bulkCreate(actionsToCreate, {
        transaction
      });
    }

    await transaction.commit();

    return await db.Bombs_PLC.findByPk(bomb.id, {
      include: [{ model: db.Bombs_PLC_actions, as: 'actions' }]
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const callPLC = async (payload) => {
  try {
    const response = await axios.post(
      // 'http://192.168.0.62:3000/S7_1200/',
      'http://172.26.5.40/S7:1200/',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data
  } catch (error) {
    console.warn('Accion ejecutada por el PLC, respondio error:', {
      status: error.response?.status,
      data: error.response?.data,
    })

    return {
      success: true,
      warning: true,
      message: 'Accion ejecutada por el PLC'
    }
  }
}

const executeBombAction = async ({ bombId, actionId, userId, db }) => {
  try {
    const bomb = await db.Bombs_PLC.findByPk(bombId)
    if (!bomb) throw new Error('Bomba no encontrada')

    const action = await db.Bombs_PLC_actions.findOne({
      where: { id: actionId, id_bombs_PLC: bombId }
    })
    if (!action) throw new Error('Acción no encontrada para esta bomba')

    const actionPayload = {
      IP: bomb.IP_PLC,
      rack: bomb.rack,
      slot: bomb.slot,
      comando: action.comando,
      DB_ID: bomb.DB_ID,
      variable: bomb.variable,
      estado: action.estado,
    }
    const actionResponse = await callPLC(actionPayload)

    if (action.comando !== 'leer') {
      await db.PLC_action_logs.create({
        bomb_id: bombId,
        action_id: actionId,
        user_id: userId,
      })
    }

    let readResponse = null

    if (action.comando !== 'leer') {
      const readAction = await db.Bombs_PLC_actions.findOne({
        where: { id_bombs_PLC: bombId, comando: 'leer' }
      })
      if (readAction) {
        const readPayload = {
          IP: bomb.IP_PLC,
          rack: bomb.rack,
          slot: bomb.slot,
          comando: 'leer',
          DB_ID: bomb.DB_ID,
          variable: bomb.variable,
          estado: readAction.estado,
        }
        readResponse = await callPLC(readPayload)
      }
    }

    return {
      bomb: bomb.name,
      action: action.name,
      actionResponse,
      readResponse,
    }

  } catch (error) {
    console.error('Error PLC:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })
    throw error
  }
}

module.exports = {
  getBombs_PLC,
  getData_Bombeo,
  postBombs_PLC,
  executeBombAction,
  readBombPLC,
  getInfoSuccion
}