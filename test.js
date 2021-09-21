import tap from 'tap'
import { exec } from 'child_process'
import util from 'util'

tap.test('Test parser through cli command', async (t) => {
  t.plan(1)
  const execPromisified = util.promisify(exec)

  const source = 'cms'
  const tableName = 'medicare_cms_data'

  const { stdout, err } = await execPromisified(`node engine -s ${source} -t ${tableName}`)

  //   const { stdout: found, err } = await execPromisified(`node engine`)

  console.log(stdout)

  if (err) {
    console.error(`exec error: ${err}`)
  }

  t.pass('Passing thru')
})
