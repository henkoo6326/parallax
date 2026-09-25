import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,reduce,hydrateState} from '../app/state.mjs';
import {zoneSummary,zoomView,INITIAL_VIEW,validView} from '../app/map-model.mjs';
import {liveMapView} from '../app/live-map.mjs';
test('review acknowledgement does not mark a map zone complete; saved results do',()=>{
 let s=createState(),r=s.handoffRequests.find(r=>r.id==='h1');
 assert.equal(zoneSummary(s,'2F').status,'미확인');
 s=reduce(s,{type:'REQUEST_READ',id:r.id});assert.equal(zoneSummary(s,'2F').status,'미확인');
 s=reduce(s,{type:'ZONE_RESULT',id:r.id,body:'계단 확인',status:'완료',time:'12:30',recordId:'map-result'});
 assert.equal(zoneSummary(s,'2F').status,'완료');assert.equal(zoneSummary(s,'2F').remaining,0);assert.match(liveMapView(s,()=>'',()=>'', 'primary'),/완료 · 남은 업무 0/);
 assert.equal(zoneSummary(hydrateState(s),'2F').status,'완료');
 assert.equal(zoneSummary(s,'parking').status,'미확인');
});
test('map selection resolves work zone and dismissal keeps operational state',()=>{
 let s=reduce(createState(),{type:'MAP_ZONE',id:'3F'});assert.equal(s.floor,'3F');assert.equal(s.selectedZone,'building');assert.equal(s.mapSelection,'3F');
 s=reduce(s,{type:'MAP_ZONE',id:'entry'});assert.equal(s.floor,'1F');assert.equal(s.selectedZone,'entry');
 const prior=s;s=reduce(s,{type:'MAP_ZONE',id:null});assert.equal(s.mapSelection,null);assert.equal(s.selectedZone,prior.selectedZone);
 assert.equal(reduce(s,{type:'MAP_ZONE',id:'bad'}),s);
});
test('zoom anchors retain screen fraction and clamp extreme wheel or pinch movement',()=>{
 const v=INITIAL_VIEW,a={x:400,y:340},z=zoomView(v,.5,a);
 assert.ok(Math.abs((a.x-v.x)/v.w-(a.x-z.x)/z.w)<1e-10);
 assert.ok(Math.abs((a.y-v.y)/v.h-(a.y-z.y)/z.h)<1e-10);
 assert.equal(zoomView(v,.001,a).w,240);assert.equal(zoomView(v,100,a).w,1500);assert.ok(validView(z));assert.ok(!validView({x:0,y:0,w:NaN,h:1}));
});
test('map uses real geography and details appear only for selected zone',()=>{
 const s=createState(),html=liveMapView(s,()=>'',()=>'', 'primary');assert.ok(html.includes('실제 지도'));assert.ok(!html.includes('data-team-svg'));assert.ok(!html.includes('zone-inspector'));assert.ok(!/openstreetmap|leaflet|https?:/i.test(html));
 const detail=liveMapView(reduce(s,{type:'MAP_ZONE',id:'2F'}),()=>'',()=>'', 'primary');assert.ok(detail.includes('zone-inspector'));assert.ok(detail.includes('현장 2팀'));assert.ok(detail.includes('request-scene'));
});
