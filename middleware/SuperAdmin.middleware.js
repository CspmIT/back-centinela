const verifySuperAdmin = (req, res, next) => {
    const { profile } = req.user
    if (profile !== 4) {
        return res.status(403).json('No tenés permisos para realizar esta acción')
    }
    next()
}

module.exports = { verifySuperAdmin }