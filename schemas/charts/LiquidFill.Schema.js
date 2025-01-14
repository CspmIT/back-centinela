const { z } = require('zod')

const LiquidFillSchema = z
    .object({
        type: z.string({ message: 'type is required' }).min(1).max(255),
        border: z.boolean({ message: 'bordre debe ser booleano' }),
        color: z.string({ message: 'color debe ser strign' }).min(3).max(255),
        maxValue: z.number({ message: 'maxValue debe ser un numero' }),
        porcentage: z.boolean({ message: 'porcentage debe ser booleano' }),
        idVar: z.number({ message: 'idVar debe ser un numero' }),
        shape: z.string({ message: 'shape debe ser string' }).min(1).max(255),
        title: z.string({ message: 'title debe ser string ' }).min(1).max(255),
        unidad: z.string({ message: 'unidad debe ser string' }).optional(),
    })
    .refine(
        (data) => {
            if (!data.porcentage) {
                // Valido que data.unidad sea requerido si data.porcentage es false
                if (data.unidad !== undefined && data.unidad.length === 0) {
                    return false
                }
            }
            return true
        },
        {
            message: 'unidad es requerido si porcentage es false',
            path: ['unidad'],
        }
    )

module.exports = {
    LiquidFillSchema,
}
