const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader,fixture}=require('./helpers.cjs');
const transient=()=>({meta:{driverAdapterError:{cause:{kind:'ConnectionClosed'}}}});
test('auth retries nested Prisma connection loss once and propagates the second failure',async()=>{
 const {readAuthWithReconnect}=loader()('libs/auth-read.ts');let calls=0;const error=transient();
 await assert.rejects(readAuthWithReconnect(async()=>{calls++;throw error;}),e=>e===error);assert.equal(calls,2);
 calls=0;assert.equal(await readAuthWithReconnect(async()=>{if(++calls===1)throw transient();return 'ok';}),'ok');assert.equal(calls,2);
});
test('auth does not retry validation or query errors',async()=>{
 const {readAuthWithReconnect}=loader()('libs/auth-read.ts');for(const error of [new Error('bad password'),{code:'P2002'},{code:'42501'}]){let calls=0;await assert.rejects(readAuthWithReconnect(async()=>{calls++;throw error;}),e=>e===error);assert.equal(calls,1);}
});
test('database outage never issues credentials or removes valid refresh cookies',async()=>{
 const f=fixture();f.db.admin.findUnique.mock.mockImplementation(async()=>{throw transient();});
 await assert.rejects(f.admin.login({email:'admin@example.invalid',password:'wrong'}));assert.equal(f.password.verifyPassword.mock.callCount(),0);
 f.cookies.getCookie.mock.mockImplementation(async()=> 'refresh');await assert.rejects(f.admin.refreshAccessToken());
 assert.equal(f.cookies.setToken.mock.callCount(),0);assert.equal(f.cookies.deleteCookie.mock.callCount(),0);assert.equal(f.tokens.generateToken.mock.callCount(),0);
});
test('transaction auth reads never retry a failed transaction',async()=>{
 const f=fixture();let calls=0;const client={admin:{findUnique:async()=>{calls++;throw transient();}}};await assert.rejects(f.admin.isValidAdmin('id',client));assert.equal(calls,1);
});
test('Prisma caches separate role pools across module reloads and logs safe idle errors',()=>{
 const original={admin:process.env.DATABASE_URL,public:process.env.DATABASE_URL_PUBLIC,cache:globalThis.admissionConnections};const pools=[],logs=[];const old=console.error;
 try{delete globalThis.admissionConnections;process.env.DATABASE_URL='postgresql://a:secret@localhost/db?sslmode=require';process.env.DATABASE_URL_PUBLIC='postgresql://p:hidden@localhost/db?schema=public';console.error=(...x)=>logs.push(x.join(' '));
 class Pool{constructor(options){this.options=options;this.handlers={};pools.push(this);}on(name,fn){this.handlers[name]=fn;}}class PrismaPg{constructor(pool){this.pool=pool;}}class PrismaClient{constructor(options){this.options=options;}}
 const overrides={'@/app/generated/prisma/client':{PrismaClient},'@prisma/adapter-pg':{PrismaPg},pg:{Pool}};
 const first=loader(overrides)('libs/prisma.ts'),second=loader(overrides)('libs/prisma.ts');assert.equal(pools.length,2);assert.equal(first.default,second.default);assert.equal(first.prismaPublic,second.prismaPublic);assert.notEqual(first.default,first.prismaPublic);
 const publicUrl=new URL(pools[1].options.connectionString);assert.equal(publicUrl.searchParams.get('schema'),'public');assert.equal(publicUrl.searchParams.get('pgbouncer'),'true');assert.equal(pools[0].options.connectionTimeoutMillis,10000);assert.equal(pools[0].options.idleTimeoutMillis,30000);
 pools[0].handlers.error(new Error('postgresql://secret'));assert.equal(logs.length,1);assert.doesNotMatch(logs[0],/postgresql|secret|hidden/);
 }finally{console.error=old;globalThis.admissionConnections=original.cache;for(const [key,value]of [['DATABASE_URL',original.admin],['DATABASE_URL_PUBLIC',original.public]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
