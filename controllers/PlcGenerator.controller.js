const fs = require('fs')
const path = require('path')
const { PLCSchema } = require('../schemas/plc/PlcProfile.Schema')
const config_influx = require('../config/config_influx')
const { PLCService } = require('../services/PLCService')
const SSHService = require('./Ssh.controller')

const ssh = new SSHService({
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT,
    username: process.env.SERVER_USERNAME,
    password: process.env.SERVER_PASS,
})

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
Restart=no
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
OnUnitActiveSec=10s
Unit=${data.serviceName}.service

[Install]
WantedBy=timers.target
`
}

// 4. Escribir los archivos localmente.
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

//Elimina los archivos que generados localmente.
const deleteLocalFiles = (serviceName) => {
    const basePath = './files'

    const filesToDelete = [
        path.join(basePath, `${serviceName}.txt`),
        path.join(basePath, `${serviceName}.service`),
        path.join(basePath, `${serviceName}.timer`),
    ]

    filesToDelete.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath)
            } catch (err) {
                console.error(`Error al eliminar archivo ${filePath}:`, err)
            }
        }
    })
}

// Crea los archivos del perfil y los sube al servidor. El estado pasa es 0.
const createPLCProfile = async (req, res) => {
    const plc = req.body
    plc.status = 0
    const plcProfile = PLCSchema.safeParse(plc)

    if (!plcProfile.success) {
        return res.status(400).json({ message: plcProfile.error.errors })
    }

    const files = writeAllFiles(plcProfile.data)

    try {
        await ssh.uploadFiles(files)

        // Mover los archivos .service y .timer a systemd
        const serviceName = plcProfile.data.serviceName
        const commands = [
            `sudo mv /tmp/${serviceName}.service /etc/systemd/system/${serviceName}.service`,
            `sudo mv /tmp/${serviceName}.timer /etc/systemd/system/${serviceName}.timer`,
        ]
        const result = await ssh.executeCommands(commands)

        // Guardar en base de datos
        const { newPLCProfile, pointsData, varsData } = await PLCService.save(
            plcProfile.data
        )

        // Borro los archivos locales
        deleteLocalFiles(plcProfile.data.serviceName)

        return res.status(200).json({
            message: 'Archivos subidos correctamente.',
            sshResult: result,
            plc: newPLCProfile,
            points: pointsData,
            vars: varsData,
        })
    } catch (error) {
        deleteLocalFiles(plcProfile.data.serviceName)
        return res
            .status(500)
            .json({ message: 'Error al subir archivos en ssh' })
    }
}

const editPLCProfile = async (req, res) => {
    const plc = req.body
    const plcProfile = PLCSchema.safeParse(plc)

    if (!plcProfile.success) {
        return res.status(400).json({ message: plcProfile.error.errors })
    }

    const plcToUpdate = await PLCService.searchByID(plcProfile.data.id)
    if (plcToUpdate[0].status === 2) {
        plcProfile.data.status = 0
    }

    const files = writeAllFiles(plcProfile.data)

    try {
        await ssh.uploadFiles(files)

        // Mover los archivos .service y .timer a systemd
        const serviceName = plcProfile.data.serviceName
        const commands = [
            `sudo mv /tmp/${serviceName}.service /etc/systemd/system/${serviceName}.service`,
            `sudo mv /tmp/${serviceName}.timer /etc/systemd/system/${serviceName}.timer`,
        ]
        const result = await ssh.executeCommands(commands)

        // Guardar en base de datos
        const { newPLCProfile, pointsData, varsData } = await PLCService.update(
            plcProfile.data
        )

        // Borro los archivos locales
        deleteLocalFiles(plcProfile.data.serviceName)

        return res.status(200).json({
            message: 'Archivos subidos correctamente.',
            sshResult: result,
            plc: newPLCProfile,
            points: pointsData,
            vars: varsData,
        })
    } catch (error) {
        deleteLocalFiles(plcProfile.data.serviceName)
        return res
            .status(500)
            .json({ message: 'Error al subir archivos en ssh' })
    }
}
// Activa el servicio en el servidor y cambia el estado a 1
const activatePLCProfile = async (req, res) => {
    try {
        const { id } = req.params

        const profile = await PLCService.searchByID(id)

        if (profile[0].status !== 0) {
            const message =
                profile[0].status === 1
                    ? 'Ya esta activo'
                    : 'Los archivos no estan en el servidor'
            return res.status(400).json({
                message: `Este servicio no se puede activar. ${message}`,
            })
        }

        const nameFile = profile[0].serviceName
        const commands = [
            // `sudo systemctl daemon-reload`,
            `sudo systemctl enable ${nameFile}.service`,
            `sudo systemctl start ${nameFile}.service`,
            `sudo systemctl enable ${nameFile}.timer`,
            `sudo systemctl start ${nameFile}.timer`,
        ]
        const result = await ssh.executeCommands(commands)
        console.log(result)
        if (!result.success) {
            return res.status(400).json({
                message:
                    'Ocurrio un error al ejecutar los comandos en el servidor.',
            })
        }

        const dbUpdate = await PLCService.updateStatus(profile[0].id, 1)
        return res.status(200).json({
            message: 'El servicio se activo correctamente.',
            sshResult: result,
            dbResult: dbUpdate,
        })
    } catch (error) {
        console.error(error)
        return res
            .status(400)
            .json({ message: 'No se pudo activar el servicio' })
    }
}

// Desactiva el servicio en el servidor y cambia el estado a 0
const deactivatePLCProfile = async (req, res) => {
    try {
        const { id } = req.params

        const profile = await PLCService.searchByID(id)

        if (profile[0].status !== 1) {
            return res.status(400).json({
                message: 'Este servicio ya fue desactivado.',
            })
        }

        const nameFile = profile[0].serviceName
        const commands = [
            `sudo systemctl stop ${nameFile}.timer`,
            `sudo systemctl stop ${nameFile}.service`,
            `sudo systemctl disable ${nameFile}.timer`,
            `sudo systemctl disable ${nameFile}.service`,
            `sudo systemctl daemon-reload`,
        ]
        const result = await ssh.executeCommands(commands)
        if (!result.success) {
            console.log(result)
            return res.status(400).json({
                message:
                    'Ocurrio un error al ejecutar los comandos en el servidor.',
            })
        }

        const dbUpdate = await PLCService.updateStatus(profile[0].id, 0)
        return res.status(200).json({
            message: 'El servicio se detuvo correctamente.',
            sshResult: result,
            dbResult: dbUpdate,
        })
    } catch (error) {
        console.log(error)
        return res
            .status(400)
            .json({ message: 'No se pudo desactivar el servicio' })
    }
}

// Elimina los archivos del servidor y cambia el estado a 2
const deleteFilePLC = async (req, res) => {
    try {
        const { id } = req.params

        const profile = await PLCService.searchByID(id)
        if (profile[0].status !== 0) {
            return res.status(400).json({
                message:
                    'Primero debe desactivar el plc para poder elimnar el perfil.',
            })
        }
        const nameFile = profile[0].serviceName
        const commands = [
            `sudo rm /etc/systemd/system/${nameFile}.service`,
            `sudo rm /etc/systemd/system/${nameFile}.timer`,
            `sudo rm /home/api-3-iot/PLC_Service/${nameFile}.txt`,
        ]
        const deletedFiles = await ssh.executeCommands(commands)
        if (!deletedFiles.success) {
            console.error(deletedFiles)
            return res.status(500).json({
                message:
                    'Ocurrio un error al eliminar los archivos del servidor',
            })
        }
        const updatePLC = await PLCService.updateStatus(profile[0].id, 2)
        return res.status(200).json({ message: updatePLC })
    } catch (error) {
        console.error(error)
        return res.status(400).json(error)
    }
}

const searchAllPLC = async (req, res) => {
    const PLCProfiles = await PLCService.search()
    res.status(200).json(PLCProfiles)
}

const searchById = async (req, res) => {
    try {
        const { id } = req.params

        const profile = await PLCService.searchByID(id)

        return res.status(200).json(profile)
    } catch (error) {
        console.error(error)
        return res.status(400).json(error)
    }
}

module.exports = {
    createPLCProfile,
    searchAllPLC,
    searchById,
    deleteFilePLC,
    deactivatePLCProfile,
    activatePLCProfile,
    editPLCProfile,
}
