const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','db','pull','--print'],{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024,windowsHide:true});
if (result.status!==0 || !result.stdout.includes('datasource db')) {console.error('Không cập nhật snapshot; giữ nguyên bản trước.'); process.exitCode=1;}
else {fs.writeFileSync(path.join(__dirname,'schema.database-latest.prisma'),result.stdout);console.log('Đã cập nhật snapshot cấu trúc database thật sau migration, không ghi đè schema chính.');}
