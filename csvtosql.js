const fs = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter()
const { spawn } = require('child_process')
;(() => {
  const usage = ` 
${pkjson.name} v${pkjson.version}
${pkjson.description}
c
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

  //   const isNumber = /^[0-9]+$/
  //   const isBoolean = /^(true|false)$/
  //   const isEmpty = /^$/
  //   const isDecimal = /^[0-9]+\.[0-9]+$/

  let count = 0

  const stream = fs.createReadStream(source).pipe(split2()) // splits the stream so each chunk is a line
  const writeStream = fs.createWriteStream(`${table}.sql`) // creates a write stream to write the sql to

  return new Promise((resolve, reject) => {
    stream
      .on('data', (line) => {
        // get first row (column headers)
        if (count === 0) {
          result.headers = line.split(',').map((col) => {
            const cleaned = col.split(' ').join('_').toLowerCase()

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
          if (val.includes("'")) {
            return `"${val}"`
          } else if (val.includes('"')) {
            return `'${val}'`
          }
          return `'${val}'`
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
          //   const init = spawn('sqlite3', [
          //     `${source}.db`,
          //     '-init',
          //     `${table}.sql`,
          //   ])

          //   init.stdout.on('data', (data) => {
          //     console.log(data)
          //   })

          //   init.stderr.on('data', (data) => {
          //     console.error(data)
          //   })

          //   init.on('close', (code) => {
          //     if (code === 0) {
          //       console.log(`${table}.db created`)
          //     } else {
          //       console.error(
          //         `${table}.db could not be created: failed with code: ${code}`
          //       )
          //     }
          //   })
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
  })
}
