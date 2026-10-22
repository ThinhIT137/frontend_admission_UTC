const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {EventEmitter}=require('node:events');
const folder=path.resolve(__dirname,'../artifacts');
function harness(file,{list=false,spawnError=false,cleanupError=false,configError=false,args=[]}={}){
 const files=new Map(),children=[],cleanup=[];
 const fakeFs={mkdirSync(){},existsSync:p=>files.has(p),writeFileSync:(p,v)=>files.set(p,String(v)),appendFileSync:(p,v)=>files.set(p,(files.get(p)||'')+v),readFileSync:p=>{if(String(p).endsWith('.env')){if(configError)throw Error('ENOENT configuration');return Buffer.from('ADMISSION_WATCH_REMOTE_BACKENDS=1');}return files.get(p);},statSync:()=>({mtimeMs:Date.now()+1000})};
 const proc=new EventEmitter();Object.assign(proc,{argv:['node','watch-run.cjs',...(list?['--list']:[]),...args],env:{},execPath:process.execPath,pid:123,stdout:{write(){}},stderr:{write(){}}});
 const spawn=()=>{if(spawnError)throw Error('spawn EPERM');const child=new EventEmitter();child.stdout={};child.stderr={};children.push(child);return child;};
 const req=name=>name==='node:fs'?fakeFs:name==='node:child_process'?{spawn}:name==='node:readline'?{createInterface:()=>new EventEmitter()}:name==='./live-data.cjs'?{cleanupAll:async run=>{cleanup.push(run);if(cleanupError)throw Error('Fixture still present');}}:require(name);
 const sandbox={require:req,__dirname,process:proc,console:{log(){},error(){}},Buffer,module:{exports:{}},setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});return {files,children,cleanup,proc,sandbox};
}
test('List mode leaves all report/log artifacts untouched',()=>{
 const h=harness('watch-run.cjs',{list:true});assert.equal(h.files.size,0);assert.equal(h.children.length,1);
 h.children[0].emit('close',0);assert.equal(h.proc.exitCode,0);assert.equal(h.cleanup.length,0);
});
test('Synchronous child spawn failure writes failed final report instead of stale success',async()=>{
 const h=harness('watch-run.cjs',{spawnError:true});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.proc.exitCode,1);const json=JSON.parse(h.files.get(path.join(folder,'ket-qua-bot.json')));assert.equal(json.processExit,1);assert.notEqual(json.status,'ĐẠT');
 assert.match(h.files.get(path.join(folder,'KET-QUA-BOT.md')),/LỖI|CHƯA CHẠY/);
});
test('Reporter records fatal startup errors without claiming passed suite',()=>{
 const h=harness('watch-reporter.cjs');const Reporter=h.sandbox.module.exports;const r=new Reporter();r.onError({message:'startup failed'});r.onEnd({status:'failed'});
 const json=JSON.parse(h.files.get(path.join(folder,'ket-qua-bot.json')));assert.equal(json.counts.dat,0);assert.equal(json.status,'LỖI');assert.deepEqual(json.errors,['startup failed']);
});
test('Reporter preserves explicit skipped coverage reasons',()=>{
 const h=harness('watch-reporter.cjs');const r=new h.sandbox.module.exports();r.onBegin({}, {allTests:()=>[{}]});r.onTestEnd({title:'OTP',annotations:[{type:'Lý do chưa kiểm tra',description:'Không gửi email thật'}]},{status:'skipped',duration:0,errors:[],attachments:[]});r.onEnd({status:'passed'});
 const json=JSON.parse(h.files.get(path.join(folder,'ket-qua-bot.json')));assert.equal(json.counts.dat,0);assert.equal(json.counts.chua,1);assert.match(json.rows[0].pham_vi,/Không gửi email thật/);
});
test('Manual recovery passes parent run to cleanupAll, including child manifests',async()=>{
 const h=harness('cleanup-live.cjs',{args:['--','test-parent-run']});await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(h.cleanup,['test-parent-run']);
});
test('Cleanup failure overrides successful child exit and is visible in both reports',async()=>{
 const h=harness('watch-run.cjs',{cleanupError:true});h.children[0].emit('close',0,null);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.proc.exitCode,1);const json=JSON.parse(h.files.get(path.join(folder,'ket-qua-bot.json')));assert.equal(json.processExit,1);assert.equal(json.cleanupError,'Fixture still present');assert.match(h.files.get(path.join(folder,'KET-QUA-BOT.md')),/LỖI DỌN DỮ LIỆU/);
});
test('Live bot browser and readiness URL share the canonical localhost origin',()=>{
 const config=require('./watch-live.config.cjs');assert.equal(new URL(config.use.baseURL).hostname,'localhost');assert.equal(new URL(config.webServer.url).origin,config.use.baseURL);assert.match(config.webServer.command,/server-live\.cjs/);
});

test('Configuration read failure writes a fresh failed report',async()=>{
 const h=harness('watch-run.cjs',{configError:true});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.proc.exitCode,1);assert.equal(h.children.length,0);
 const result=JSON.parse(h.files.get(path.join(folder,'ket-qua-bot.json')));assert.equal(result.processExit,1);
 assert.match(h.files.get(path.join(folder,'KET-QUA-BOT.md')), /CHƯA CHẠY|LỖI/);
});
