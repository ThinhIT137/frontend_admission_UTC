const run=process.argv.slice(2).find(arg=>arg!=='--');
if(!run){console.error('Cần mã lượt cha hoặc lượt con trong tests/artifacts/live-data/. Mã cha sẽ dọn cả các lượt con đã đăng ký.');process.exitCode=1;}
else require('./live-data.cjs').cleanupAll(run).catch(error=>{console.error('Dọn chưa hoàn tất:',error.message);process.exitCode=1;});
