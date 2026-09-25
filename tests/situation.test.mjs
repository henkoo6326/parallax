import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,reduce,hydrateState} from '../app/state.mjs';
import * as situation from '../app/situation.mjs';

test('saved change requests and each field result join history with original evidence',()=>{
 let s=reduce(createState(),{type:'REQUEST_DRAFT',value:{kind:'변경 사항',title:'경로 변경',reason:'출입 통제',next:'후면 확인',source:'cctv',second:51,zone:'parking',changeBefore:'정문',changeAfter:'후면',decisionBy:'지휘실',decisionTime:'12:20'}});
 s=reduce(s,{type:'SAVE_REQUEST',id:'new-change'});
 s=reduce(s,{type:'ZONE_RESULT',id:'new-change',body:'진입로 확인 중',status:'확인 중',time:'12:21',recordId:'result1'});
 s=reduce(s,{type:'ZONE_RESULT',id:'new-change',body:'확인 마침',status:'완료',time:'12:22',recordId:'result2'});
 const events=situation.situationEvents(hydrateState(s));
 const change=events.find(e=>e.request==='new-change'&&e.type==='change');
 assert.equal(change.why,'출입 통제');assert.equal(change.detail,'정문 → 후면');
 assert.equal(change.zone,'parking');assert.equal(change.second,51);
 assert.equal(events.filter(e=>e.type==='result').length,2);
 assert.equal(events.find(e=>e.id==='result1').detail,'진입로 확인 중');
});
test('history selection and exit preserve current task, drafts and result state across fold',()=>{
 let s={...createState(),taskStatus:'완료',draft:'보고 초안',zoneResults:{h1:{status:'완료',body:'확인함'}}};
 s=reduce(s,{type:'HISTORY_SELECT',id:'c1'});
 assert.equal(s.historySelection,'c1');
 s=hydrateState(reduce(s,{type:'FOLD'}));
 assert.equal(s.historySelection,'c1');assert.equal(s.taskStatus,'완료');assert.equal(s.draft,'보고 초안');assert.equal(s.zoneResults.h1.status,'완료');
 assert.equal(reduce(s,{type:'HISTORY_SELECT',id:'unknown'}).historySelection,'c1');
 assert.equal(reduce(s,{type:'HISTORY_EXIT'}).historySelection,null);
});
test('history zone navigation selects matching floor without changing task completion',()=>{
 let s=reduce(createState(),{type:'HISTORY_ZONE',id:'c3'});
 assert.equal(s.selectedZone,'entry');assert.equal(s.floor,'1F');assert.equal(s.active,'map');assert.equal(s.taskStatus,'진행 중');
 assert.equal(s.historySelection,'c3');
});
test('camera sector uses configured origin and bounded radius, hidden with camera layer',()=>{
 const s=reduce(createState(),{type:'MAP_FOV'});
 assert.equal(situation.showCameraFov(s),true);
 assert.equal(situation.showCameraFov(reduce(s,{type:'LAYER',key:'cameras',value:false})),false);
 assert.equal(hydrateState(s).mapFov,true);
 const points=situation.cameraSector({lat:0,lng:0,bearing:0,angle:60,range:100});
 assert.deepEqual(points[0],[0,0]);assert.ok(points.length>10);
 assert.ok(points[1][1]<0);assert.ok(points.at(-1)[1]>0);
 for(const [lat,lng] of points.slice(1))assert.ok(Math.abs(Math.hypot(lat*111320,lng*111320)-100)<0.01);
});

test('legacy saved results remain visible in history without invented earlier versions',()=>{
 const s={...createState(),zoneResults:{h1:{status:'완료',body:'이전 세션 확인 결과',author:'현장 2팀',time:'12:25'}}};
 const results=situation.situationEvents(hydrateState(s)).filter(e=>e.type==='result');
 assert.equal(results.length,1);assert.equal(results[0].detail,'이전 세션 확인 결과');assert.equal(results[0].second,28);
});
