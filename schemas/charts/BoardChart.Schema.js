const { z } = require('zod')

/**
 * Schema base para un item de ChartConfig
 */
const BoardChartConfigItemSchema = z.object({
  key: z
    .string({ message: 'La key de configuración es requerida' })
    .min(1, { message: 'La key de configuración es requerida' })
    .trim(),

  value: z.any(), // el valor real depende del uso (string / number / var.x)

  type: z
    .enum(['string', 'number', 'boolean'], {
      message: 'El tipo de configuración no es válido',
    }),
})

/**
 * Schema principal del BoardChart
 */
const BoardChartSchema = z.object({
  title: z
    .string({ message: 'Debe pasar un string como título' })
    .min(1, { message: 'El título es requerido' })
    .trim(),

  type: z.literal('BoardChart'),

  chartConfig: z
    .array(BoardChartConfigItemSchema)
    .min(1, { message: 'Debe definir al menos una configuración' }),

  order: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) =>
      val !== undefined && val !== '' ? Number(val) : undefined
    ),
})

module.exports = {
  BoardChartSchema,
}
