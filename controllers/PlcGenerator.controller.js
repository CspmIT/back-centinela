const { Client } = require('ssh2')
const fs = require('fs')
const path = require('path')
const { PLCSchema } = require('../schemas/plc/PlcProfile.Schema')
const config_influx = require('../config/config_influx')
const { PLCService } = require('../services/PLCService')

const conn = new Client()

const serverConfig = {
    host: '192.168.0.62', // Reemplaza con tu IP o dominio
    port: 22,
    username: 'only-ssh-user',
    password: 'WUDgzP*coPt$xjXEH4Q*', // O usa claves SSH en lugar de contraseña
}

async function execSSHConnection(filesToUpload, serviceName) {
    return new Promise((resolve, reject) => {
        conn.on('ready', () => {
            console.log('Conectado al servidor')

            conn.sftp((err, sftp) => {
                if (err) return reject(err)

                let uploaded = 0

                filesToUpload.forEach((file) => {
                    sftp.fastPut(file.localPath, file.remotePath, (err) => {
                        if (err) {
                            console.error(
                                `Error subiendo ${file.localPath}:`,
                                err
                            )
                            throw new Error(
                                `Error subiendo ${file.localPath}: ${err}`
                            )
                        } else {
                            console.log(
                                `Subido: ${file.localPath} → ${file.remotePath}`
                            )
                        }

                        uploaded++
                        if (uploaded === filesToUpload.length) {
                            ejecutarComandos(serviceName)
                        }
                    })
                })

                function ejecutarComandos(serviceName) {
                    const comandos = [
                        `sudo mv /tmp/${serviceName}.service /etc/systemd/system/${serviceName}.service`,
                        `sudo mv /tmp/${serviceName}.timer /etc/systemd/system/${serviceName}.timer`,
                        `sudo systemctl daemon-reload`,
                        `sudo systemctl enable ${serviceName}.service`,
                        `sudo systemctl start ${serviceName}.service`,
                        `sudo systemctl enable ${serviceName}.timer`,
                        `sudo systemctl start ${serviceName}.timer`,
                    ]

                    conn.exec(comandos.join(' && '), (err, stream) => {
                        if (err) return reject(err)

                        let stdout = ''
                        let stderr = ''

                        stream
                            .on('close', () => {
                                console.log(
                                    'Comandos ejecutados, cerrando conexión'
                                )
                                conn.end()
                                resolve({
                                    success: stderr.length === 0,
                                    output: stdout,
                                    errorOutput: stderr,
                                })
                            })
                            .on('data', (data) => {
                                console.log('exito' + data)
                                stdout += data.toString()
                            })
                            .stderr.on('data', (data) => {
                                console.log('error' + data)
                                stderr += data.toString()
                            })
                    })
                }
            })
        }).connect(serverConfig)
    })
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
ExecStart=/usr/bin/python3 /home/api-3-iot/PLC_Service/Logo_v2.py /home/api-3-iot/PLC_Service/${data.serviceName}.txt
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

    return [
        {
            localPath: `${basePath}/${data.serviceName}.txt`,
            remotePath: `/home/api-3-iot/PLC_Service/${data.serviceName}.txt`,
        },
        {
            localPath: `${basePath}/${data.serviceName}.service`,
            remotePath: `/tmp/${data.serviceName}.service`,
        },
        {
            localPath: `${basePath}/${data.serviceName}.timer`,
            remotePath: `/tmp/${data.serviceName}.timer`,
        },
    ]
}

const createPLCProfile = async (req, res) => {
    const plc = req.body
    const plcProfile = PLCSchema.safeParse(plc)

    if (!plcProfile.success) {
        return res.status(400).json({ message: plcProfile.error.errors })
    }

    const files = writeAllFiles(plcProfile.data)

    try {
        const result = await execSSHConnection(
            files,
            plcProfile.data.serviceName
        )

        const { newPLCProfile, pointsData, varsData } = await PLCService.save(
            plcProfile.data
        )

        return res.status(200).json({
            message: 'Perfil creado y archivos subidos correctamente',
            sshResult: result,
            plc: newPLCProfile,
            points: pointsData,
            vars: varsData,
        })
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al subir archivos en ssh' }, error)
    }
}

const searchAllPLC = async (req, res) => {
    const PLCProfiles = await PLCService.search()
    res.status(200).json(PLCProfiles)
}

module.exports = {
    createPLCProfile,
    searchAllPLC,
}
