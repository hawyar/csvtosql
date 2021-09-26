
# csvtosql

Converts a `.csv` file to a `.sql`

![tests](https://github.com/hawyar/csvtosql/actions/workflows/test.yaml/badge.svg)


## Builds

All builds are located in the `builds` folder.

** you don't need Node.js to run the executables **

- minified: `builds/csvtosql.min.js`
- executabl:
	- linux: `builds/csvtosql-linux`
	- windows: `builds/csvtosql-win.exe`
	- macos: `builds/csvtosql-macos`



## Usage

### Clone the repo
```bash
git clone 
```

### Check executable version:

```bash
build/binary/csvtosql-macos -v
```
**make sure you choose the right executable for your OS**


```bash
build/binary/csvtosql-macos --source <path_to_csv_file>
```

### CLI
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

Tested on MacOS only.


