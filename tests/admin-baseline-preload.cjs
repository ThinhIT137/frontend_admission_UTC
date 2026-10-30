// Read HEAD sources in memory; never checkout or overwrite the working tree.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),original=fs.readFileSync;
const files=execFileSync('git',['diff','--name-only','--diff-filter=M'],{cwd:root,encoding:'utf8',windowsHide:true}).trim().split(/\r?\n/);
const baseline=new Map();
for(const file of files)if(/\.(tsx?|cjs|css)$/.test(file))baseline.set(path.resolve(root,file),execFileSync('git',['show','HEAD:'+file],{cwd:root,windowsHide:true}));
fs.readFileSync=function(file,options){const value=typeof file==='string'&&baseline.get(path.resolve(file));if(!value)return original.apply(this,arguments);const encoding=typeof options==='string'?options:options?.encoding;return encoding?value.toString(encoding):Buffer.from(value);};
