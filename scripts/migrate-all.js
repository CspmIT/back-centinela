require('dotenv').config()
const { spawnSync } = require('node:child_process')

const names = (process.env.DB_NAMES || '')
	.split(',')
	.map((n) => n.trim())
	.filter(Boolean)

if (names.length === 0) {
	console.error('DB_NAMES is empty. Set a comma-separated list in .env, e.g. DB_NAMES=centinela_adeco,centinela_foo')
	process.exit(1)
}

const args = ['sequelize-cli', 'db:migrate', '--env', 'centinela', '--config', 'config/config.js']

for (const db of names) {
	console.log(`\n=== Migrating ${db} ===`)
	const result = spawnSync('npx', args, {
		stdio: 'inherit',
		shell: true,
		env: { ...process.env, DB_NAME: db },
	})
	if (result.status !== 0) {
		console.error(`\nMigration failed on ${db}. Stopping.`)
		process.exit(result.status ?? 1)
	}
}

console.log(`\nAll ${names.length} databases migrated successfully.`)
