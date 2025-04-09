const { Client } = require('ssh2')
const fs = require('fs')
const path = require('path')
const { PLCSchema } = require('../schemas/plc/PlcProfile.Schema')
const config_influx = require('../config/config_influx')

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

// 1. Crear archivo .txt
const createPerfFile = (data) => {
    const influx = config_influx[data.influx]
    const configSection = `
plc_config_start
INFLUXDB_URL = ${influx.INFLUX_URL}
INFLUXDB_TOKEN : ${influx.INFLUXDB_TOKEN}
INFLUXDB_ORG = ${influx.INFLUX_ORG}
INFLUXDB_BUCKET = ${influx.INFLUX_BUCKET}
topic= ${data.topic}
PLC_model= ${data.PLCModel}
IP_PLC= ${data.ip}
LOG_FILE_PATH = /home/api-3-iot/PLC_Service/${data.serviceName}
RACK = ${data.rack} 
SLOT = ${data.slot}
plc_config_end`

    const pointsSection = `
plc_points_start
${data.points.map((p) => `{${p.startPoint},${p.endPoint}}`).join('\n')}
plc_points_end`

    const varsSection = `
vars_start
${data.vars
    .map((v) => `${v.byte},${v.bit},"${v.type.toLowerCase()}","${v.field}"`)
    .join('\n')}
vars_end`

    return `${configSection}\n${pointsSection}\n${varsSection}`
}

// 2. Crear archivo .service
const createServiceFile = (data) => {
    return `
[Unit]
Description=PLC ${data.serviceName}
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/api-3-iot/PLC_Service/Logo_v2.py /home/api-3-iot/PLC_Service/${data.serviceName}
Restart=always
User=api-3-iot
WorkingDirectory=/home/api-3-iot/PLC_Service/
StandardError=append:/home/api-3-iot/PLC_Service/Logs/${data.serviceName}_error.log

[Install]
WantedBy=multi-user.target
`
}

// 3. Crear archivo .timer
const createTimerFile = (data) => {
    return `
[Unit]
Description=Timer for ${data.serviceName}

[Timer]
OnBootSec=10sec
OnUnitActiveSec=60s
Unit=${data.serviceName}.service

[Install]
WantedBy=timers.target
`
}

const writeAllFiles = (data) => {
    const basePath = './files' // carpeta donde guardar

    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath)

    const perfFilePath = path.join(basePath, `${data.serviceName}.txt`)
    const serviceFilePath = path.join(basePath, `${data.serviceName}.service`)
    const timerFilePath = path.join(basePath, `${data.serviceName}.timer`)

    fs.writeFileSync(perfFilePath, createPerfFile(data).trim())
    fs.writeFileSync(serviceFilePath, createServiceFile(data).trim())
    fs.writeFileSync(timerFilePath, createTimerFile(data).trim())

    return {
        profile: `${basePath}/${data.serviceName}.txt`,
        service: `${basePath}/${data.serviceName}.service`,
        timer: `${basePath}/${data.serviceName}.timer`,
    }
}

const createPLCProfile = async (req, res) => {
    const plc = req.body
    const plcProfile = PLCSchema.safeParse(plc)

    if (!plcProfile.success) {
        return res.status(400).json({ message: plcProfile.error.errors })
    }

    const files = writeAllFiles(plcProfile.data)

    return res.status(200).json(files)
}

module.exports = {
    createPLCProfile,
}
