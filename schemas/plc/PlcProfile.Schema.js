const z = require('zod')

const points = z.object({
    startPoint: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
    endPoint: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
})

const vars = z.object({
    byte: z
        .number({ message: 'El byte debe ser numerico' })
        .int({ message: 'El byte debe ser un entero' })
        .positive({ message: 'El byte debe ser positivo' }),
    bit: z
        .number({ message: 'El bit debe ser numerico' })
        .int({ message: 'El bit debe ser un entero' })
        .nonnegative({ message: 'El bit debe ser positivo' })
        .min(0, { message: 'El bit no puede ser menor que 0' })
        .max(7, { message: 'El bit no puede ser mayor que 7' }),
    type: z.enum(['BOOL', 'BYTE', 'INT', 'FLOAT', 'STRING', 'LONG', 'DOUBLE'], {
        message: 'El tipo de dato enviado no es valido',
    }),
    field: z
        .string({ message: 'El field debe ser un string' })
        .min(3, { message: 'El field debe tener un minimo de 3 caracteres' })
        .max(15, { message: 'El field no debe tener mas de 15 caracteres' }),
})
const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/

const PLCSchema = z.object({
    topic: z
        .string({ message: 'El topico debe ser un string' })
        .trim()
        .min(3, { message: 'El topico debe tener al menos 3 caracteres' }),
    influx: z.enum(
        ['Sensors_Morteros_Interna', 'Sensors_Externos', 'externos'],
        { message: 'El influx seleccionado no es valido' }
    ),
    PLCModel: z.enum(['LOGO_7', 'LOGO_8', 'S7_1200'], {
        message: 'El valor enviado no es valido',
    }),
    ip: z
        .string({ message: 'La ip debe ser string' })
        .refine((val) => ipv4Regex.test(val), {
            message: 'La IP no es válida',
        }),
    serviceName: z
        .string({ message: 'El nombre debe ser un string' })
        .trim()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
        .regex(/^[^\s]+$/, {
            message: 'El nombre debe ser una sola palabra sin espacios',
        }),
    rack: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),

    slot: z.coerce
        .number({ message: 'El valor debe ser numérico' })
        .positive({ message: 'El valor debe ser positivo' })
        .int({ message: 'El valor debe ser un entero' }),
    points: z
        .array(points)
        .min(1, { message: 'Debe haber al menos un punto configurado' }),
    vars: z
        .array(vars)
        .min(1, { message: 'Debe haber al menos una variable configurada' }),
    status: z
        .number({ message: 'El estado debe ser numerico' })
        .positive({ message: 'El estado debe ser positivo' })
        .int({ message: 'El estado debe ser un entero' }),
})

module.exports = {
    PLCSchema,
}
