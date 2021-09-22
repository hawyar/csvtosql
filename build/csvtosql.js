var S=typeof require!="undefined"?require:t=>{throw new Error('Dynamic require of "'+t+'" is not supported')};var q=(t,i)=>()=>(i||t((i={exports:{}}).exports,i),i.exports);var l=q((C,L)=>{L.exports={name:"csvtosql",version:"1.0.0",description:"Convert csv to sql",main:"csvtosql.js",scripts:{lint:"npx eslint csvtosql.js",test:"tap --no-coverage --reporter=specy -J --color","test:coverage":"npm test -- --coverage-report=html",build:"node esbuild.config.js"},keywords:[],author:"hawyar",license:"ISC",devDependencies:{"esbuild-node-externals":"^1.3.0",eslint:"^7.32.0",tap:"^15.0.9"},dependencies:{esbuild:"^0.12.28",pg:"^8.7.1",split2:"^3.2.2"}}});var{access:b}=require("fs/promises"),{constants:T,createReadStream:v}=require("fs"),N=require("split2"),x=require("events"),n=l(),g=new x.EventEmitter,O=require("fs");(()=>{let t={_init:new Date,args:process.argv};g.on("start",()=>console.log("starting conversion")),w.call(t)})();async function w(){let{args:t}=this,i=()=>process.stdout.write(` 
	${n.name} v${n.version}
	${n.description}
Usage:
  	--source | -s [dir] select the source file or directory
  	--help | -h [dir] get help
  	--version | -v [dir] get the current version
  	
`);t.length<3&&(i(),process.exit(1)),t.find(s=>s==="--help"||s==="-h")&&(i(),process.exit(0)),t.find(s=>s==="--version"||s==="-v")&&(process.stdout.write(`${n.name} v${n.version}
`),process.exit(0)),t.find(s=>s==="--source"||s==="-s")&&(t[t.indexOf("--source")+1]===void 0||t[t.indexOf("-s")+1]===void 0?process.stdout.write(`--source | -s [dir] select the source file or directory 
`):t[t.indexOf("-s")+1].endsWith(".csv")&&(this.source=t[t.indexOf("-s")+1],this.tableName=this.source.split("/").pop().split(".")[0].toLowerCase(),console.log(`source ${this.source}`))),await b(this.source,T.R_OK|T.W_OK).catch(s=>{throw new Error(`${this.source} is not readable or writable 
 ${s}
`)});let o=0,a=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,d=/^[0-9]+$/,h=/^\d{4}-\d{2}-\d{2}$/,u=/^\d{2}:\d{2}:\d{2}$/,$=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,f=/^(true|false)$/,m=/^[^\s]+$/,p=/^$/;v(this.source).pipe(N()).on("data",s=>{if(o++,o===1)this.headers=s.split(",").map(e=>e.match(/^[0-9]+$/)?`${e} INT`:e.match(/^[0-9]+\.[0-9]+$/)?`${e} FLOAT`:e.match(a)?`${e.toLowerCase()} TEXT`:e.match(d)?`${e} INT`:e.match(h)?`${e} DATE`:e.match(u)?`${e} TIME`:e.match($)?`${e} DATETIME`:e.match(f)?`${e} BOOLEAN`:e.match(m)?`${e.toLowerCase()} TEXT`:e.match(p)?`${e.toLowerCase()} TEXT`:`${e.toLowerCase()} TEXT`);else{let e=s.split(",").map(r=>r.match(a)?`'${r}'`:r.match(d)?`${r}`:r.match(h)?`'${r}'`:r.match(u)?`'${r}'`:r.match($)?`'${r}'`:r.match(f)?`${r}`:r.match(m)?`'${r}'`:r.match(p)?"NULL":`'${r}'`),c=`INSERT INTO ${this.tableName} (${this.headers.join(",")}) VALUES (${e.join(",")}); 
 
`;this.sql+=c}}).on("end",()=>{console.log(`File processed ${this.source}`),console.log(`${this.headers.length} headers found`),console.log(`${o} lines processed`),console.log(`${new Date().getTime()-this._init.getTime()} ms elapsed`);let s=E();O.writeFile(`./${this.tableName}.sql`,s,e=>{if(e)throw e;console.log("SQL file created")})}).once("readable",()=>{g.emit("start")}).on("error",s=>{throw new Error(s)});let E=()=>{let s=`${this.headers.map(c=>`${c}`)}`;return`${`CREATE TABLE IF NOT EXISTS ${this.tableName} (${s})`};
${this.sql}`}}module.exports=w;
//# sourceMappingURL=csvtosql.js.map
