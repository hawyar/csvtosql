// import fs from 'fs/promises'
// import split2 from 'split2'
import events from 'events'

const emitter = new events.EventEmitter()

;(() => {
  const ctx = {
    _init: new Date(),
    args: process.argv,
  }
  csvtosql.call(ctx)
  emitter.emit('start', ctx)
})()

function csvtosql() {
  const { args } = this

  const usage = () =>
    process.stdout.write(` 
Please provide a path to the file you want to convert!
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	`)

  if (args.length < 3) {
    usage()
    process.exit(1)
  }
  if (args.find((arg) => arg === '--help' || arg === '-h')) {
    usage()
    process.exit(0)
  }

  if (args.find((arg) => arg === '--version' || arg === '-v')) {
    process.stdout.write(`v1.0.0 - csvtosql`)
    process.exit(0)
  }

  if (args.find((arg) => arg === '--source' || arg === '-s')) {
    if (
      args[args.indexOf('--source') + 1] === undefined ||
      args[args.indexOf('-s') + 1] === undefined
    ) {
      process.stdout.write(`
	 --source | -s [dir] select the source file or directory
	 `)
    } else if (args[args.indexOf('-s') + 1].endsWith('.csv')) {
      this.source = args[args.indexOf('-s') + 1]
    }
  }
}

// fs.stat(args[3], (err, stats) => {
//   if (err) {
//     console.log(chalk.red(err))
//     process.exit(1)
//   }
//   if (stats.isFile()) {
//     this.fileSrc = args[3]
//     if (args[4] === '--table' || args[4] === '-t') {
//       this.tableName = args[5]
//     } else {
//       throw new Error(chalk.red(`Please provide a table name`))
//     }
//   } else if (stats.isDirectory()) {
//     this.dirSrc = args[3]
//     if (args[4] === '--table' || args[4] === '-t') {
//       throw new Error(
//         chalk.red(
//           `Don't include table names, for now table names are generated from file name`
//         )
//       )
//     }
//   } else {
//     this.dirSrc = process.cwd()
//   }
// })
//   emitter.on('start', () => {
//     // just some pretty logging
//     console.log('\x1b[35m', 'Starting engine with input: \n', '\x1b[0m')
//     console.log(JSON.stringify(this, null, 2))
//   })

// if (this.fileSrc) {
//   console.log('ss')
// } else {
//   const files = fs.readdirSync(this.dirSrc)

//   const csvFiles = files.filter((file) => {
//     return file.split('.').pop() === 'csv'
//   })

//   csvFiles.forEach((file) => {
//     const filePath = `${this.dirSrc}/${file}`
//     const fileStream = fs.createReadStream(filePath)
//     const splitStream = fileStream.pipe(split2())
//     let count = 0

//     splitStream
//       .on('data', (line) => {
//         count++
//         if (count === 1) {
//           this.headers = line.split(',').map((el) => {
//             return { name: el, type: 'STRING' }
//           })
//         }
//       })
//       .on('end', () => {
//         console.log(`File processed ${chalk.bgCyan(file)}`)

//         const create = createTable()
//         console.log(create)
//       })
//   })
// }
//   const createTable = () => {
//     const inStatement = `${this.headers.map((h) => `${h.name} ${h.type} `)}`
//     const createStatement = `CREATE TABLE IF NOT EXISTS ${'HUHHH'} (${inStatement})`
//     return createStatement
//   }
