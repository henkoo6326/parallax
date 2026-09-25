import {requestZone} from './zones.mjs';
export const cameraPlacement={lat:37.54215,lng:126.8420,bearing:270,angle:70,range:90};
export const showCameraFov=s=>Boolean(s.mapFov&&s.layers.cameras);
// Local metre approximation for an illustrative sector, not an optical visibility calculation.
export function cameraSector(c=cameraPlacement){
 const points=[[c.lat,c.lng]],rad=Math.PI/180;
 for(let i=0;i<=24;i++){
  const a=(c.bearing-c.angle/2+c.angle*i/24)*rad;
  points.push([c.lat+Math.cos(a)*c.range/111320,c.lng+Math.sin(a)*c.range/(111320*Math.cos(c.lat*rad))]);
 }
 return points;
}
const seed=[
 {id:'c1',type:'assignment',time:'12:05',title:'2층 서편 확인 배정',who:'지휘통제실',why:'신고 위치와 인접한 구역의 상황을 먼저 확인하기 위해 배정.',detail:'현장 2팀 담당',request:'h1'},
 {id:'c2',type:'request',time:'12:12',title:'계단실 재확인 요청',who:'박민수 경장',why:'조도가 낮아 계단 상부 시야를 충분히 확인하지 못함.',detail:'미확인 구간을 다음 담당자에게 전달',request:'h1'}
];
export function situationEvents(s){
 const changes=s.handoffRequests.filter(r=>r.kind==='변경 사항').map(r=>({id:r.id==='h3'?'c3':`change:${r.id}`,type:'change',time:r.decisionTime||'시각 미기록',title:r.title,who:r.decisionBy||r.author,why:r.reason,detail:`${r.changeBefore||'미기록'} → ${r.changeAfter||'미기록'}`,request:r.id}));
 const requests=[...seed,...changes].map(e=>{const r=s.handoffRequests.find(r=>r.id===e.request);return {...e,source:r?.source,second:r?.second,zone:r?requestZone(r):null,next:r?.next};});
 const results=s.records.filter(r=>r.kind==='현장 확인 결과'&&r.requestId).map(r=>({id:r.id,type:'result',time:r.time,title:`현장 결과 · ${r.status}`,who:r.author,why:'담당자가 남긴 현장 확인 기록',detail:r.title,request:r.requestId,source:r.source,second:r.playhead,zone:r.zone}));
 return [...results,...requests.reverse()];
}
export const selectedHistory=s=>situationEvents(s).find(e=>e.id===s.historySelection);
export const zoneMapPosition=zone=>zone==='entry'?{lat:37.54145,lng:126.84165,zoom:18}:zone==='parking'?{lat:37.5425,lng:126.8403,zoom:18}:{lat:37.5423,lng:126.8408,zoom:18};
