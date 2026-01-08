const { z } = require('zod')

const ChartDataItemSchema = z.object({
    key: z.enum(['value', 'secondary', 'bottom1', 'bottom2', 'maxValue', 'unidad'], ),
    label: z.string().optional(),
    idVar: z.number().optional()
})

const LiquidFillSchema = z
    .object({
        order: z.number().optional(),

        type: z
            .string({ message: 'type is required' })
            .min(1)
            .max(255),

        border: z.boolean({ message: 'border debe ser booleano' }),

        color: z
            .string({ message: 'color debe ser string' })
            .min(3)
            .max(255),

        maxValue: z.number({
            message: 'maxValue debe ser un numero',
        }),

        porcentage: z.boolean({
            message: 'porcentage debe ser booleano',
        }),

        shape: z
            .string({ message: 'shape debe ser string' })
            .min(1)
            .max(255),

        title: z
            .string({ message: 'title debe ser string' })
            .min(1)
            .max(255),

        unidad: z.string().nullable().optional(),

        chartData: z
            .array(ChartDataItemSchema)
            .min(1, { message: 'Debe existir al menos una variable' }),
    })
    .refine(
        (data) => {
            // unidad requerida si NO es porcentaje
            if (!data.porcentage) {
                return data.unidad && data.unidad.length > 0
            }
            return true
        },
        {
            message: 'unidad es requerido si porcentage es false',
            path: ['unidad'],
        }
    )
    .refine(
        (data) => {
            // debe existir SIEMPRE value
            const hasValue = data.chartData.some(
                (item) => item.key === 'value'
            )
            return hasValue
        },
        {
            message: 'Debe existir una variable principal (value)',
            path: ['chartData'],
        }
    )
    

module.exports = {
    LiquidFillSchema,
}
