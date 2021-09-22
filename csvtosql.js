const { access } = require('fs/promises')
const { constants, createReadStream } = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter()
const fs = require('fs')

;(() => {
  const ctx = {
    _init: new Date(),
    args: process.argv,
  }

  emitter.on('start', () => console.log('starting conversion'))

  csvtosql.call(ctx)
})()

async function csvtosql() {
  const { args } = this

  const usage = () =>
    process.stdout.write(` 
	${pkjson.name} v${pkjson.version}
	${pkjson.description}
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	\n`)

  if (args.length < 3) {
    usage()
    process.exit(1)
  }
  if (args.find((arg) => arg === '--help' || arg === '-h')) {
    usage()
    process.exit(0)
  }

  if (args.find((arg) => arg === '--version' || arg === '-v')) {
    process.stdout.write(`${pkjson.name} v${pkjson.version}\n`)
    process.exit(0)
  }

  if (args.find((arg) => arg === '--source' || arg === '-s')) {
    if (
      args[args.indexOf('--source') + 1] === undefined ||
      args[args.indexOf('-s') + 1] === undefined
    ) {
      process.stdout.write(
        `--source | -s [dir] select the source file or directory \n`
      )
    } else if (args[args.indexOf('-s') + 1].endsWith('.csv')) {
      this.source = args[args.indexOf('-s') + 1]
      this.tableName = this.source.split('/').pop().split('.')[0].toLowerCase()
      console.log(`source ${this.source}`)
    }
  }

  await access(this.source, constants.R_OK | constants.W_OK).catch((e) => {
    // new Error to send back stack trace
    throw new Error(`${this.source} is not readable or writable \n ${e}\n`)
  })

  let count = 0
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isNumber = /^[0-9]+$/
  const isDate = /^\d{4}-\d{2}-\d{2}$/
  const isTime = /^\d{2}:\d{2}:\d{2}$/
  const isDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
  const isBoolean = /^(true|false)$/
  const isString = /^[^\s]+$/
  const isEmpty = /^$/

  createReadStream(this.source)
    .pipe(split2())
    .on('data', (line) => {
      count++
      if (count === 1) {
        this.headers = line.split(',').map((col) => {
          if (col.match(/^[0-9]+$/)) return `${col} INT`
          if (col.match(/^[0-9]+\.[0-9]+$/)) return `${col} FLOAT`
          if (col.match(isEmail)) return `${col.toLowerCase()} TEXT`
          if (col.match(isNumber)) return `${col} INT`
          if (col.match(isDate)) return `${col} DATE`
          if (col.match(isTime)) return `${col} TIME`
          if (col.match(isDateTime)) return `${col} DATETIME`
          if (col.match(isBoolean)) return `${col} BOOLEAN`
          if (col.match(isString)) return `${col.toLowerCase()} TEXT`
          if (col.match(isEmpty)) return `${col.toLowerCase()} TEXT`
          return `${col.toLowerCase()} TEXT`
        })
      } else {
        const values = line.split(',').map((val) => {
          if (val.match(isEmail)) return `'${val}'`
          if (val.match(isNumber)) return `${val}`
          if (val.match(isDate)) return `'${val}'`
          if (val.match(isTime)) return `'${val}'`
          if (val.match(isDateTime)) return `'${val}'`
          if (val.match(isBoolean)) return `${val}`
          if (val.match(isString)) return `'${val}'`
          if (val.match(isEmpty)) return `NULL`
          return `'${val}'`
        })
        const sql = `INSERT INTO ${this.tableName} (${this.headers.join(
          ','
        )}) VALUES (${values.join(',')}); \n \n`
        this.sql += sql
      }
    })
    .on('end', () => {
      console.log(`File processed ${this.source}`)
      console.log(`${this.headers.length} headers found`)
      console.log(`${count} lines processed`)
      console.log(`${new Date().getTime() - this._init.getTime()} ms elapsed`)
      const sql = generateSQL()

      fs.writeFile('./insert.sql', sql, (err) => {
        if (err) throw err
        console.log('SQL file created')
      })
    })
    .once('readable', () => {
      emitter.emit('start')
    })
    .on('error', (err) => {
      throw new Error(err)
    })

  const generateSQL = () => {
    const inStatement = `${this.headers.map((h) => `${h}`)}`
    const create = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${inStatement})`
    return `${create};\n${this.sql}`
  }
}

module.exports = csvtosql
