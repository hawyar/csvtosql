const fs = require('fs')
const split2 = require('split2')
const events = require('events')
const pkjson = require('./package.json')
const emitter = new events.EventEmitter()

const usage = ` 
	${pkjson.name} v${pkjson.version}
	${pkjson.description}
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	\n`

;(() => {
  // if used thru cli
  if (process.argv.length > 2) {
    let ctx = {
      source: '',
      table: '',
    }

    const args = process.argv

    if (args.find((arg) => arg === '--help' || arg === '-h')) {
      process.stdout.write(usage)
      process.exit(0)
    }

    if (args.find((arg) => arg === '--version' || arg === '-v')) {
      process.stdout.write(`${pkjson.name} v${pkjson.version}\n`)
      process.exit(0)
    }
    if (args.find((arg) => arg === '--source' || arg === '-s')) {
      ctx.source =
        args[args.indexOf('--source') + 1] || args[args.indexOf('-s') + 1]

      if (args.find((arg) => arg === '--table' || arg === '-t')) {
        ctx.table =
          args[args.indexOf('--table') + 1] || args[args.indexOf('-t') + 1]
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
    statement: '',
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

  // splits the stream so each chunk is a line
  const stream = fs.createReadStream(source).pipe(split2())

  return new Promise((resolve, reject) => {
    stream
      .on('data', (line) => {
        // get header row
        if (count === 0) {
          result.headers = line.split(',').map((col) => {
            return {
              name: removeQuotes(col.toLowerCase()),
              type: '',
            }
          })
        }
        // maybe ask for column meta to avoid this
        if (count === 1) {
          line.split(',').forEach((val, index) => {
            result.headers[index].type = 'TEXT'
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
        } else {
          const values = line.split(',').map((val) => {
            const cleaned = removeQuotes(val)
            switch (val) {
              case val.match(isEmpty):
                return 'NULL'

              case val.match(isNumber):
                return `${cleaned}`

              case val.match(isBoolean):
                return `${cleaned}`

              default:
                return `'${cleaned}'`
            }
          })

          result.statement += `INSERT INTO ${table} (${result.headers.map(
            (col) => col.name
          )}) VALUES (${values});\n`

          if (line.split(',').find((val) => val === `''`)) {
            console.log(`empty value in line ${count}`)
          }
        }
        count++
      })
      .on('end', () => {
        console.log(`${result.headers.length} headers found`)
        console.log(`${count} lines processed`)

        const sql = generate()

        if (process.argv.length > 2) {
          fs.writeFile(`./example/${table}.sql`, sql, (err) => {
            if (err) throw err
            console.log('SQL file created')
          })
          stream.destroy()
          process.exit(0)
        } else {
          result.sql = sql
          resolve(result)
        }
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
    const generate = () => {
      const columns = result.headers.map(
        (col) => `${col.name.replace(/\n/g, '')} ${col.type}`
      )
      const create = `CREATE TABLE IF NOT EXISTS ${table} (${columns})`
      return `${create};\n${result.statement}`
    }
    const removeQuotes = (str) => str.trim().replace(/^"(.*)"$/, '$1')
  })
}