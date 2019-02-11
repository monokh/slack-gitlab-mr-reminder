const { isWipMr } = require('./is-wip-mr');

test('Bracket WIP case-insensitive', async () => {
  expect(isWipMr(' [wiP]true')).toBeTruthy();
});

test('Colon WIP case-insensitive', async () => {
  expect(isWipMr(' wiP:true')).toBeTruthy();
});

test('not a WIP', async () => {
  expect(isWipMr(' [wi P]true')).toBeFalsy();
  expect(isWipMr(' w iP:true')).toBeFalsy();
});
