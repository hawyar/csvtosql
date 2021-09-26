const fs = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter() // for better progress logging later

;(() => {
  const usage = ` 
${pkjson.name} v${pkjson.version}
${pkjson.description}

Usage:
  csvtosql [options] <source>

  Options:
      --source [file] select the source file or directory
      --help get help
      --version, get the current version
    \n`
  // if used thru cli
  if (process.argv.length > 2) {
    let ctx = {
      source: '',
      table: '',
    }

    const { argv } = process

    if (argv.find((arg) => arg === '--help')) {
      process.stdout.write(usage)
      process.exit(0)
    }

    if (argv.find((arg) => arg === '--version')) {
      process.stdout.write(`${pkjson.name} v${pkjson.version}\n`)
      process.exit(0)
    }

    if (argv.find((arg) => arg === '--source')) {
      ctx.source = argv[argv.indexOf('--source') + 1]

      if (argv.find((arg) => arg === '--table')) {
        ctx.table = argv[argv.indexOf('--table') + 1]
      } else {
        ctx.table = ctx.source.split('/').pop().split('.')[0].toLowerCase()
      }

      console.log(`source: ${ctx.source}`)
    } else {
      process.stderr.write(`Include the source file path \n`)
      process.exit(1)
    }

    // then pass the current context to the csvtosql function
    csvtosql.call(ctx)
    emitter.on('start', () => console.log('starting conversion'))
  } else {
    // if used as a module
    module.exports = csvtosql
  }
})()

async function csvtosql(ctx) {
  if (!ctx) {
    ctx = this
  }
  const { source, table } = ctx

  let result = {
    headers: [],
    sql: '',
  }

  fs.access(source, fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (source === '' || err) {
      throw new Error(`${source} is not readable or writable \n ${err}\n`)
    }
  })

  const isNumber = /^[0-9]+$/
  const isBoolean = /^(true|false)$/
  const isEmpty = /^$/
  //   const isDecimal = /^[0-9]+\.[0-9]+$/

  let count = 0

  const stream = fs.createReadStream(source).pipe(split2()) // splits the stream so each chunk is a line
  const writeStream = fs.createWriteStream(`example/${table}.sql`) // creates a write stream to write the sql to

  return new Promise((resolve, reject) => {
    stream
      .on('data', (line) => {
        // get first row (column headers)
        if (count === 0) {
          result.headers = line.split(',').map((col) => {
            const cleaned = col
              .trim()
              .replace(/[^a-zA-Z0-9]/g, '')
              .toLowerCase()

            return {
              name: cleaned,
              type: 'TEXT', // maybe ask for column meta for better types
            }
          })

          const create = () => {
            const columns = result.headers.map(
              (col, i) =>
                i === 0
                  ? `${col.name.replace(/\n/g, '')} ${col.type}`
                  : ` ${col.name.replace(/\n/g, '')} ${col.type}` // add a space between each column
            )
            return `CREATE TABLE IF NOT EXISTS ${table} (${columns}); \n`
          }

          writeStream.write(create())
          result.sql += create()
        }

        const values = line.split(',').map((val) => {
          const cleaned = removeQuotes(val)
          switch (val) {
            case val.match(isEmpty):
              return 'NULL'

            case val.match(isNumber):
              return `'${cleaned}'`

            case val.match(isBoolean):
              return `'${cleaned}'`

            default:
              return `'${cleaned}'`
          }
        })

        const insert = `INSERT INTO ${table} (${result.headers.map(
          (col) => col.name
        )}) VALUES (${values}); \n`

        writeStream.write(insert)

        result.sql += insert

        count++
      })
      .on('end', () => {
        console.log(`${result.headers.length} headers found`)
        console.log(`${count} lines processed`)
        console.log(`${table}.sql created`)

        writeStream.end()

        stream.destroy()

        if (process.argv.length > 2) {
          process.exit(0)
        }
        resolve(result)
      })
      .once('readable', () => {
        emitter.emit('start')
      })
      .on('error', (err) => {
        if (process.argv.length > 2) {
          process.stderr.write(`${err}\n`)
          process.exit(1)
        }
        reject(err)
      })

    const removeQuotes = (str) => str.trim().replace(/^"(.*)"$/, '$1')
  })
}
