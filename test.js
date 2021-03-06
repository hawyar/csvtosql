const tap = require('tap')
const { exec } = require('child_process')
const util = require('util')
const pkjson = require('./package.json')
// const csvtosql = require('./build/csvtosql.min.js')

// just cruising tests for now
tap.test('cli help', async (t) => {
  t.plan(1)

  const wanted = ` 
${pkjson.name} v${pkjson.version}
${pkjson.description}

Usage:
  csvtosql [options] <source>

  Options:
      --source [file] select the source file or directory
      --help get help
      --version, get the current version
    \n`
  const execPromisified = util.promisify(exec)

  const { stdout: found, err } = await execPromisified(
    `build/csvtosql-macos --help`
  )

  if (err) {
    console.error(`exec error: ${err}`)
  }
  t.same(found, wanted)
})

tap.test('cli - convert csv to sqlite', async (t) => {
  t.plan(1)

  const execPromisified = util.promisify(exec)

  const src = 'example/sample.csv'

  const { stdout: found, err } = await execPromisified(
    `build/csvtosql-macos --source ${src}`
  )

  if (err) {
    console.error(`exec error: ${err}`)
  }

  console.log(found)
  t.ok(found)
})

// tap.test('js module - convert csv to sqlite', async (t) => {
//   t.plan(1)

//   const src = 'example/sample.csv'

//   const res = await csvtosql({
//     source: src,
//     table: 'sample',
//   }).catch((err) => {
//     console.error(err)
//   })

//   t.ok(res)
// })
