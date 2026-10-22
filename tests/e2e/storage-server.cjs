// Minimal Supabase Storage HTTP fixture; only used by isolated E2E, never real cloud storage.
const http = require('node:http');
const files = new Map();
const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1:58002').pathname;
  const prefix = '/storage/v1/object/';
  if (req.method === 'GET' && path.startsWith('/storage/v1/bucket/')) {
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({id:path.split('/').pop(),name:path.split('/').pop(),public:false}));return;
  }
  if (req.method === 'POST' && path.startsWith(prefix+'list/')) {
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const body=JSON.parse(Buffer.concat(chunks).toString()||'{}');const bucket=path.slice((prefix+'list/').length);
    const folder=bucket+'/'+body.prefix+'/';
    const rows=[...files.keys()].filter(key=>key.startsWith(folder)).map(key=>({name:key.slice(folder.length)})).filter(row=>!body.search||row.name.includes(body.search));
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(rows));return;
  }
  if (req.method === 'POST' && path.startsWith(prefix+'sign/')) {
    const key = path.slice((prefix+'sign/').length);
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({signedURL:'/object/sign/'+key+'?token=isolated-test'}));return;
  }
  if (req.method === 'POST' && path.startsWith(prefix)) {
    const chunks=[];for await(const chunk of req)chunks.push(chunk);files.set(path.slice(prefix.length),Buffer.concat(chunks));
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({Key:path.slice(prefix.length)}));return;
  }
  if (req.method==='GET' && path.startsWith(prefix+'sign/')) {
    const bytes=files.get(path.slice((prefix+'sign/').length));if(bytes){res.setHeader('Content-Type','image/png');res.end(bytes);return;}
  }
  res.statusCode=404;res.end();
});
server.listen(58002,'127.0.0.1');
