const { db } = require('../models')
const {
    getMenus,
    saveMenu,
    listPermissionUser,
    saveMenu_Selected,
    getPermissionByMenuService,
    postPermissionByMenuService
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
        const db = req.db
        transaction = await db.sequelize.transaction()
        if (!req.body.name || !req.body.level) {
            return res
                .status(400)
                .json({ message: 'Se solicita completar todos los campos.' })
        }
        const Menu = await saveMenu(req.body, transaction, req.db)
        if (!Menu) throw new Error('Error al guardar la contraseña.')

        await transaction.commit()
        res.status(200).json(Menu)
    } catch (error) {
        if (transaction) await transaction.rollback()
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
            let Menu = null
            for (const element of req.body) {
                // Validaciones mínimas
                if (!element.id) {
                    throw new Error('ID de menú requerido para eliminar')
                }

                // Soft delete (status = 0)
                const payload = {
                    ...element,
                    status: 0
                }

                Menu = await saveMenu(payload, transaction, db)
                if (!Menu) throw new Error('Error al guardar la contraseña.')
            }
            // Si todo está bien, se confirma la transacción
            await transaction.commit()
            return res.status(200).json({
                ok: true,
                data: Menu
            })
        } catch (error) {
        if (transaction) await transaction.rollback()
       
        console.error('deleteMenu error:', error)
        
        return res.status(500).json({
			ok: false,
			message: error.message || 'Error al eliminar menú'
		})
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

const getPermissionByMenu = async (req, res) => {
    try {
        const { id_menu } = req.query

        if (!id_menu) {
            return res.status(400).json({
                ok: false,
                message: 'id_menu es requerido',
            })
        }

        const data = await getPermissionByMenuService(id_menu, req.db)

        return res.json({
            ok: true,
            data,
        })
    } catch (error) {
        console.error('getPermissionByMenuController error:', error)
        return res.status(500).json({
            ok: false,
            message: 'Error obteniendo permisos del menú',
        })
    }
}

async function postPermissionByMenu(req, res) {
    let transaction
    try {
        const db = req.db
        const { id_menu, profiles } = req.body

        // Validaciones
        if (!id_menu) {
            return res.status(400).json({
                ok: false,
                message: 'id_menu es obligatorio',
            })
        }

        if (!Array.isArray(profiles)) {
            return res.status(400).json({
                ok: false,
                message: 'profiles debe ser un array de id_profile',
            })
        }

        transaction = await db.sequelize.transaction()

        const result = await postPermissionByMenuService(
            { id_menu, profiles },
            transaction,
            db
        )

        await transaction.commit()

        return res.status(200).json({
            ok: true,
            data: result,
        })
    } catch (error) {
        if (transaction) await transaction.rollback()

        console.error('postPermissionByMenu error:', error)

        return res.status(500).json({
            ok: false,
            message: error.message || 'Error al guardar permisos',
        })
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
    getPermissionByMenu,
    postPermissionByMenu
}
