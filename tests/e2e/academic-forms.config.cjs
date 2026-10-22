const path=require('node:path');
module.exports={testDir:__dirname,testMatch:'academic-forms.spec.cjs',workers:1,retries:0,
  outputDir:'../artifacts/academic-forms',
  reporter:[['list'],['json',{outputFile:path.resolve(__dirname,'../artifacts/academic-forms-results.json')}]],
  use:{baseURL:'http://127.0.0.1:3301',channel:'chrome',headless:true,screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3301',cwd:path.resolve(__dirname,'../..'),env:{ADMISSION_E2E:'1'},url:'http://127.0.0.1:3301/nop-ho-so',reuseExistingServer:false,timeout:60000}
};
