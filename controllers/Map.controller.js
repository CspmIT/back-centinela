const MapSchema = require('../schemas/maps/Map.Schema')
const MapService = require('../services/MapService')

const createMap = async (req, res) => {
    try {
        const map = req.body
        const { user = false } = req

        if (!user) {
            return res
                .status(403)
                .json({ message: 'Debe estar logeado para hacer esta accion.' })
        }

        const validMap = MapSchema.safeParse(map)
        if (!validMap.success) {
            return res.status(400).json(validMap.error.errors)
        }

        const { newMap, markersData } = await MapService.createMap(
            validMap.data
        )
        return res.status(200).json({ newMap, markersData })
    } catch (error) {
        console.error(error)
        return res.status(500).json(error.message)
    }
}
const editMap = async (req, res) => {
    try {
        const map = req.body
        const { id = false } = req.params
        const { user = false } = req
        if (!user) {
            return res
                .status(403)
                .json({ message: 'Debe estar logeado para hacer esto.' })
        }
        if (!id) {
            return res
                .status(400)
                .json({ message: 'Debe pasar un id para poder actualizar.' })
        }

        const validMap = MapSchema.safeParse(map)

        if (!validMap.success) {
            return res.status(400).json(validMap)
        }
        const { updatedMap, markersData } = await MapService.editMap(
            id,
            validMap.data
        )
        return res.status(200).json({ updatedMap, markersData })
    } catch (error) {
        console.error(error)
        return res.status(500).json(error.message)
    }
}

const getMaps = async (req, res) => {
    try {
        const { user = false } = req
        if (!user) {
            return res
                .status(403)
                .json({ message: 'Debe estar logeado para hacer esta accion.' })
        }

        const maps = await MapService.getAll()
        return res.status(200).json(maps)
    } catch (error) {
        console.error(error)
        return res
            .status(500)
            .json({ message: 'Ocurrio un error al obtener el usuario por id' })
    }
}

const getMapById = async (req, res) => {
    try {
        const { id = false } = req.query
        const { user = false } = req
        if (!id) return res.status(400).json({ message: 'Debe enviar un id' })

        if (!user) {
            return res
                .status(403)
                .json({ message: 'Debe estar logeado para hacer esta accion.' })
        }
        const resolvedMap = await MapService.searchById(id)
        return res.status(200).json(resolvedMap)
    } catch (error) {
        console.error(error)
        return res
            .status(500)
            .json({ message: 'Ocurrio un error al obtener el usuario por id' })
    }
}
module.exports = {
    createMap,
    editMap,
    getMapById,
    getMaps,
}
