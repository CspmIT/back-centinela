const { Client } = require('ssh2')
const fs = require('fs')
const { PLCSchema } = require('../schemas/plc/PlcProfile.Schema')

const conn = new Client()

const serverConfig = {
    host: '192.168.0.62', // Reemplaza con tu IP o dominio
    port: 22,
    username: 'api-3-iot',
    password: 'Celeron233', // O usa claves SSH en lugar de contraseña
}

const filesToUpload = [
    { localPath: 'test.txt', remotePath: '/home/api-3-iot/test.txt' },
    // { localPath: 'archivo2.txt', remotePath: '/home/usuario/archivo2.txt' },
    // { localPath: 'archivo3.txt', remotePath: '/home/usuario/archivo3.txt' },
]

async function execSSHConnection() {
    conn.on('ready', () => {
        console.log('Conectado al servidor')

        conn.sftp((err, sftp) => {
            if (err) throw err

            let uploaded = 0
            filesToUpload.forEach((file) => {
                sftp.fastPut(file.localPath, file.remotePath, (err) => {
                    if (err)
                        console.error(`Error subiendo ${file.localPath}:`, err)
                    else
                        console.log(
                            `Subido: ${file.localPath} → ${file.remotePath}`
                        )

                    uploaded++
                    if (uploaded === filesToUpload.length) {
                        ejecutarComandos()
                    }
                })
            })
        })

        function ejecutarComandos() {
            const comandos = [
                'ls -l',
                'whoami',
                'echo "Ejecutando comandos en el servidor"',
                'uptime',
                'cat /etc/os-release',
            ]

            conn.exec(comandos.join(' && '), (err, stream) => {
                if (err) throw err

                stream
                    .on('close', () => {
                        console.log('Comandos ejecutados, cerrando conexión')
                        conn.end()
                    })
                    .on('data', (data) => {
                        console.log('Salida:\n' + data.toString())
                    })
                    .stderr.on('data', (data) => {
                        console.error('Error:\n' + data.toString())
                    })
            })
        }
    }).connect(serverConfig)
}

const createPLCProfile = (req, res) => {
    const plc = req.body
    const plcProfile = PLCSchema.safeParse(plc)

    if (!plcProfile.success) {
        return res.status(400).json({ message: plcProfile.error.errors })
    }

    return res.status(200).json(plcProfile)
}

module.exports = {
    createPLCProfile,
}
