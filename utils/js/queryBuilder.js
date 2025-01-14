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

module.exports = {
    generateQuery,
}
