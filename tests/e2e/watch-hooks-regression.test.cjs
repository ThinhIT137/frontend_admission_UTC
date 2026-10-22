const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function harness(){
 const before=[],after=[];const test={beforeEach:fn=>before.push(fn),afterEach:fn=>after.push(fn)};
 const sandbox={require:id=>id==='@playwright/test'?{test,expect:value=>({toEqual:expected=>assert.deepEqual(value,expected)})}:id==='./watch-labels.cjs'?{vietnamese:x=>x}:require(id),process:{env:{ADMISSION_WATCH_FAST:'0'}},console:{log(){}},Buffer};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'watch-hooks.cjs'),'utf8')+'\nthis.scroll=scrollForViewer;',sandbox);
 return {before,after,scroll:sandbox.scroll};
}
test('viewer scrolling retries one destroyed document, waits in Node and remains bounded',async()=>{
 const h=harness();let calls=0,waits=0,loads=0;const p={waitForLoadState:async()=>loads++,evaluate:async()=>{if(++calls===1)throw Error('Execution context was destroyed');return calls<5;},waitForTimeout:async()=>waits++,isClosed:()=>false};
 await h.scroll(p);assert.equal(loads,2);assert.ok(waits>0&&waits<=12);assert.ok(calls<=26);
});
test('viewer scrolling propagates app errors and repeated navigation failures',async()=>{
 for(const message of ['broken application','Execution context was destroyed']){const h=harness();let calls=0;await assert.rejects(h.scroll({waitForLoadState:async()=>{},evaluate:async()=>{calls++;throw Error(message);},isClosed:()=>false}),new RegExp(message));assert.equal(calls,message==='broken application'?1:2);}
});
test('goto wrappers stay attached to each Page rather than the first test Page',async()=>{
 const h=harness();class Locator{page(){return this.owner;}}class Page{constructor(id){this.id=id;this.events={};this.calls=[];}locator(){return new Locator();}on(name,fn){this.events[name]=fn;}async goto(url){this.calls.push(url);return this.id;}async addInitScript(){}async waitForLoadState(){}async evaluate(){return false;}async waitForTimeout(){}isClosed(){return false;}}
 const one=new Page('one'),two=new Page('two');await h.before[0]({page:one},{title:'one'});await h.before[0]({page:two},{title:'two'});
 assert.equal(await one.goto('/one'),'one');assert.equal(await two.goto('/two'),'two');assert.deepEqual(one.calls,['/one']);assert.deepEqual(two.calls,['/two']);
});
