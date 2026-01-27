const { z } = require('zod')

const validColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * Schema para cada LED individual
 */
const MultipleBooleanItemSchema = z
  .object({
    key: z
      .string({ message: 'La key del LED es requerida' })
      .min(1, { message: 'La key del LED es requerida' })
      .trim(),

    textOn: z
      .string({ message: 'Debe pasar un string como texto ON' })
      .min(1, { message: 'El texto ON es requerido' })
      .trim(),

    textOff: z
      .string({ message: 'Debe pasar un string como texto OFF' })
      .min(1, { message: 'El texto OFF es requerido' })
      .trim(),

    colorOn: z
      .string({ message: 'Debe pasar un string como color ON' })
      .regex(validColor, {
        message: 'El color ON no es válido. Debe estar en hexadecimal',
      }),

    colorOff: z
      .string({ message: 'Debe pasar un string como color OFF' })
      .regex(validColor, {
        message: 'El color OFF no es válido. Debe estar en hexadecimal',
      }),

    idVar: z.number({
      required_error: 'idVar es requerido',
      invalid_type_error: 'idVar debe ser numérico',
    }),

    // Campo legacy / opcional (no se usa)
    title: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.colorOn === data.colorOff) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los colores para ON y OFF deben ser diferentes',
        path: ['colorOn'],
      })

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los colores para ON y OFF deben ser diferentes',
        path: ['colorOff'],
      })
    }
  })

/**
 * Schema principal del gráfico MultipleBoolean
 */
const MultipleBooleanChartSchema = z.object({
  title: z
    .string({ message: 'Debe pasar un string como título' })
    .min(1, { message: 'El título es requerido' })
    .trim(),

  type: z.literal('MultipleBooleanChart'),

  chartData: z
    .array(MultipleBooleanItemSchema)
    .min(1, { message: 'Debe definir al menos un LED' }),

  order: z
    .union([z.number(), z.string()])
    .optional()
    .transform(val => (val !== undefined ? Number(val) : undefined)),
})

module.exports = {
  MultipleBooleanChartSchema
}
