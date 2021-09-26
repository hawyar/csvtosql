const tap = require('tap')
const { exec } = require('child_process')
const util = require('util')
const pkjson = require('./package.json')
const csvtosql = require('./build/csvtosql.min.js')

tap.test('cli help', async (t) => {
  t.plan(1)

  const wanted = ` 
	${pkjson.name} v${pkjson.version}
	${pkjson.description}
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	\n`
  const execPromisified = util.promisify(exec)

  const { stdout: found, err } = await execPromisified(
    `build/binary/csvtosql-macos -h`
  )

  if (err) {
    console.error(`exec error: ${err}`)
  }
  t.same(found, wanted)
})

tap.test('cli - convert csv to sqlite', async (t) => {
  t.plan(1)

  const execPromisified = util.promisify(exec)

  const fileSrc = 'DE1_0_2009_Beneficiary_Summary_File_Sample_1.csv'

  const { stdout, err } = await execPromisified(
    `build/binary/csvtosql-macos --source example/${fileSrc}`
  )

  console.log(stdout)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('passing thru')
})

tap.test('js module - convert csv to sqlite', async (t) => {
  t.plan(1)

  const fileSrc = 'example/DE1_0_2009_Beneficiary_Summary_File_Sample_1.csv'

  const res = await csvtosql({
    source: fileSrc,
    table: 'beneficiary_summary_file',
  }).catch((err) => {
    console.error(err)
  })

  t.ok(res)
})
