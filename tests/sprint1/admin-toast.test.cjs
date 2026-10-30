const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('./helpers.cjs');
test('rapid admin results update one toast across actions and severity',()=>{
 const visible=new Map(),messages=[];
 const source=Object.fromEntries(['success','warning','error','info'].map(level=>[level,(message,options)=>{messages.push(message);visible.set(options.id,{level,message});return options.id;}]));
 const {toast}=loader({sonner:{toast:source}})('libs/admin-toast.ts');
 toast.success('Started');toast.success('Score saved');toast.error('Failed');toast.success('Retried');
 assert.equal(visible.size,1);assert.deepEqual([...visible.values()],[{level:'success',message:'Retried'}]);
 assert.equal(messages.length,4);
});
