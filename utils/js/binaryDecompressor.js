function intToPaddedBits(value, length = 8) {
    let bits = (value >>> 0).toString(2);
    bits = bits.padStart(length, '0');
    return bits.split('');
}

function mapBitsToBombs(compressedValue, bitRows, length = 8) {
    const bitArray = intToPaddedBits(compressedValue, length);

    return bitRows.map(r => ({
        id_bit: r.id,
        bit: r.name,            
        value: Boolean(bitArray[length - 1 - r.bit] === '1')
        // ↑ inverti el índice porque el bit 0 es el menos significativo.
        // `length - 1 - r.bit` alinea para leer de izquierda a derecha del string.
    }));
}

module.exports = { intToPaddedBits, mapBitsToBombs };
