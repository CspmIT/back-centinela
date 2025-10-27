const { ConsultaInflux } = require('./InfluxServices')

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const pad2 = n => (n < 10 ? '0' + n : '' + n)
const lastDayOfMonth = (y, mIndex) => new Date(y, mIndex + 1, 0).getDate()
const formatDDMMYYYY = d => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`

const formatConsumption = (n) => {
    if (Number.isFinite(n)) {
        if (Math.abs(Math.round(n) - n) < 1e-9) return String(Math.round(n))
        return Number(n).toFixed(2)
    }
    return '0'
}

function getTopicByClient(clientName) {
    const topics = {
        masagua_adeco: 'coop/agua/Clientes/AdecoAgro/fosa_entrada/channels',
        masagua_lactear: 'coop/agua/Clientes/Lactear/fosa_entrada/status',
        masagua_desarrollo: 'coop/agua/Clientes/AdecoAgro/fosa_entrada/channels'
    }
    const fields = {
        masagua_adeco: 'Totalizado',
        masagua_lactear: 'total_1',
        masagua_desarrollo: 'Totalizado'
    }

    return {
        topic: topics[clientName] || null,
        field: fields[clientName] || null
    }

}

async function getWaterAverageTax(user) {
    try {
      console.log('🟢 [getWaterAverageTax] Iniciando cálculo para:', user.name_coop)
  
      const { topic, field } = getTopicByClient(user.name_coop)
      console.log('🔹 Topic:', topic)
      console.log('🔹 Field:', field)
  
      if (!topic || !field) throw new Error('Cliente no reconocido')
  
      const fluxQuery = `
        |> range(start: -3mo, stop: now())
        |> filter(fn: (r) => r["topic"] == "${topic}")
        |> filter(fn: (r) => r["_field"] == "${field}")
        |> aggregateWindow(every: 1mo, fn: last, createEmpty: false)
      `
      console.log('📤 [Flux Query]:', fluxQuery)
  
      const total = await ConsultaInflux(fluxQuery, user.influx_name)
      console.log('📥 [Influx Result] Cantidad de registros:', Array.isArray(total) ? total.length : 0)
      if (Array.isArray(total)) {
        total.forEach((r, i) =>
          console.log(`   #${i} → time=${r._time}, value=${r._value}`)
        )
      }
  
      if (!Array.isArray(total) || total.length === 0) {
        throw new Error('Sin datos')
      }
  
      // Variables base
      let consumo_anterior = 0
      let consumo_actual = 0
      let consumo_prog = 0
  
      const now = new Date()
      const dtMinus1 = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const dtMinus2 = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
      const ymNow = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
      const ymMinus1 = `${dtMinus1.getFullYear()}-${pad2(dtMinus1.getMonth() + 1)}`
      const ymMinus2 = `${dtMinus2.getFullYear()}-${pad2(dtMinus2.getMonth() + 1)}`
  
      console.log('📆 [Fechas]')
      console.log('   ymNow:', ymNow)
      console.log('   ymMinus1:', ymMinus1)
      console.log('   ymMinus2:', ymMinus2)
  
      // Recorrer resultados y detectar valores por mes
      for (const rec of total) {
        if (!rec._time) continue
        const recDate = new Date(rec._time)
        const recYM = `${recDate.getFullYear()}-${pad2(recDate.getMonth() + 1)}`
        const val = Number(rec._value)
        console.log(`🧩 [Dato] ${recYM} = ${val}`)
  
        if (recYM === ymMinus2) {
          consumo_anterior = val
        } else if (recYM === ymMinus1) {
          consumo_actual = val
        } else if (recYM === ymNow) {
          consumo_prog = val
        }
      }
  
      console.log('🔢 [Valores brutos]')
      console.log('   consumo_anterior:', consumo_anterior)
      console.log('   consumo_actual:', consumo_actual)
      console.log('   consumo_prog:', consumo_prog)
  
      const nowYMCheck = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
      if (nowYMCheck === '2023-11') {
        console.warn('⚠️ Ajuste manual: consumo_anterior = 0 para 2023-11')
        consumo_anterior = 0
      }
  
      const fecha_ant = formatDDMMYYYY(
        new Date(dtMinus2.getFullYear(), dtMinus2.getMonth(), lastDayOfMonth(dtMinus2.getFullYear(), dtMinus2.getMonth()))
      )
      const fecha_act = formatDDMMYYYY(
        new Date(dtMinus1.getFullYear(), dtMinus1.getMonth(), lastDayOfMonth(dtMinus1.getFullYear(), dtMinus1.getMonth()))
      )
      const fecha_prox = formatDDMMYYYY(now)
  
      const mesAnt = meses[dtMinus1.getMonth()]
      const mesActual = meses[now.getMonth()]
      const diasAnt1 = String(lastDayOfMonth(dtMinus1.getFullYear(), dtMinus1.getMonth()))
      const diasAnt2 = String(lastDayOfMonth(dtMinus2.getFullYear(), dtMinus2.getMonth()))
      const diasProx = String(now.getDate())
  
      const consumoActualCalc = consumo_actual - consumo_anterior
      const consumoProxCalc = consumo_prog - consumo_actual
      const estimado = ((consumoProxCalc * Number(diasAnt2)) / Number(diasProx))
  
      console.log('📊 [Cálculos]')
      console.log('   consumoActualCalc:', consumoActualCalc)
      console.log('   consumoProxCalc:', consumoProxCalc)
      console.log('   estimado:', estimado)
  
      const result = {
        actual: {
          fecha_ant,
          valor_ant: `${Number(consumo_anterior).toFixed(2)} m³`,
          fecha_act,
          valor_act: `${Number(consumo_actual).toFixed(2)} m³`,
          consumo: `${formatConsumption(consumoActualCalc)} m³`,
          dias: diasAnt1,
          periodo: mesAnt,
        },
        prox: {
          fecha: fecha_prox,
          valor: `${Number(consumo_prog).toFixed(2)} m³`,
          consumo: `${formatConsumption(consumoProxCalc)} m³`,
          dias: diasProx,
          estimado: `${Number(estimado).toFixed(2)} m³`,
          periodo: `${mesActual} (en curso)`,
        },
      }
  
      console.log('✅ [Resultado Final]', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('❌ Error en getWaterAverageTax:', error)
      throw error
    }
  }
  

async function graf_dif_men_osmosis(user) {
    try {
        const { topic, field } = getTopicByClient(user.name_coop)
        if (!topic || !field) throw new Error('Cliente no reconocido')

        const fluxQuery = `
          |> range(start: -13mo, stop: now())
          |> filter(fn: (r) => r["topic"] == "${topic}")
          |> filter(fn: (r) => r["_field"] == "${field}")
          |> aggregateWindow(every: 1mo, fn: last, createEmpty: false)
        `

        const total = await ConsultaInflux(fluxQuery, user.influx_name)

        if (!Array.isArray(total) || total.length === 0) {
            throw new Error('Sin datos')
        }

        const data = []
        const minDate = new Date('2023-10-01')

        for (let i = 0; i < total.length; i++) {
            const rec = total[i]
            if (!rec._time || rec._value == null) continue

            const recDate = new Date(rec._time)
            if (recDate <= minDate) continue

            const mes = meses[recDate.getMonth()]
            const anio = recDate.getFullYear()
            let valor

            if (i === 0) {
                valor = rec._value
            } else {
                const prev = total[i - 1]
                valor = rec._value - prev._value
            }

            data.push([`${mes}-${anio}`, valor])
        }

        if (data.length > 0) data.shift()

        return data

    } catch (error) {
        console.error('Error en graf_dif_men_osmosis:', error)
        throw error
    }
}

module.exports = {
    getWaterAverageTax,
    graf_dif_men_osmosis
}
