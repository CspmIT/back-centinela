const { db } = require('../models')
const {
    getMenus,
    saveMenu,
    listPermissionUser,
    saveMenu_Selected,
} = require('../services/MenuService')
const {
    getAllUser,
    getAllUserPass,
    getAllProfile,
} = require('../services/UserService')

async function getListUser(req, res) {
    try {
        const listUser = await getAllUser(req.db)
        return res.status(200).json(listUser)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

async function getProfiles(req, res) {
    try {
        const listProfile = await getAllProfile(req.db)
        return res.status(200).json(listProfile)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

async function getAllMenu(req, res) {
    try {
        const menus = await getMenus(req.db)
        return res.status(200).json(menus)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

async function abmMenu(req, res) {
    let transaction
    try {
        db = req.db
        // Inicia la transacción
        transaction = await db.sequelize.transaction()
        // Validaciones previas
        if (!req.body.name || !req.body.level || !req.body.group_menu) {
            return res
                .status(400)
                .json({ message: 'Se solicita completar todos los campos.' })
        }
        const Menu = await saveMenu(req.body, transaction, req.db)
        if (!Menu) throw new Error('Error al guardar la contraseña.')
        // Si todo está bien, se confirma la transacción
        await transaction.commit()
        res.status(200).json(Menu)
    } catch (error) {
        // Si ocurre algún error, se revierte la transacción
        if (transaction) await transaction.rollback()
        // Manejo de errores
        if (error.errors) {
            return res.status(500).json({ errors: error.errors })
        } else {
            return res.status(400).json({ message: error.message })
        }
    }
}
async function deleteMenu(req, res) {
    let transaction
    try {
        const db = req.db
        // Inicia la transacción
        transaction = await db.sequelize.transaction()
        let Menu = true
        for (const element of req.body) {
            // Validaciones previas
            if (!element.name || !element.level || !element.group_menu) {
                return res.status(400).json({
                    message: 'Se solicita completar todos los campos.',
                })
            }
            Menu = await saveMenu(element, transaction)
            if (!Menu) throw new Error('Error al guardar la contraseña.')
        }
        // Si todo está bien, se confirma la transacción
        await transaction.commit()
        res.status(200).json(Menu)
    } catch (error) {
        // Si ocurre algún error, se revierte la transacción
        if (transaction) await transaction.rollback()
        // Manejo de errores
        if (error.errors) {
            return res.status(500).json({ errors: error.errors })
        } else {
            return res.status(400).json({ message: error.message })
        }
    }
}

async function getListUserPass(req, res) {
    try {
        const listUser = await getAllUserPass(req.db)

        return res.status(200).json(listUser)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

async function getPermission(req, res) {
    try {
        if (!req.query.type || !req.query.id || !req.query.profile)
            return res
                .status(400)
                .json({ message: 'Se solicita completar todos los campos.' })
        const menus = await listPermissionUser(req.query, req.db)
        return res.status(200).json(menus)
    } catch (error) {
        if (error.errors) {
            res.status(500).json(error.errors)
        } else {
            res.status(400).json(error.message)
        }
    }
}

async function savePermission(req, res) {
    let transaction
    try {
        const db = req.db
        // Inicia la transacción
        transaction = await db.sequelize.transaction()
        let Menu_selected = true
        for (const element of req.body) {
            // Validaciones previas
            if (!element.id_menu) {
                return res.status(400).json({
                    message: 'Se solicita enviar el identificador del menu.',
                })
            }
            Menu_selected = await saveMenu_Selected(element, transaction, req.db)
            if (!Menu_selected)
                throw new Error('Error al guardar la contraseña.')
        }
        // Si todo está bien, se confirma la transacción
        await transaction.commit()
        res.status(200).json(Menu_selected)
    } catch (error) {
        // Si ocurre algún error, se revierte la transacción
        if (transaction) await transaction.rollback()
        // Manejo de errores
        if (error.errors) {
            return res.status(500).json({ errors: error.errors })
        } else {
            return res.status(400).json({ message: error.message })
        }
    }
}

module.exports = {
    getListUser,
    getProfiles,
    getAllMenu,
    abmMenu,
    deleteMenu,
    getPermission,
    savePermission,
    getListUserPass,
}
