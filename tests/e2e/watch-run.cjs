const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const folder = path.resolve(__dirname, '../artifacts');
// --list chỉ liệt kê kịch bản; không ghi đè báo cáo/log của lượt chạy trước.
if(process.argv.includes('--list')){
  const local=process.argv.includes('--local');
  try{const child=spawn(process.execPath,[path.join(root,'node_modules/@playwright/test/cli.js'),'test','--config',local?'tests/e2e/watch.config.cjs':'tests/e2e/watch-live.config.cjs','--list','--reporter=list'],{cwd:root,stdio:'inherit',windowsHide:true});
  child.on('error',error=>{console.error(error.message);process.exitCode=1;});child.on('close',code=>process.exitCode=code??1);
  }catch(error){console.error('Không liệt kê được kịch bản:',error.message);process.exitCode=1;}
}else{
const startTime=Date.now();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const archive = path.join(folder, 'watch-logs', `bot-${stamp}-${process.pid}.log`);
const latest = path.join(folder, 'BOT-CHAY.log');
fs.mkdirSync(path.dirname(archive), { recursive: true });
fs.writeFileSync(latest, '');
function record(channel, line) {
  const clean = line.replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/(postgres(?:ql)?:\/\/[^\s:@/]+:)[^@\s]+@/gi, '$1[ẨN]@')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [ẨN]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[JWT ĐÃ ẨN]');
  const text = `[${new Date().toISOString()}] [${channel}] ${clean}\n`;
  fs.appendFileSync(archive, text);
  fs.appendFileSync(latest, text);
}
record('BOT', 'Bắt đầu lượt kiểm thử. Log gồm quá trình khởi động, build, thao tác và lỗi.');
console.log(`LOG LƯỢT NÀY: ${archive}\nLOG MỚI NHẤT: ${latest}`);
const local = process.argv.includes('--local');
const args = process.argv.slice(2).filter(arg => arg !== '--' && arg !== '--local');
const run = require('node:crypto').randomUUID();
const config = local ? 'tests/e2e/watch.config.cjs' : 'tests/e2e/watch-live.config.cjs';
record('MÔI TRƯỜNG', local ? 'DB local, suite cũ gồm AI giả lập' : 'SUPABASE THẬT + BACKEND ĐIỂM THẬT; KHÔNG CHẠY AI');
let child,interrupted=false,finalized=false;
try{child = spawn(process.execPath, [path.join(root, 'node_modules/@playwright/test/cli.js'),
  'test', '--config', config, ...args], {
  cwd: root, env: {...process.env, ADMISSION_LIVE_SCORE:local?'0':'1', ADMISSION_LIVE_RUN_ID:run}, stdio: ['inherit', 'pipe', 'pipe'], windowsHide: true,
});
}catch(error){record('LỖI KHỞI ĐỘNG',error.message);console.error('Không khởi động được bot:',error.message);void finalize(1,null);}
if(child){
for (const [stream, output, channel] of [[child.stdout, process.stdout, 'THÔNG TIN'], [child.stderr, process.stderr, 'STDERR']]) {
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  lines.on('line', line => { record(channel, line); output.write(line + '\n'); });
}
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => {
  if (interrupted) return;
  interrupted = true; record('BOT', 'Người dùng yêu cầu dừng lượt chạy.');
  child.kill(signal);
});
child.on('error', error => { record('LỖI KHỞI ĐỘNG', error.message); console.error(error.message); process.exitCode = 1; });
child.on('close',finalize);
}
async function finalize(code,signal){
  if(finalized)return;finalized=true;
  let cleanupError='';
  if (!local) {
    try { await require('./live-data.cjs').cleanupAll(run,message=>{record('DỌN DỮ LIỆU',message);console.log(message);}); }
    catch(error) {cleanupError=error.message;record('LỖI DỌN DỮ LIỆU',error.message);console.error('Dọn dữ liệu chưa hoàn tất, xem manifest và log:',error.message);code=1;}
  }
  const report=path.join(folder,'KET-QUA-BOT.md');
  // Wrapper chạy sau reporter: lỗi khởi động/dọn dữ liệu không thể để lại kết luận ĐẠT cũ.
  const ending=`\n\n## Kết thúc tiến trình\n\nMã thoát: **${code??1}**. ${interrupted?'Người dùng đã dừng lượt chạy.':''}\n\n${cleanupError?'**LỖI DỌN DỮ LIỆU**: '+cleanupError:local?'Không có fixture Supabase của chế độ live.':'Đã thực hiện kiểm tra/dọn mọi manifest đăng ký trong lượt này; từng manifest phải có cleaned=true, remaining=0 nếu đã tạo dữ liệu.'}\n\nLog lượt này: \`${archive}\`.\n`;
  if(!fs.existsSync(report)||fs.statSync(report).mtimeMs<startTime)fs.writeFileSync(report,'# Kết quả bot V2\n\n**CHƯA CHẠY ĐƯỢC / LỖI KHỞI ĐỘNG**. Xem log, không sử dụng kết quả lượt cũ.\n');
  fs.appendFileSync(report,ending);
  if(code!==0||cleanupError||interrupted){const body=fs.readFileSync(report,'utf8');fs.writeFileSync(report,'> **LƯỢT CHẠY CÓ LỖI HOẶC ĐÃ DỪNG. KHÔNG KẾT LUẬN TOÀN BỘ ĐẠT.** Xem lỗi từng ca và mục kết thúc/dọn dữ liệu.\n\n'+body);}
  const jsonFile=path.join(folder,'ket-qua-bot.json');let result={};if(fs.existsSync(jsonFile)&&fs.statSync(jsonFile).mtimeMs>=startTime)result=JSON.parse(fs.readFileSync(jsonFile,'utf8'));result.processExit=code??1;result.cleanupError=cleanupError||null;result.interrupted=interrupted;if(code!==0||cleanupError)result.status='LỖI TIẾN TRÌNH';fs.writeFileSync(jsonFile,JSON.stringify(result,null,2));
  record('KẾT THÚC', `Mã thoát: ${code}; tín hiệu: ${signal || 'không'}; ${interrupted ? 'đã yêu cầu dừng' : 'đã kết thúc'}.`);
  console.log(`\nĐÃ LƯU LOG: ${archive}`);
  process.exitCode = code ?? (interrupted ? 130 : 1);
}
}
