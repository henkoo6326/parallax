import {requestZone} from './zones.mjs';
export const mapZones=[
 {id:'2F',name:'2층 계단실·서편',x:362,y:302,w:74,h:112},
 {id:'3F',name:'3층·옥상',x:444,y:302,w:74,h:112},
 {id:'parking',name:'후면 주차장',x:362,y:462,w:156,h:96},
 {id:'entry',name:'동측 출입구',x:562,y:462,w:156,h:96}
];
export function zoneSummary(s,id){
 const requests=s.handoffRequests.filter(r=>requestZone(r)===id);
 const results=requests.map(r=>s.zoneResults?.[r.id]);
 const complete=results.filter(r=>r?.status==='완료').length;
 const status=requests.length&&complete===requests.length?'완료':results.some(r=>r?.status==='재확인 필요')?'재확인 필요':results.some(Boolean)?'확인 중':'미확인';
 const owner=s.zoneOwners?.[id]||(id==='2F'?'현장 2팀':id==='3F'||id==='entry'?(s.handoff==='accepted'?'증원 1팀':'증원 1팀 · 인수 대기'):'미지정');
 return {requests,complete,remaining:requests.length-complete,status,owner};
}
export const INITIAL_VIEW={x:260,y:230,w:580,h:410};
export function zoomView(v,factor,anchor){
 const width=Math.max(240,Math.min(1500,v.w*factor)),f=width/v.w;
 return {x:anchor.x-(anchor.x-v.x)*f,y:anchor.y-(anchor.y-v.y)*f,w:width,h:v.h*f};
}
export function validView(v){return v&&['x','y','w','h'].every(k=>Number.isFinite(v[k]))&&v.w>=240&&v.w<=1500&&v.h>0;}
