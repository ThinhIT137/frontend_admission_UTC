const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('../sprint1/helpers.cjs');

function fixture(user = { ma_admin: 'A1', vai_tro: { ten_vai_tro: 'super_admin' } }) {
  const model = () => Object.fromEntries(['create', 'update', 'delete'].map(name => [name, mock.fn(async ({ data }) => ({
    ...data, ma_bai_viet: 'P1', ma_tri_thuc: 'K1', create_at: new Date(),
  }))]));
  const db = { trangNoiDung: model(), triThucAi: model() };
  const revalidatePath = mock.fn();
  const backendRequest = mock.fn(async (_, path, options) => ({ ma_tri_thuc: 'K1', ...options.body, trang_thai: 'active' }));
  const actions = loader({
    '@/libs/prisma': { __esModule: true, default: db },
    '@/services/user.service': { adminService: { getCurrentUser: async () => user, getAdminId: async () => { if (!user) throw Error('Không có quyền'); return user.ma_admin; } } },
    'next/cache': { revalidatePath },
    '@/libs/api-services/backend.server': { backendRequest },
  })('actions/content.action.ts');
  return { actions, db, revalidatePath, backendRequest };
}
const article = { title: 'Test article', content: 'Content', category: 'TIN TỨC', status: 'DRAFT' };
const knowledge = { topic: 'Test topic', question: 'Question', answer: 'Answer' };

for (const user of [null, { ma_admin: 'A1', vai_tro: { ten_vai_tro: 'unknown' } }]) {
  test(`Content mutations reject ${user ? 'invalid role' : 'anonymous user'} before DB writes`, async () => {
    const { actions, db } = fixture(user);
    await assert.rejects(actions.saveArticle(article), /quyền/);
    await assert.rejects(actions.deleteArticle('P1'), /quyền/);
    await assert.rejects(actions.saveKnowledge(knowledge), /quyền/);
    await assert.rejects(actions.deleteKnowledge('K1'), /quyền/);
    for (const model of Object.values(db)) for (const fn of Object.values(model)) assert.equal(fn.mock.callCount(), 0);
  });
}
test('Articles persist author, draft/publication state, edits and deletion', async () => {
  const { actions, db } = fixture();
  const created = await actions.saveArticle(article);
  assert.equal(created.id, 'P1');
  assert.equal(db.trangNoiDung.create.mock.calls[0].arguments[0].data.ma_admin_tac_gia, 'A1');
  assert.equal(db.trangNoiDung.create.mock.calls[0].arguments[0].data.ngay_dang, null);
  await actions.saveArticle({ ...article, id: 'P1', status: 'PUBLISHED' });
  const update = db.trangNoiDung.update.mock.calls[0].arguments[0];
  assert.deepEqual(update.where, { ma_bai_viet: 'P1' });
  assert.ok(update.data.ngay_dang instanceof Date);
  await actions.deleteArticle('P1');
  assert.deepEqual(db.trangNoiDung.delete.mock.calls[0].arguments[0].where, { ma_bai_viet: 'P1' });
});
test('Content validation and DB failures prevent successful mutations', async () => {
  const { actions, db, revalidatePath } = fixture();
  await assert.rejects(actions.saveArticle({ ...article, title: ' ' }));
  await assert.rejects(actions.saveKnowledge({ ...knowledge, answer: ' ' }));
  db.trangNoiDung.create.mock.mockImplementation(async () => { throw Error('DB unavailable'); });
  await assert.rejects(actions.saveArticle(article), /DB unavailable/);
  assert.equal(revalidatePath.mock.callCount(), 0);
});
test('Knowledge CRUD calls authenticated AI API without writing local Prisma', async () => {
 const {actions,db,backendRequest}=fixture();
 await actions.saveKnowledge(knowledge);
 let args=backendRequest.mock.calls[0].arguments;assert.equal(args[0],'ai');assert.equal(args[1],'/api/chat/knowledge');assert.equal(args[2].auth,'admin');assert.equal(args[2].body.ma_admin_phu_trach,'A1');
 await actions.saveKnowledge({...knowledge,id:'K1'});assert.equal(backendRequest.mock.calls[1].arguments[2].method,'PUT');
 await actions.deleteKnowledge('K1');assert.equal(backendRequest.mock.calls[2].arguments[2].method,'DELETE');
 assert.equal(db.triThucAi.create.mock.callCount(),0);
});
test('Knowledge API failure is not treated as successful local save', async () => {
 const {actions,backendRequest}=fixture();backendRequest.mock.mockImplementation(async()=>{throw Error('AI unavailable')});
 await assert.rejects(actions.saveKnowledge(knowledge),/AI unavailable/);
});
for (const action of ['duyet', 'tu-choi']) {
 test(`${action} current BFF forwards authenticated PATCH and never claims success on HTTP/network failure`,async()=>{
   const calls=[];let failure=false;
   const upstream=async(...args)=>{calls.push(args);if(failure)throw Object.assign(Error('SQL SECRET'),{status:403});return {ma_ho_so:'H1'};};
   const route=loader({'server-only':{},'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},'@/libs/api-services/backend.server':{backendRequest:upstream},'@/services/user.service':{adminService:{}}})('app/api/backend/[service]/[...path]/route.ts');
   const call=()=>{const url=`http://localhost/api/backend/score/ho-so/H1/${action}`;return route.PATCH(Object.assign(new Request(url,{method:'PATCH',body:JSON.stringify({ghi_chu:'Missing evidence'})}),{nextUrl:new URL(url)}),{params:Promise.resolve({service:'score',path:['ho-so','H1',action]})});};
   assert.equal((await call()).status,200);assert.equal(calls[0][2].auth,'admin');assert.equal(calls[0][2].method,'PATCH');assert.deepEqual(calls[0][2].body,{ghi_chu:'Missing evidence'});
   failure=true;const rejected=await call();assert.equal(rejected.status,403);assert.doesNotMatch(await rejected.text(),/SECRET/);
 });
}
