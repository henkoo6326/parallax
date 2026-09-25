// All coordinates below are authored demonstration placements, never GPS data.
// Vehicle line sampled from the rendered transportation layer; team line offset
// from the adjacent street for demonstration. Neither is a verified travel route.
export const sceneDuration=90;
export const sceneEntities=[
 {id:'field-2',kind:'team',icon:'team',name:'현장 2팀',short:'현장 2',coordinates:[126.84067,37.54251],zone:'2F',status:'외곽 확인',detail:'2층·계단실 업무 담당. 지도 표식은 팀의 실제 위치가 아닌 시연 위치입니다.'},
 {id:'support-1',kind:'team',icon:'team',name:'증원 1팀',short:'증원 1',coordinates:[126.842052,37.542428],path:[[126.842052,37.542428],[126.841499,37.542092],[126.841280,37.541998]],zone:'3F',status:'합류 이동',detail:'3층·옥상 업무와 연결된 증원 팀입니다. 이동과 도착은 시연이며 실제 인수를 확정하지 않습니다.'},
 {id:'patrol-21',kind:'vehicle',icon:'car',name:'순찰차 21호',short:'21호',coordinates:[126.84159994125366,37.542854699497326],path:[[126.84159994125366,37.542854699497326],[126.84074699878693,37.54234428552486],[126.84066116809845,37.54230175086941]],zone:'parking',status:'현장 접근',detail:'주차장 업무와 연결된 차량 시연입니다. 이동선은 경로 안내나 실제 주행 기록이 아닙니다.'},
 {id:'entry',kind:'facility',icon:'entry',name:'동측 출입구',short:'출입구',coordinates:[126.84124,37.54213],zone:'entry',status:'접근 확인 필요',detail:'출입 가능 여부와 문 개방 상태를 확인할 지점입니다. 실제 출입구 좌표는 미확정입니다.'},
 {id:'parking',kind:'facility',icon:'parking',name:'후면 주차장',short:'주차장',coordinates:[126.84096,37.54169],zone:'parking',status:'차량 진입 미확인',detail:'차량 진입과 대기 공간 확인을 위한 시연 지점입니다. 실제 주차장 위치와 수용 규모는 미확정입니다.'},
 {id:'camera',kind:'facility',icon:'cctv',name:'CCTV 연결 자료',short:'CCTV',coordinates:[126.84156,37.54253],status:'영상 근거 연결',detail:'기존 CCTV 자료를 열 수 있습니다. 실제 설치 위치·방향은 미확정이며 감시 범위를 추정하지 않습니다.'},
 {id:'meeting',kind:'facility',icon:'flag',name:'합류 지점',short:'합류',coordinates:[126.84059,37.54173],zone:'entry',status:'시연 제안 지점',detail:'팀 간 합류를 설명하기 위한 가상 지점입니다. 실제 집결지 지정이나 안전 확인을 의미하지 않습니다.'}
].map(e=>({...e,provenance:'simulation'}));
export function positionAt(entity,seconds){
 if(!entity.path)return [...entity.coordinates];
 const path=entity.path, lengths=path.slice(1).map((p,i)=>Math.hypot((p[0]-path[i][0])*Math.cos(p[1]*Math.PI/180),p[1]-path[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);let distance=Math.min(1,Math.max(0,Number.isFinite(seconds)?seconds/sceneDuration:0))*total;
 if(distance>=total)return [...path.at(-1)];
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const t=lengths[i]?distance/lengths[i]:0;return path[i].map((v,k)=>v+(path[i+1][k]-v)*t);}distance-=lengths[i];}
 return [...path.at(-1)];
}
export function routeFeature(entity){return entity?.path?{type:'Feature',properties:{provenance:'simulation'},geometry:{type:'LineString',coordinates:entity.path}}:null;}
