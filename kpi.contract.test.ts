import test from 'node:test';
import assert from 'node:assert/strict';
import { isBacklogStatus, isPublicAgentReply, minutesBetween, median, percentile } from './kpi';
import { assertMinutesField } from './contract';

test('Backlog status definition is EXACT (2,3,6)', () => {
  assert.equal(isBacklogStatus(2), true);
  assert.equal(isBacklogStatus(3), true);
  assert.equal(isBacklogStatus(6), true);

  assert.equal(isBacklogStatus(4), false); // Resolved
  assert.equal(isBacklogStatus(5), false); // Closed
  assert.equal(isBacklogStatus(1), false); // New (om den används hos er)
});

test('Public agent reply filter: incoming=false AND private!=true', () => {
  assert.equal(isPublicAgentReply({ incoming: false, private: false }), true);
  assert.equal(isPublicAgentReply({ incoming: false }), true); // undefined = publikt
  assert.equal(isPublicAgentReply({ incoming: false, private: true }), false);
  assert.equal(isPublicAgentReply({ incoming: true, private: false }), false);
});

test('Minutes are integer minutes (not hours)', () => {
  const created = '2025-12-14T10:00:00.000Z';
  const replied  = '2025-12-14T11:30:00.000Z';
  const mins = minutesBetween(created, replied);
  assert.equal(mins, 90);

  assertMinutesField('median_frt_minutes', mins);
  assert.throws(() => assertMinutesField('median_frt_minutes', 1.5), /integer minutes/);
});

test('Median and p90 are stable and return minutes', () => {
  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const med = median(values);
  const p90 = percentile(values, 0.9);

  assert.equal(med, 55);
  assert.equal(p90, 90);

  assertMinutesField('median_resolution_minutes', med);
  assertMinutesField('p90_resolution_minutes', p90);
});
