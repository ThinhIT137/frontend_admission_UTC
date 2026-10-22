const base=require('./watch.config.cjs');
const port=Number(process.env.ADMISSION_WATCH_PORT||3300);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Cổng bot không hợp lệ');
module.exports={...base,testMatch:'**/watch-live.spec.cjs',timeout:300000,
  use:{...base.use,baseURL:`http://localhost:${port}`,headless:process.env.ADMISSION_LIVE_HEADLESS==='1',launchOptions:{...base.use.launchOptions,slowMo:process.env.ADMISSION_WATCH_FAST==='1'?0:800}},
  webServer:{...base.webServer,url:`http://localhost:${port}/admin/login`,command:'node tests/e2e/server-live.cjs'}};
