const { z } = require('zod')
const categories = z.object({
    name: z.string().min(1, 'La categoría es obligatoria'),
    color: z.string().min(1, 'El color es obligatorio'),
    value: z.number().min(1, 'El valor es obligatorio'),
})

const SchemaWithDates = z.object({
    lastValue: z.literal(false),
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
})

const SchemaWithoutDates = z.object({
    lastValue: z.literal(true),
})

const DoughnutChartschema = z
    .object({
        title: z.string().min(1, 'El título es obligatorio'),
        categories: z.array(categories),
    })
    .and(
        z.discriminatedUnion('lastValue', [SchemaWithDates, SchemaWithoutDates])
    )

module.exports = { DoughnutChartschema }
