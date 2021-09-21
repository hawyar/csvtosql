import fs from 'fs'
import split2 from 'split2'
import chalk from 'chalk'
;(() => {
  engine.call({
    _init: new Date(),
    args: process.argv,
  })
})()

function engine() {
  if (this.args[2] === '--source' || this.args[2] === '-s') {
    this.sourceDir = this.args[3]
  } else {
    this.sourceDir = process.cwd()
  }

  if (!fs.statSync(this.sourceDir).isDirectory()) {
    console.error(`${this.sourceDir} is not a directory`)
    process.exit(1)
  }

  const files = fs.readdirSync(this.sourceDir)

  const csvFiles = files.filter((file) => {
    return file.split('.').pop() === 'csv'
  })

  // stream the files
  csvFiles.forEach((file) => {
    const filePath = `${this.sourceDir}/${file}`
    const fileStream = fs.createReadStream(filePath)
    const splitStream = fileStream.pipe(split2())
    let count = 0

    splitStream
      .on('data', (line) => {
        count++
        if (count === 1) {
          this.headers = line.split(',').map((el) => {
            return { name: el, type: 'STRING' }
          })
        }
      })
      .on('end', () => {
        console.log(`File processed ${chalk.bgCyan(file)}`)

        createTable('huh')
      })
  })
  const createTable = (tableName) => {
    const inStatement = `${this.headers.map((h) => `${h.type} beepboop`)}`
    const createStatement = `CREATE TABLE ${tableName} (${inStatement}`
    return createStatement
  }
}
