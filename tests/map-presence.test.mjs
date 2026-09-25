import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneEntities,positionAt,sceneDuration,routeFeature} from '../app/map-presence-model.mjs';
test('all displayed positions are explicitly simulated and static facilities have no invented telemetry',()=>{
 assert.equal(new Set(sceneEntities.map(e=>e.id)).size,sceneEntities.length);
 for(const entity of sceneEntities){assert.equal(entity.provenance,'simulation');assert.ok(entity.coordinates.every(Number.isFinite));if(entity.kind==='facility')assert.equal(entity.path,undefined);}
 assert.ok(sceneEntities.some(e=>e.kind==='team'));assert.ok(sceneEntities.some(e=>e.kind==='vehicle'));
});
test('playback follows bounded paths, reaches destination and never teleports at the end',()=>{
 const car=sceneEntities.find(e=>e.kind==='vehicle');
 assert.deepEqual(positionAt(car,-1),car.path[0]);assert.deepEqual(positionAt(car,sceneDuration),car.path.at(-1));assert.deepEqual(positionAt(car,sceneDuration+10),car.path.at(-1));
 const mid=positionAt(car,sceneDuration/2);assert.ok(mid.every(Number.isFinite));assert.notDeepEqual(mid,car.path[0]);
 const entry=sceneEntities.find(e=>e.id==='entry');assert.deepEqual(positionAt(entry,30),entry.coordinates);
});
test('route geometry exists only for simulated moving targets',()=>{
 const car=sceneEntities.find(e=>e.kind==='vehicle');assert.equal(routeFeature(car).geometry.type,'LineString');assert.equal(routeFeature(car).properties.provenance,'simulation');assert.equal(routeFeature(sceneEntities.find(e=>e.id==='parking')),null);
});
