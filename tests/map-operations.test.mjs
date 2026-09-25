import test from 'node:test';
import assert from 'node:assert/strict';
import {mapDetail,operationZones,zoneStyle} from '../app/map-operations.mjs';
import {zones} from '../app/zones.mjs';
test('map declutters overview and reveals camera geometry only at close zoom',()=>{
 assert.equal(mapDetail(14),'region');assert.equal(mapDetail(16),'area');assert.equal(mapDetail(17),'area');assert.equal(mapDetail(18),'close');
});
test('every map polygon targets an existing work zone with closed-area geometry',()=>{
 for(const z of operationZones){assert.ok(z.id==='building'||zones.some(work=>work.id===z.id));assert.ok(z.points.length>=3);assert.ok(z.points.every(([lat,lng])=>Number.isFinite(lat)&&Number.isFinite(lng)));}
 assert.equal(zoneStyle('unknown').dashArray,'6 4');assert.ok(zoneStyle('incident',true).weight>zoneStyle('incident').weight);
});
