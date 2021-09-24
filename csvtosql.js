const fs = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter()

;(() => {
  const ctx = {
    _init: new Date(),
    args: process.argv,
  }

  csvtosql.call(ctx)

  emitter.on('start', () => console.log('starting conversion'))
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
      console.log(`source: ${this.source}`)
    }
  }

  fs.access(this.source, fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (this.source === undefined || err) {
      throw new Error(`${this.source} is not readable or writable \n ${err}\n`)
    }
  })

  const isNumber = /^[0-9]+$/
  const isBoolean = /^(true|false)$/
  const isEmpty = /^$/
  const isDecimal = /^[0-9]+\.[0-9]+$/

  let count = 0
  this.statement = ''

  const stream = fs.createReadStream(this.source).pipe(split2())

  stream
    .on('data', (line) => {
      if (count === 0) {
        this.headers = line.split(',').map((col) => {
          return {
            name: removeQuotes(col.toLowerCase()),
            type: '',
          }
        })
      }

      // if column meta is given then remove this
      if (count === 1) {
        line.split(',').forEach((val, index) => {
          this.headers[index].type = 'TEXT'
          //   if (isNumber.test(val)) {
          //     this.headers[index].type = 'INTEGER'
          //   } else if (isBoolean.test(val)) {
          //     this.headers[index].type = 'BOOLEAN'
          //   } else if (isEmpty.test(val)) {
          //     this.headers[index].type = 'TEXT'
          //   } else if (isDecimal.test(val)) {
          //     this.headers[index].type = 'REAL'
          //   } else {
          //     this.headers[index].type = 'TEXT'
          //   }
        })
        console.log(this)
      } else {
        const values = line.split(',').map((val) => {
          switch (val) {
            case val.match(isEmpty):
              return 'NULL'

            case val.match(isNumber):
              return `${removeQuotes(val)}`

            case val.match(isBoolean):
              return `${removeQuotes(val)}`

            default:
              return `'${removeQuotes(val)}'`
          }
        })

        this.statement += `INSERT INTO ${this.tableName} (${this.headers.map(
          (col) => col.name
        )}) VALUES (${values});\n`

        if (line.split(',').find((val) => val === `''`)) {
          console.log(`empty value in line ${count}`)
        }
      }
      count++
    })
    .on('end', () => {
      console.log(`${this.headers.length} headers found`)
      console.log(`${count} lines processed`)
      console.log(`${new Date().getTime() - this._init.getTime()} ms elapsed`)
      const sql = generate()

      fs.writeFile(`./example/${this.tableName}.sql`, sql, (err) => {
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

  const generate = () => {
    const columns = this.headers.map(
      (col) => `${col.name.replace(/\n/g, '')} ${col.type}`
    )
    const create = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columns})`
    return `${create};\n${this.statement}`
  }

  const removeQuotes = (str) => str.trim().replace(/^"(.*)"$/, '$1')
}

module.exports = csvtosql
