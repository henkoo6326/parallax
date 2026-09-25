import test from 'node:test';
import assert from 'node:assert/strict';
import {createState, reduce, hydrateState} from '../app/state.mjs';
import {sources} from '../app/media.mjs';

test('folding and switching panels retain draft and selected camera',()=>{
 let s=createState();
 s=reduce(s,{type:'DRAFT',value:'현장 확인 내용 수정'});
 s=reduce(s,{type:'CAMERA',id:'cctv'});
 s=reduce(s,{type:'FOLD'});
 s=reduce(s,{type:'NAV',panel:'primary',view:'records'});
 assert.equal(s.draft,'현장 확인 내용 수정');
 assert.equal(s.camera,'cctv');
 assert.equal(s.folded,true);
 assert.equal(s.secondary,'video');
});
test('offline reports queue and retry once without duplicates',()=>{
 let s=reduce(createState(),{type:'ONLINE',value:false});
 s=reduce(s,{type:'DRAFT',value:'계단실 조명 확인 필요'});
 s=reduce(s,{type:'SEND_REPORT',id:'report-1',time:'12:20',recipient:'지휘통제실'});
 assert.equal(s.messages.at(-1).status,'queued');
 s=reduce(s,{type:'ONLINE',value:true});
 s=reduce(s,{type:'RETRY'});
 s=reduce(s,{type:'RETRY'});
 assert.equal(s.messages.filter(m=>m.id==='report-1').length,1);
 assert.equal(s.messages.at(-1).status,'sent');
});
test('handoff needs review and explicit acceptance before entering field mode',()=>{
 let s=reduce(createState(),{type:'MODE',value:'review'});
 s=reduce(s,{type:'ACCEPT'});
 assert.notEqual(s.handoff,'accepted');
 for(const r of s.handoffRequests)s=reduce(s,{type:'REQUEST_READ',id:r.id});
 s=reduce(s,{type:'REVIEWED',value:true});
 s=reduce(s,{type:'ACCEPT'});
 assert.equal(s.handoff,'accepted');
 assert.equal(s.mode,'review');
 s=reduce(s,{type:'CONTINUE'});
 assert.equal(s.mode,'field');
 assert.equal(s.team,'증원 1팀');
});
test('completion requires all checklist items and updates the task status',()=>{
 let s=reduce(createState(),{type:'COMPLETE'});
 assert.equal(s.taskStatus,'진행 중');
 for(let i=0;i<3;i++) s=reduce(s,{type:'CHECK',index:i});
 s=reduce(s,{type:'COMPLETE'});
 assert.equal(s.taskStatus,'완료');
});
test('empty report does not create a message',()=>{
 let s=reduce(createState(),{type:'DRAFT',value:'   '});
 let n=s.messages.length;
 s=reduce(s,{type:'SEND_REPORT',id:'empty'});
 assert.equal(s.messages.length,n);
});
test('selecting the other pane tool swaps panes without duplicating editors',()=>{
 let s=reduce(createState(),{type:'NAV',panel:'secondary',view:'report'});
 s=reduce(s,{type:'NAV',panel:'primary',view:'report'});
 assert.equal(s.primary,'report');
 assert.equal(s.secondary,'map');
});
test('offline handoff requests can be retried after connection restoration',()=>{
 let s=reduce(createState(),{type:'ONLINE',value:false});
 s=reduce(s,{type:'REQUEST_HANDOFF'});
 assert.equal(s.handoff,'queued');
 s=reduce(s,{type:'ONLINE',value:true});
 s=reduce(s,{type:'RETRY'});
 assert.equal(s.handoff,'requested');
});
test('new and old sessions start with the white-first refresh and keep their draft',()=>{
 assert.equal(createState().theme,'light');
 const restored=hydrateState({version:1,theme:'dark',camera:'body',draft:'보존할 초안'});
 assert.equal(restored.theme,'light');
 assert.equal(restored.camera,'ar');
 assert.equal(restored.draft,'보존할 초안');
 assert.equal(restored.mapStyle,'standard');
 assert.ok(sources.every(s=>s.id!=='body'));
});
test('map mode and layers preserve selected floor through folding',()=>{
 let s=reduce(createState(),{type:'FLOOR',value:'3F'});
 s=reduce(s,{type:'MAP_STYLE',value:'drone'});
 s=reduce(s,{type:'LAYER',key:'team',value:false});
 s=reduce(s,{type:'FOLD'});
 assert.equal(s.floor,'3F');
 assert.equal(s.mapStyle,'drone');
 assert.equal(s.layers.team,false);
});
test('unsupported camera cannot be selected and playback stops at end of clip',()=>{
 let s=reduce(createState(),{type:'CAMERA',id:'body'});
 assert.equal(s.camera,'ar');
 s=reduce(s,{type:'SEEK',value:83});
 s=reduce(s,{type:'PLAY'});
 s=reduce(s,{type:'TICK'});
 assert.equal(s.playhead,84);
 assert.equal(s.playing,false);
});
test('refresh preserves an explicit dark choice made after the new release',()=>{
 const s=reduce(createState(),{type:'THEME',value:'dark'});
 assert.equal(hydrateState(s).theme,'dark');
});

test('switching a source preserves video and report pane positions',()=>{
 let s={...createState(),primary:'video',secondary:'report',draft:'유지할 초안'};
 s=reduce(s,{type:'CAMERA',id:'cctv'});
 assert.equal(s.primary,'video');
 assert.equal(s.secondary,'report');
 assert.equal(s.draft,'유지할 초안');
});

test('contextual notes retain source and drafts through folding and restoration',()=>{
 let s=reduce(createState(),{type:'NOTE_DRAFT',view:'map',value:'동측 출입구 확인 필요'});
 s=reduce(s,{type:'FOLD'});
 s=hydrateState(s);
 assert.equal(s.noteDrafts.map,'동측 출입구 확인 필요');
 s=reduce(s,{type:'SAVE_NOTE',note:{id:'note-1',view:'map',body:s.noteDrafts.map,context:'2F · 동측 출입구',time:'12:20'}});
 assert.equal(s.notes[0].view,'map');
 assert.equal(s.notes[0].context,'2F · 동측 출입구');
 assert.equal(s.noteDrafts.map,'');
 assert.equal(s.records.length,2);
 s=reduce(s,{type:'DELETE_NOTE',id:'note-1'});
 assert.equal(s.notes.length,0);
});
test('empty notes are rejected without clearing an unrelated menu draft',()=>{
 let s=reduce(createState(),{type:'NOTE_DRAFT',view:'mission',value:'유지할 임무 메모'});
 s=reduce(s,{type:'SAVE_NOTE',note:{id:'empty-note',view:'map',body:'   '}});
 assert.equal(s.notes.length,0);
 assert.equal(s.noteDrafts.mission,'유지할 임무 메모');
});
test('before and after photo reviews remain independent and do not complete mission',()=>{
 const s=reduce(createState(),{type:'PHOTO_CONFIRM',phase:'before'});
 assert.equal(s.photoConfirmed.before,true);
 assert.equal(s.photoConfirmed.after,false);
 assert.equal(s.taskStatus,'진행 중');
});

test('handoff scene retains exact source and timestamp across fold and hydration',()=>{
 let s=reduce(createState(),{type:'MODE',value:'review'});
 s=reduce(s,{type:'REQUEST_SCENE',id:'h3'});
 assert.equal(s.camera,'cctv');assert.equal(s.playhead,51);
 assert.equal(s.primary,'handoff');assert.equal(s.secondary,'video');
 s=hydrateState(reduce(s,{type:'FOLD'}));
 assert.equal(s.playhead,51);assert.equal(s.camera,'cctv');
});
test('requests require actionable content and a valid timestamp; edits invalidate acceptance review',()=>{
 let s=createState(),count=s.handoffRequests.length;
 s=reduce(s,{type:'SAVE_REQUEST',id:'new'});assert.equal(s.handoffRequests.length,count);
 s=reduce(s,{type:'REQUEST_DRAFT',value:{title:'상부 시야',reason:'조명 부족',next:'보조 조명으로 확인',second:999}});
 s=reduce(s,{type:'SAVE_REQUEST',id:'new'});assert.equal(s.handoffRequests.length,count);
 s=reduce(s,{type:'REQUEST_DRAFT',value:{second:28}});
 s=reduce(s,{type:'SAVE_REQUEST',id:'new'});assert.equal(s.handoffRequests.length,count+1);
 assert.equal(s.handoffRequests.at(-1).next,'보조 조명으로 확인');assert.equal(s.requestDraft.title,'');
 s=reduce(s,{type:'REVIEWED',value:true});s=reduce(s,{type:'ACCEPT'});assert.notEqual(s.handoff,'accepted');
 assert.deepEqual(s.checks,[false,false,false]);
});

test('real map viewport survives folding, indoor and drone transitions, and restore',()=>{
 const viewport={lat:37.543,lng:126.841,zoom:18};
 let s={...createState(),mapViewport:viewport};
 s=reduce(s,{type:'MAP_STYLE',value:'indoor'});
 assert.equal(s.mapStyle,'indoor');
 s=reduce(s,{type:'MAP_STYLE',value:'drone'});
 s=hydrateState(JSON.parse(JSON.stringify({...s,folded:true})));
 s=reduce(s,{type:'MAP_STYLE',value:'standard'});
 assert.deepEqual(s.mapViewport,viewport);
 assert.equal(s.floor,'2F');
 assert.equal(s.mapStyle,'standard');
});

test('field results keep acknowledgement separate and link evidence into records',()=>{
 let s=createState();
 assert.equal(reduce(s,{type:'ZONE_RESULT',id:'h1',body:'  ',status:'완료'}),s);
 s=reduce(s,{type:'RESULT_DRAFT',id:'h1',value:'상부 확인, 조도 재확인 필요'});
 s=hydrateState(JSON.parse(JSON.stringify(s)));
 assert.match(s.resultDrafts.h1,/상부/);
 s=reduce(s,{type:'ZONE_RESULT',id:'h1',body:s.resultDrafts.h1,status:'재확인 필요',time:'12:20',recordId:'result-1'});
 assert.equal(s.zoneResults.h1.status,'재확인 필요');
 assert.equal(s.records[0].source,'ar');
 assert.equal(s.records[0].playhead,28);
 assert.deepEqual(s.checks,[false,false,false]);
 assert.equal(s.handoffRequests[0].reviewed,false);
 s=reduce(s,{type:'CHANGE_READ',id:'c3'});
 assert.equal(s.changesRead.c3,true);
 assert.equal(s.zoneResults.h1.status,'재확인 필요');
});

test('new requests follow explicit zones across restore and floor changes', async()=>{
 const {zoneRequests}=await import('../app/zones.mjs');
 let s=createState();
 s=reduce(s,{type:'REQUEST_DRAFT',value:{zone:'parking',source:'ar',second:28,title:'후면 통로 확인',reason:'합류 지원으로 중단',next:'통행 가능 여부 확인'}});
 s=reduce(s,{type:'SAVE_REQUEST',id:'parking-request'});
 s=hydrateState({...s,selectedZone:'parking',floor:'3F'});
 assert.deepEqual(zoneRequests(s).map(r=>r.id),['parking-request']);
 s=reduce(s,{type:'REQUEST_SCENE',id:'parking-request'});
 assert.equal(s.camera,'ar');assert.equal(s.playhead,28);
 s={...s,selectedZone:'building',floor:'1F'};
 assert.deepEqual(zoneRequests(s).map(r=>r.id),['h3']);
 s={...s,floor:'RF'};
 assert.deepEqual(zoneRequests(s).map(r=>r.id),['h2']);
});

test('change requests require before/after, decision maker and time, then survive offline handoff',()=>{
 let s=reduce(createState(),{type:'REQUEST_DRAFT',value:{kind:'변경 사항',title:'합류 변경',reason:'통행 제한',next:'서측에서 합류',second:28}});
 const count=s.handoffRequests.length;
 s=reduce(s,{type:'SAVE_REQUEST',id:'change-new'});
 assert.equal(s.handoffRequests.length,count);
 s=reduce(s,{type:'REQUEST_DRAFT',value:{changeBefore:'동측',changeAfter:'서측',decisionBy:'지휘통제실',decisionTime:'12:30'}});
 s=reduce(s,{type:'SAVE_REQUEST',id:'change-new'});
 s=reduce(s,{type:'ONLINE',value:false});s=reduce(s,{type:'REQUEST_HANDOFF'});
 s=hydrateState(reduce(s,{type:'FOLD'}));
 const r=s.handoffRequests.at(-1);
 assert.equal(r.changeBefore,'동측');assert.equal(r.changeAfter,'서측');assert.equal(r.reason,'통행 제한');
 assert.equal(r.decisionBy,'지휘통제실');assert.equal(r.decisionTime,'12:30');assert.equal(s.handoff,'queued');
 assert.equal(s.requestDraft.changeBefore,'');
});
test('old saved handoff gains missing change context without losing custom requests or drafts',()=>{
 const s=createState();const r=s.handoffRequests.find(r=>r.id==='h3');
 delete r.changeBefore;delete r.changeAfter;delete r.decisionBy;delete r.decisionTime;
 r.reason='지휘실이 합류 위치를 정문에서 동측 출입구로 변경함.';
 s.requestDraft.title='작성 중';s.handoffRequests.push({id:'custom',title:'유지'});
 const restored=hydrateState(s),change=restored.handoffRequests.find(r=>r.id==='h3');
 assert.equal(change.changeBefore,'정문');assert.equal(change.changeAfter,'동측 출입구');
 assert.match(change.reason,/정문 통행 제한/);assert.equal(restored.requestDraft.title,'작성 중');
 assert.equal(restored.handoffRequests.at(-1).id,'custom');
});
test('undoing request review after acceptance blocks continuation without completing field work',()=>{
 let s=createState();for(const r of s.handoffRequests)s=reduce(s,{type:'REQUEST_READ',id:r.id});
 s=reduce(s,{type:'REVIEWED',value:true});s=reduce(s,{type:'ACCEPT'});
 s=reduce(s,{type:'REQUEST_READ',id:'h3'});s=reduce(s,{type:'CONTINUE'});
 assert.notEqual(s.handoff,'accepted');assert.equal(s.team,'현장 2팀');
 assert.equal(s.taskStatus,'진행 중');assert.deepEqual(s.checks,[false,false,false]);
});

test('notes open beside their source and retain the context of an unfinished draft',()=>{
 let s=createState();
 s=reduce(s,{type:'OPEN_NOTES',panel:'primary',reference:{view:'map',context:'2층 · 시연 건물',zone:'2F'}});
 assert.equal(s.primary,'map');assert.equal(s.secondary,'notes');
 s=reduce(s,{type:'NOTE_DRAFT',view:'map',value:'조명 확인 필요'});
 s=reduce(s,{type:'OPEN_NOTES',panel:'primary',reference:{view:'map',context:'3층',zone:'3F'}});
 assert.equal(s.noteTarget.zone,'2F');assert.equal(hydrateState(s).noteDrafts.map,'조명 확인 필요');
 s=reduce(s,{type:'SAVE_NOTE',note:{id:'memo-test',view:'map',body:s.noteDrafts.map,context:s.noteTarget.context,reference:s.noteTarget,time:'12:40'}});
 assert.equal(s.notes[0].reference.zone,'2F');assert.equal(s.noteDrafts.map,'');assert.equal(s.secondary,'notes');
});
