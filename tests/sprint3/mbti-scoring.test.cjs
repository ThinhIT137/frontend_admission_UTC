const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('../sprint1/helpers.cjs');
const { MBTI_QUESTIONS, MBTI_PERSONALITIES, calculateMbtiType } = loader()('app/(main)/trac-nghiem-mbti/mbtiData.ts');
for (const e of 'EI') for (const s of 'SN') for (const t of 'TF') for (const j of 'JP') {
  const type = e + s + t + j;
  test(`S3 local MBTI scoring can produce ${type} and career advice`, () => {
    const answers = Object.fromEntries(MBTI_QUESTIONS.map(q => {
      const targetFirst = type.includes(q.dimension[0]);
      return [q.id, (q.direction === 1) === targetFirst ? 5 : 1];
    }));
    const result = calculateMbtiType(answers, MBTI_QUESTIONS);
    assert.equal(result.type, type);
    assert.ok(MBTI_PERSONALITIES[type].suggestedMajors.length > 0);
    assert.ok(Object.values(result.scores).every(n => Number.isFinite(n) && n >= 0));
  });
}
