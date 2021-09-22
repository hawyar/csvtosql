import tap from 'tap'
import { exec } from 'child_process'
import util from 'util'

tap.test('cli help', async (t) => {
  t.plan(1)
  const execPromisified = util.promisify(exec)

  const { stdout, err } = await execPromisified(`node csvtosql -h`)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('Passing thru')
})

tap.test('cli version', async (t) => {
  t.plan(1)
  const execPromisified = util.promisify(exec)

  const { stdout, err } = await execPromisified(`node csvtosql -v`)

  console.log(stdout)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('Passing thru')
})

tap.test('convert csv to sqlite', async (t) => {
  t.plan(1)
  const execPromisified = util.promisify(exec)

  const tableName = 'medicare_cms_data'
  const fileSrc =
    'cms/Medicare_Referring_Provider_DMEPOS_NPI_Aggregate_table_2013.csv'

  const { stdout, err } = await execPromisified(
    `node csvtosql -s ${fileSrc} -t ${tableName}`
  )

  console.log(stdout)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('Passing thru')
})
