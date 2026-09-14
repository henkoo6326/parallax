import test from 'node:test';
import assert from 'node:assert/strict';
import {createState, reduce} from '../app/state.mjs';

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
