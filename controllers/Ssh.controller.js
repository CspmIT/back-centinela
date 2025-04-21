const { Client } = require('ssh2')

class SSHService {
    constructor(config) {
        this.config = config
    }

    uploadFiles(files) {
        return new Promise((resolve, reject) => {
            const conn = new Client()

            conn.on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) return reject(err)

                    let uploaded = 0

                    files.forEach((file) => {
                        sftp.fastPut(file.localPath, file.remotePath, (err) => {
                            if (err) {
                                console.error(
                                    `Error subiendo ${file.localPath}:`,
                                    err
                                )
                                return reject(
                                    new Error(
                                        `Error subiendo ${file.localPath}: ${err}`
                                    )
                                )
                            }

                            uploaded++
                            if (uploaded === files.length) {
                                conn.end()
                                resolve()
                            }
                        })
                    })
                })
            })

            conn.on('error', reject).connect(this.config)
        })
    }

    executeCommands(commands) {
        return new Promise((resolve, reject) => {
            const conn = new Client()

            conn.on('ready', () => {
                conn.exec(commands.join(' && '), (err, stream) => {
                    if (err) return reject(err)

                    let stdout = ''
                    let stderr = ''

                    stream
                        .on('close', (code, signal) => {
                            conn.end()

                            const expectedStderrPatterns = [
                                /Created symlink/,
                                /warning/i, // opcional: incluir warnings no fatales
                            ]

                            const isExpectedError =
                                expectedStderrPatterns.every((pattern) =>
                                    stderr ? pattern.test(stderr) : true
                                )

                            const success = code === 0 || isExpectedError

                            resolve({
                                success,
                                output: stdout.trim(),
                                errorOutput: stderr.trim(),
                            })
                        })
                        .on('data', (data) => {
                            stdout += data.toString()
                        })
                        .stderr.on('data', (data) => {
                            stderr += data.toString()
                        })
                })
            })

            conn.on('error', reject).connect(this.config)
        })
    }
}

module.exports = SSHService
