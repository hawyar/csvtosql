const fs = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter()
// const { exec } = require('child_process')

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
        ctx.table = ctx.source
          .split('/')
          .pop()
          .split('.')[0]
          .toLowerCase()
          .replace(/\s/g, '_')
      }

      console.log(`source: ${ctx.source}`)
    } else {
      process.stderr.write(`Include the source file path \n`)
      process.exit(1)
    }

    // pass the current context to the csvtosql function
    csvtosql.call(ctx)
  } else {
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
    columns: '',
  }

  fs.access(source, fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (source === '' || err) {
      throw new Error(`${source} is not readable or writable \n ${err}\n`)
    }
  })

  //   const isNumber = /^[0-9]+$/
  //   const isBoolean = /^(true|false)$/
  //   const isEmpty = /^$/
  //   const isDecimal = /^[0-9]+\.[0-9]+$/

  let count = 0

  const csvStream = fs.createReadStream(source).pipe(split2()) // each line is a chunk
  const sqlStream = fs.createWriteStream(`${source.split('.')[0]}.sql`)

  emitter.on('start', () => console.log('starting conversion'))

  return new Promise((resolve, reject) => {
    csvStream
      .on('data', (line) => {
        // get first row (column headers)
        if (count === 0) {
          result.headers = line.split(',').map((col) => {
            const cleaned = col.split(' ').join('_').toLowerCase()

            return {
              name: cleaned,
              type: 'TEXT', // default type
            }
          })

          const columns = result.headers
            .map(
              (col, i) =>
                i === 0
                  ? `${col.name.replace(/\n/g, '')} ${col.type}`
                  : ` ${col.name.replace(/\n/g, '')} ${col.type}` // add space between columns
            )
            .join(',')

          sqlStream.write(`CREATE TABLE IF NOT EXISTS ${table} (${columns});\n`)
        } else {
          const splitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/

          const values = line
            .split(splitRegex)
            .map((val) => {
              let cleaned = val.trim().split('"').join('')

              if (val.includes("'")) {
                cleaned.replace(/'/g, "''")
              }

              if (val.includes('"')) {
                cleaned.replace(/"/g, '""')
              }

              return `"${cleaned}"`
            })
            .join(',')

          const insert = `INSERT INTO ${table} VALUES (${values});\n`

          sqlStream.write(insert, (err) => {
            if (err) {
              console.log(err)
            }
          })

          // this will cause RangeError max var szie
          // result.sql += insert
        }
        count++
      })
      .on('end', () => {
        console.log(`${result.headers.length} headers found`)
        console.log(`${count} lines processed`)
        console.log(`${table}.sql created`)

        sqlStream.end()
        csvStream.destroy()

        if (process.argv.length > 2) {
          resolve(result)
          process.exit(0)
        }
      })
      .once('readable', () => {
        emitter.emit('start')
      })
      .on('error', (err) => {
        if (process.argv.length > 2) {
          process.stderr.write(`${err}\n`)
          reject(err)
          process.exit(1)
        }
      })
  })
}
