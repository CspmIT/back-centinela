const { z } = require('zod')

const xAxisConfigSchema = z
    .object({
        dateTimeType: z.string({ message: 'Debe pasar el tipo de dateTime' }),
        dateRange: z
            .string({ message: 'El rango de fecha debe ser un string' })
            .optional(),
        timeRange: z
            .string({ message: 'El rango del tiempo debe ser un string' })
            .optional(),
        samplingPeriod: z.string({
            message: 'Debe pasar el tiempo de muestreo',
        }),
    })
    .refine(
        (data) => {
            if (data.dateTimeType === 'date') {
                return (
                    data.dateRange !== undefined && data.dateRange.length !== 0
                )
            }
            if (data.dateTimeType === 'time') {
                return (
                    data.timeRange !== undefined && data.timeRange.length !== 0
                )
            }
            return true
        },
        {
            message: 'El valor desde/rango no puede estar vacio',
            path: ['dateRange', 'timeRange'],
        }
    )

const yDataSchema = z.object({
    source_id: z
        .number({ message: 'El idVar debe ser un entero' })
        .int({ message: 'No puede ser un decimal' })
        .positive({ message: 'No puede ser negativo' }),
    name: z.string({ message: 'El nombre es requerido y debe ser un string' }),
    line: z.enum(['line', 'smooth', 'bar', 'scatter']),
    smooth: z.boolean({ message: 'Se esperaba un booleano' }),
    color: z.string({ message: 'El color debe ser un string y es requerido' }),
})

const LineChartSchema = z.object({
    title: z.string({ message: 'El titulo es requerido' }),
    type: z.string({ message: 'Debe existir el tipo' }),
    xAxisConfig: xAxisConfigSchema,
    yData: z.array(yDataSchema),
    order: z.string('El order es invalido').optional()
})

module.exports = {
    LineChartSchema,
}
