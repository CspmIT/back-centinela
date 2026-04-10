const CHART_DIMENSIONS = {
    LiquidFillPorcentaje: { w: 2, h: 3 },
    CirclePorcentaje:     { w: 2, h: 3 },
    GaugeSpeed:           { w: 2, h: 3 },
    BooleanChart:         { w: 2, h: 3 },
    MultipleBooleanChart: { w: 4, h: 3 },
    DoughnutChart:        { w: 2, h: 3 },
    PumpControl:          { w: 3, h: 3 },
    default:              { w: 2, h: 3 },
}

const getChartDimensions = (chartType) =>
    CHART_DIMENSIONS[chartType] ?? CHART_DIMENSIONS.default

const getDashboard = async (userId, db) => {
    try {

        const layouts = await db.UserDashboardLayout.findAll({
            where: {
                user_id: userId,
                visible: true
            },
            include: [
                {
                    association: 'Chart',
                    include: [
                        { association: 'ChartConfig' },
                        { association: 'ChartData', include: [{ association: 'InfluxVars' }] },
                        { association: 'BombsData', include: [{ association: 'InfluxVars' }] },
                        { association: 'ChartSeriesData', include: [{ association: 'InfluxVars' }] },
                        { association: 'ChartPieData', include: [{ association: 'InfluxVars' }] }
                    ]
                }
            ],
            order: [['y', 'ASC'], ['x', 'ASC']]
        })

        return layouts

    } catch (error) {
        console.error('getDashboard:', error)
        throw error
    }
}

const saveDashboardLayout = async (userId, layouts, db) => {
    const transaction = await db.sequelize.transaction()

    try {

        for (const layout of layouts) {
            const { id, x, y, w, h } = layout

            await db.UserDashboardLayout.update(
                { x, y, w, h },
                {
                    where: {
                        id: id,
                        user_id: userId,
                    },
                    transaction
                }
            )
        }

        await transaction.commit()

        return { success: true }

    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

const findFreePosition = async (userId, db, newW = 4, newH = 2) => {
    const layouts = await db.UserDashboardLayout.findAll({
        where: { user_id: userId, visible: true }
    })
    const items = layouts.map(l => l.toJSON())
    const COLS = 12

    for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= COLS - newW; x++) {
            const collision = items.some(item =>
                !(x + newW <= item.x || x >= item.x + item.w ||
                  y + newH <= item.y || y >= item.y + item.h)
            )
            if (!collision) return { x, y }
        }
    }
    return { x: 0, y: 0 }
}

const addChartToDashboard = async ({ userId, chartId, db }) => {
    try {
        const chart = await db.Chart.findByPk(chartId)
        const { w, h } = getChartDimensions(chart?.type)

        const exists = await db.UserDashboardLayout.findOne({
            where: { user_id: userId, chart_id: chartId }
        })

        if (exists) {
            const { x, y } = await findFreePosition(userId, db, exists.w, exists.h)
            await exists.update({ visible: true, x, y })
            return exists
        }

        const { x, y } = await findFreePosition(userId, db, w, h)

        return await db.UserDashboardLayout.create({
            user_id: userId,
            chart_id: chartId,
            x, y, w, h,
            visible: true
        })
    } catch (error) {
        console.error('addChartToDashboard:', error)
        throw error
    }
}

const removeChartFromDashboard = async ({ userId, chartId, db }) => {
    try {

        await db.UserDashboardLayout.update(
            { visible: false },
            {
                where: {
                    id: chartId,
                    user_id: userId,
                }
            }
        )

        return { success: true }

    } catch (error) {
        console.error('removeChartFromDashboard:', error)
        throw error
    }
}

module.exports = {
    getDashboard,
    saveDashboardLayout,
    addChartToDashboard,
    removeChartFromDashboard
}