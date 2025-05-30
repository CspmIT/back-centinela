const { z } = require('zod')
const categories = z.object({
    name: z.string().min(1, 'La categoría es obligatoria'),
    color: z.string().min(1, 'El color es obligatorio'),
    var_id: z.number().min(1, 'El valor es obligatorio'),
})

const DoughnutChartschema = z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    categories: z.array(categories),
})

module.exports = { DoughnutChartschema }
