
# csvtosql
![tests](https://github.com/hawyar/csvtosql/actions/workflows/test.yaml/badge.svg)

Converts a `.csv` file to a `.sql`


## Builds

All builds are located in the `builds` folder. **You don't need Node.js to run the executables**

- minified: `builds/csvtosql.min.js`
- executable: 
	- linux: `builds/csvtosql-linux`
	- windows: `builds/csvtosql-win.exe`
	- macos: `builds/csvtosql-macos`


## Usage

Clone the repo
```bash
git clone https://github.com/hawyar/csvtosql.git
```

check if executable runs:

```bash
build/binary/csvtosql-macos -v
```
**make sure you choose the right executable for your OS**


convert a file

```bash
build/binary/csvtosql-macos --source <path_to_csv_file>
```

then use the sql file generated above to import the data into your database

```bash
sqlite3 <path_to_local_file>.db -init <path_to_file_generated_above>.sql
```


### Or use the JS module

```bash
const csvtosql = require('csvtosql');

const result = await csvtosql({
	source: 'path_to_csv_file',
    table: 'table_name',
  }).catch((err) => {
    console.error(err)
  })

  // you might want to then write it to a file
  fs.writeFileSync('path_to_file_generated_above.sql', result.sql)
```

## CLI
```
csvtosql v1.0.0
convert csv to sqlite

Usage:
	csvtosql [options] <source>

	Options:
  		--source [file] select the source file or directory
  		--help get help
  		--version, get the current version
```




