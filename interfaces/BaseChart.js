class BaseChart {
    constructor(name, type, id) {
        ;(this.id = id || null), (this.name = name), (this.type = type)
    }
}

class ConfigChart extends BaseChart {
    constructor(allowedConfigKeys, allowedConfigValues, id) {
        super(id)
        ;(this.allowedConfigKeys = allowedConfigKeys),
            (this.allowedConfigValues = allowedConfigValues)
    }
}

class LiquidFill extends ConfigChart {
    constructor(
        id,
        border,
        color,
        maxValue,
        porcentage,
        idVar,
        shape,
        title,
        unidad
    ) {
        super(
            [
                'border',
                'color',
                'maxValue',
                'porcentage',
                'idVar',
                'shape',
                'title',
                'unidad',
            ],
            {
                border,
                color,
                maxValue,
                porcentage,
                idVar,
                shape,
                title,
                unidad,
            },
            id
        )
    }
}
