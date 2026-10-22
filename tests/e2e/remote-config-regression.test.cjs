const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {EventEmitter}=require('node:events');
const source=fs.readFileSync(path.join(__dirname,'server-live.cjs'),'utf8');
async function execute(url='https://score.example.test'){
 const spawned=[],health=[],errors=[];
 const env={DIRECT_URL:'postgres://fixture',JWT_ACCESSTOKEN:'fixture',ADMISSION_WATCH_REMOTE_BACKENDS:'1',API_APPLICATION_SCORE:url,API_AI_ML:'https://ai.example.test'};
 const proc=new EventEmitter();Object.assign(proc,{env:{},execPath:'node',platform:'win32'});
 const spawn=(exe,args,options)=>{spawned.push({exe,args,env:options.env});const child=new EventEmitter();child.exitCode=null;setImmediate(()=>child.emit('exit',0));return child;};
 const req=name=>name==='node:fs'?{readFileSync:()=>Buffer.from('fixture')}:name==='dotenv'?{parse:()=>env}:name==='node:child_process'?{spawn}:require(name);
 vm.runInNewContext(source,{require:req,__dirname,process:proc,console:{log(){},error:x=>errors.push(x)},URL,AbortSignal,setTimeout,fetch:async url=>{health.push(String(url));return {ok:true};}});
 for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));
 return {spawned,health,errors,proc};
}
test('Remote mode checks HTTPS health only and starts Next without Python or URL overrides',async()=>{
 const h=await execute();assert.equal(h.errors.length,0);assert.equal(h.health.length,2);
 assert.ok(h.health.every(url=>url.endsWith('/health')));assert.equal(h.spawned.length,2);
 assert.ok(h.spawned.every(x=>x.exe==='node'));assert.equal(h.spawned[0].env.API_APPLICATION_SCORE,'https://score.example.test');
 assert.equal(h.spawned[0].env.ALLOW_LOOPBACK_BACKEND_HTTP,'false');
});
test('Remote mode rejects HTTP URLs before building Next or starting a local backend',async()=>{
 const h=await execute('http://score.example.test');assert.equal(h.proc.exitCode,1);assert.equal(h.spawned.length,0);assert.equal(h.errors.length,1);
});
