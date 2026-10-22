const fs=require('node:fs'),path=require('node:path');
const {vietnamese}=require('./watch-labels.cjs');
const folder=path.resolve(__dirname,'../artifacts');
const names={passed:'ĐẠT',failed:'LỖI',timedOut:'QUÁ THỜI GIAN',skipped:'CHƯA KIỂM TRA',interrupted:'ĐÃ DỪNG'};
const clean=value=>String(value||'').replace(/\u001b\[[0-9;]*m/g,'').replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,'[JWT ĐÃ ẨN]').replace(/Bearer\s+[^\s"']+/gi,'Bearer [ẨN]');
class Reporter{
 onBegin(config,suite){this.rows=[];this.started=new Date().toISOString();this.expected=suite.allTests().length;this.errors=[];this.write('ĐANG CHẠY');}
 onError(error){this.errors||=[];this.errors.push(clean(error.message));this.write('LỖI HỆ THỐNG / KHỞI ĐỘNG');}
 onTestEnd(test,result){this.rows.push({chuc_nang:vietnamese(test.title),ket_qua:names[result.status]||result.status,giay:+(result.duration/1000).toFixed(1),pham_vi:test.annotations.filter(a=>['Mức kiểm tra','Lý do chưa kiểm tra','skip'].includes(a.type)).map(a=>a.description).join('; ')||'Theo assertion của kịch bản; mở trang không chứng minh CRUD',loi:result.errors.map(e=>clean(e.message)).join('\n'),minh_chung:result.attachments.filter(a=>a.path).map(a=>path.relative(folder,a.path))});this.write('ĐANG CHẠY');}
 write(status){fs.mkdirSync(folder,{recursive:true});this.rows||=[];this.errors||=[];
  const counts={dat:this.rows.filter(r=>r.ket_qua==='ĐẠT').length,loi:this.rows.filter(r=>['LỖI','QUÁ THỜI GIAN'].includes(r.ket_qua)).length,chua:this.rows.filter(r=>r.ket_qua==='CHƯA KIỂM TRA').length};
  const esc=v=>clean(v).replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
  let text=`# Kết quả bot duyệt ứng dụng V2\n\nBắt đầu: ${this.started||new Date().toISOString()}\n\nTrạng thái: **${status}**. Đạt: **${counts.dat}**; lỗi: **${counts.loi}**; chưa kiểm tra: **${counts.chua}**; đã ghi ${this.rows.length}/${this.expected||0} ca.\n\n`;
  text+=process.env.ADMISSION_LIVE_SCORE==='1'?'**SUPABASE THẬT + BACKEND ĐIỂM THẬT.** AI bị tắt; không giả lập Storage/LLM. Ca mở trang chỉ xác minh đọc UI, không phải CRUD. Ca bỏ qua và chức năng chưa chạy không được tính đạt.\n\n':'**CHẾ ĐỘ LOCAL**: suite cũ có Storage/LLM giả lập; không phải bằng chứng cloud hoặc AI thật.\n\n';
  text+='| STT | Chức năng | Kết quả | Giây | Phạm vi / lý do |\n|---|---|---|---:|---|\n'+this.rows.map((r,i)=>`| ${i+1} | ${esc(r.chuc_nang)} | ${r.ket_qua} | ${r.giay} | ${esc(r.pham_vi)} |`).join('\n');
  text+='\n\n## Lỗi hệ thống\n\n'+(this.errors.join('\n\n')||'Chưa ghi nhận lỗi hệ thống của runner.');
  text+='\n\n## Chi tiết lỗi và minh chứng\n\n'+this.rows.filter(r=>r.loi||r.minh_chung.length).map(r=>`### ${r.chuc_nang}\n\n${r.loi?'```text\n'+r.loi+'\n```\n':''}${r.minh_chung.map(p=>`- [${path.basename(p)}](${p.replace(/\\/g,'/')})`).join('\n')}`).join('\n\n');
  text+='\n\n## Tệp kết quả\n\n- Báo cáo HTML: `watch-report/index.html`\n- Log terminal mới nhất: `BOT-CHAY.log`; log từng lượt: `watch-logs/`\n- Ảnh, trace và nhật ký trình duyệt: xem liên kết minh chứng ở từng ca hoặc HTML.\n- Dọn fixture cuối lượt: xem phần kết thúc do wrapper bổ sung và manifest `live-data/`.\n';
  fs.writeFileSync(path.join(folder,'KET-QUA-BOT.md'),text);fs.writeFileSync(path.join(folder,'ket-qua-bot.json'),JSON.stringify({status,started:this.started,expected:this.expected,counts,errors:this.errors,rows:this.rows},null,2));
 }
 onEnd(result){this.write(names[result.status]||result.status);console.log('\nBÁO CÁO TIẾNG VIỆT: '+path.join(folder,'KET-QUA-BOT.md'));}
}
module.exports=Reporter;
