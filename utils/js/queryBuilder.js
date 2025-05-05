async function generateQuery(influxVar) {
    const {
        calc_field,
        calc_period,
        calc_time,
        calc_topic,
        calc_type_period,
        calc_unit,
        calc_unit_period,
    } = influxVar
    const query = `|> range(start: -${calc_time}${calc_unit})
        |> filter(fn: (r) => r["topic"] == "${calc_topic}")
        |> filter(fn: (r) => r["_field"] == "${calc_field}")
        |> aggregateWindow(every: ${calc_period}${calc_unit_period}, fn: ${calc_type_period}, createEmpty: false)
        |> ${calc_type_period === 'last' ? 'last()' : `yield(name: "mean")`}`

    return query
}

async function generateQueryHistorical(influxVar) {
    if (influxVar?.render) {
        const query = `|> range(start: ${influxVar.dateRange}, stop: now())
        |> filter(fn: (r) => r.topic == "${influxVar.topic}")
        |> filter(fn: (r) => r._field == "${influxVar.field}")
        |> aggregateWindow(every: ${influxVar.samplingPeriod}, fn: ${influxVar.typePeriod}, createEmpty: false)
        |> yield(name: "${influxVar.typePeriod}")`
        return query
    }
    const key = Object.keys(influxVar.varsInflux)[0] // Obtener el primer (y único) key del objeto varsInflux
    const {
        calc_time,
        calc_unit,
        calc_field,
        calc_topic,
        calc_period,
        calc_type_period,
        calc_unit_period,
    } = influxVar.varsInflux[key]

    const query = `|> range(start: -${calc_time}${calc_unit}, stop: now())
  |> filter(fn: (r) => r.topic == "${calc_topic}")
  |> filter(fn: (r) => r._field == "${calc_field}")
  |> aggregateWindow(every: ${calc_period}${calc_unit_period}, fn: ${calc_type_period}, createEmpty: false)
  |> yield(name: "${calc_type_period}")`
    return query
}

module.exports = {
    generateQuery,
    generateQueryHistorical,
}
