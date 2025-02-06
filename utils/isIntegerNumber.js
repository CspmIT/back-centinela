const isValidId = (id) => {
    return isNaN(id) || Number.isInteger(Number(id))
}

module.exports = {
    isValidId,
}
