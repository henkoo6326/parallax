import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,reduce,hydrateState} from '../app/state.mjs';
import {demoBuilding,buildingWork,validOpenViewport} from '../app/open-map-model.mjs';
import {liveMapView} from '../app/live-map.mjs';
test('one real footprint holds both simulated floors; one floor completion never completes the building',()=>{
 let s=createState();const before=buildingWork(s);assert.deepEqual(before.floors.map(f=>f.id),['2F','3F']);
 const r=s.handoffRequests.find(r=>r.id==='h1');s=reduce(s,{type:'ZONE_RESULT',id:r.id,body:'확인',status:'완료',time:'12:30',recordId:'ofm-test'});
 const result=buildingWork(hydrateState(s));assert.equal(result.floors[0].status,'완료');assert.equal(result.floors[1].status,'미확인');assert.equal(result.complete,1);assert.equal(result.remaining,1);assert.equal(result.status,undefined);
 assert.equal(demoBuilding.geometry.type,'Polygon');const ring=demoBuilding.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));
});
test('map UI separates unmapped locations from building floors and does not require Apple auth',()=>{
 const s=createState(),html=liveMapView(s,()=>'',()=>'', 'primary');assert.match(html,/시연 건물/);assert.match(html,/가상 배치/);assert.match(html,/위치 미확정/);assert.match(html,/CCTV/);assert.doesNotMatch(html,/Apple 지도|data-apple|map-fov|가상 도시/);
 const detail=liveMapView(reduce(s,{type:'MAP_ZONE',id:'entry'}),()=>'',()=>'', 'primary');assert.match(detail,/선택 구역 상세/);assert.match(detail,/지도 위치 미확정/);
});
test('open map viewport rejects foreign and invalid coordinates and survives hydration',()=>{
 const v={center:[126.841,37.542],zoom:17};assert.ok(validOpenViewport(v));assert.ok(!validOpenViewport({center:[NaN,1],zoom:17}));assert.ok(!validOpenViewport({center:[126,37],zoom:100}));assert.deepEqual(hydrateState({...createState(),openMapViewport:v}).openMapViewport,v);
});
