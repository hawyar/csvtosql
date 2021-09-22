const tap = require('tap')
const { exec } = require('child_process')
const util = require('util')
const pkjson = require('./package.json')
tap.test('cli help', async (t) => {
  t.plan(1)

  const usage = ` 
	${pkjson.name} v${pkjson.version}
	${pkjson.description}
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	\n`
  const execPromisified = util.promisify(exec)

  const { stdout, err } = await execPromisified(`node csvtosql -h`)

  if (err) {
    console.error(`exec error: ${err}`)
  }
  t.same(stdout, usage)
})

tap.test('convert csv to sqlite', async (t) => {
  t.plan(1)
  const execPromisified = util.promisify(exec)

  //   const tableName = 'medicare_cms_data'
  const fileSrc =
    'Medicare_Referring_Provider_DMEPOS_NPI_Aggregate_table_2013.csv'

  const { stdout, err } = await execPromisified(
    `node --no-warnings --experimental-json-modules csvtosql -s ${fileSrc}`
  )

  console.log(stdout)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('passing thru')
})
