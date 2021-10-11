# csvtosql

![tests](https://github.com/hawyar/csvtosql/actions/workflows/test.yaml/badge.svg)

## Builds

All builds are located in the `build` folder. **You don't need Node.js to run the executables**

- minified JS module: `build/csvtosql.min.js`
- executables:
  - linux: `build/csvtosql-linux`
  - windows: `build/csvtosql-win.exe`
  - macos: `build/csvtosql-macos`

## Usage

Clone the repo

```bash
git clone https://github.com/hawyar/csvtosql.git
```

check if executable runs:

```bash
build/csvtosql-macos -v
```

**make sure you choose the right executable for your OS**

make a conversion

```bash
build/csvtosql-macos --source <path_to_csv_file>
```

you get back two files:

- `.sql` this is the generated SQL file
- `.db` this is the sqlite db file ready to be used with sqlite3

**make sure you have [sqlite3](https://www.sqlite.org/download.html) installed**

### Or use as a JS module

```bash
const csvtosql = require('csvtosql');

const result = await csvtosql({
	source: 'path_to_csv_file',
    table: 'table_name',
  }).catch((err) => {
    console.error(err)
  })

  // You might want to then write it to a file
  fs.writeFileSync('path_to_file_generated_above.sql', result.sql)
```

Note: Using the JS module doesn't create the sqlite db for you. You can easily do it yourself by using the generated `.sql` file.

```bash
sqlite3 <any_path_you_like>.db -init <path_to_sql_file>
```

## CLI

```bash
csvtosql v1.0.0
convert csv to sqlite

Usage:
	csvtosql [options] <source>

	Options:
  		--source [file] select the source file or directory
  		--help get help
  		--version, get the current version
```
