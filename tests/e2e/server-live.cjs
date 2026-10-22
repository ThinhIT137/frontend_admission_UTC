const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const dotenv=require('dotenv');
const root=path.resolve(__dirname,'../..');
const live=dotenv.parse(fs.readFileSync(path.join(root,'.env')));
if (!live.DIRECT_URL || !live.JWT_ACCESSTOKEN) throw Error('Thiếu cấu hình database/JWT thật');
const remote=(process.env.ADMISSION_WATCH_REMOTE_BACKENDS??live.ADMISSION_WATCH_REMOTE_BACKENDS)==='1';
const env={...process.env,...live,
  ...(remote?{}:{API_APPLICATION_SCORE:'http://127.0.0.1:8100',NEXT_PUBLIC_API_APPLICATION_SCORE:'http://127.0.0.1:8100',API_AI_ML:'http://127.0.0.1:1',NEXT_PUBLIC_API_AI_ML:'http://127.0.0.1:1'}),
  ADMISSION_E2E:'1',ADMISSION_LIVE_SCORE:'1',ADMISSION_WATCH_REMOTE_BACKENDS:remote?'1':'0',ALLOW_LOOPBACK_BACKEND_HTTP:remote?'false':'true',NEXT_TELEMETRY_DISABLED:'1'};
let next,score;
function stopOwned(child){
  if(!child?.pid || child.exitCode!==null)return;
  // Chỉ dừng cây tiến trình do server này khởi tạo; không tìm/kill theo cổng.
  if(process.platform==='win32')spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  else child.kill('SIGTERM');
}
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>{stopOwned(next);stopOwned(score);});
process.on('exit',()=>{stopOwned(next);stopOwned(score);});
function run(args){return new Promise((resolve,reject)=>{
  next=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),...args],{cwd:root,env,stdio:'inherit',windowsHide:true});
  next.on('error',reject);next.on('exit',code=>code===0?resolve():reject(Error('Next.js kết thúc mã '+code)));
});}
async function healthy(){try{return (await fetch('http://127.0.0.1:8100/health',{signal:AbortSignal.timeout(2000)})).ok;}catch{return false;}}
async function remoteHealth(name,label){
  let url;
  try{url=new URL(env[name]);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error();}
  catch{throw Error(`Cấu hình URL HTTPS của ${label} không hợp lệ`);}
  // Render có thể cần thời gian khởi động; chỉ GET health, không gọi nghiệp vụ AI.
  const deadline=Date.now()+90000;
  while(Date.now()<deadline){
    try{if((await fetch(new URL('/health',url),{redirect:'error',signal:AbortSignal.timeout(Math.min(10000,deadline-Date.now()))})).ok)return;}
    catch{}
    if(Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,Math.min(1000,deadline-Date.now())));
  }
  throw Error(`${label} triển khai chưa sẵn sàng sau 90 giây; kiểm tra health hoặc trạng thái khởi động trên Render`);
}
(async()=>{
  console.log(remote?'CHẾ ĐỘ TRIỂN KHAI: Supabase thật + API điểm/AI từ .env. Chỉ kiểm tra health AI; không chạy ca nghiệp vụ AI.':'CHẾ ĐỘ THẬT: Supabase + backend điểm cổng 8100. Không khởi động AI/Storage giả lập.');
  if(remote){await Promise.all([remoteHealth('API_APPLICATION_SCORE','Backend điểm'),remoteHealth('API_AI_ML','Backend AI')]);}
  else if(!await healthy()){
    const repo=path.resolve(root,'../backend_admission/backend_application_score');
    score=spawn(path.join(repo,'.venv/Scripts/python.exe'),['-B','-u','run_real.py'],{cwd:repo,env:{...process.env,PYTHONIOENCODING:'utf-8'},stdio:'inherit',windowsHide:true});
    score.on('error',error=>console.error('Không mở được backend điểm:',error.message));
    for(let i=0;i<40 && !await healthy();i++) await new Promise(resolve=>setTimeout(resolve,500));
    if(!await healthy()) throw Error('Backend điểm thật chưa sẵn sàng');
  }
  // Luôn build source hiện tại; bỏ qua build từng khiến bot chạy bundle cũ.
  await run(['build','--webpack']);
  await run(['start','--hostname','127.0.0.1','--port',String(process.env.ADMISSION_WATCH_PORT||3300)]);
})().catch(error=>{console.error(error.message);score?.kill();process.exitCode=1;});
