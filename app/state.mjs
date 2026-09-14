export function createState(){return {
 version:1,theme:'dark',mode:'field',team:'현장 2팀',folded:false,primary:'map',secondary:'mission',active:'mission',floor:'2F',camera:'cctv',zoom:1,
 online:true,connected:true,recording:false,alertRead:false,checks:[false,false,false],taskStatus:'진행 중',draft:'',recipient:'지휘통제실',handoff:'pending',reviewed:false,briefing:false,
 messages:[{id:'initial',from:'지휘통제실',body:'증원 1팀이 이동 중입니다. 동측 출입구에서 합류해 주세요.',time:'12:14',status:'received'}],
 records:[{id:'r1',title:'계단실 조명 확인 필요',kind:'음성 기록',time:'12:12',place:'2층 · 계단실'},{id:'r2',title:'동측 출입구 확인',kind:'AR 장면',time:'12:09',place:'1층 · 공동현관'}]
};}
export function reduce(s,a){
 switch(a.type){
 case 'THEME':return {...s,theme:a.value==='light'?'light':'dark'};
 case 'FOLD':return {...s,folded:!s.folded};
 case 'NAV':{const panel=a.panel||'primary',other=panel==='primary'?'secondary':'primary';return {...s,[panel]:a.view,[other]:s[other]===a.view?s[panel]:s[other],active:a.view};}
 case 'MODE':return {...reduce(s,{type:'NAV',panel:'secondary',view:a.value==='review'?'handoff':'mission'}),mode:a.value};
 case 'DRAFT':return {...s,draft:a.value};
 case 'CAMERA':return {...reduce(s,{type:'NAV',panel:'secondary',view:'video'}),camera:a.id};
 case 'FLOOR':return {...s,floor:a.value};
 case 'ZOOM':return {...s,zoom:Math.max(1,Math.min(1.6,s.zoom+a.delta))};
 case 'ONLINE':return {...s,online:a.value};
 case 'RECIPIENT':return {...s,recipient:a.value};
 case 'RETRY':return s.online?{...s,handoff:s.handoff==='queued'?'requested':s.handoff,messages:s.messages.map(m=>m.status==='queued'?{...m,status:'sent'}:m)}:s;
 case 'SEND_REPORT':return s.draft.trim()&&!s.messages.some(m=>m.id===a.id)?{...s,messages:[...s.messages,{id:a.id,body:s.draft,from:'나',to:a.recipient||s.recipient,time:a.time,status:s.online?'sent':'queued'}]}:s;
 case 'MESSAGE':return a.body.trim()?{...s,messages:[...s.messages,{id:a.id,body:a.body,from:'나',to:s.recipient,time:a.time,status:s.online?'sent':'queued'}]}:s;
 case 'CHECK':return {...s,checks:s.checks.map((v,i)=>i===a.index?!v:v)};
 case 'COMPLETE':return s.checks.every(Boolean)?{...s,taskStatus:'완료'}:s;
 case 'HOLD_TASK':return {...s,taskStatus:s.taskStatus==='보류'?'진행 중':'보류'};
 case 'ALERT_READ':return {...s,alertRead:true};
 case 'RECORD':return {...s,recording:!s.recording};
 case 'ADD_RECORD':return {...s,records:[a.record,...s.records]};
 case 'CONNECT':return {...s,connected:!s.connected};
 case 'REVIEWED':return {...s,reviewed:a.value};
 case 'ACCEPT':return s.reviewed?{...s,handoff:'accepted'}:s;
 case 'HOLD_HANDOFF':return {...s,handoff:'held'};
 case 'REQUEST_HANDOFF':return {...s,handoff:s.online?'requested':'queued'};
 case 'CONTINUE':return s.handoff==='accepted'&&s.connected?{...s,mode:'field',team:'증원 1팀',floor:'3F',secondary:'mission',active:'mission',checks:[false,false,false],taskStatus:'진행 중'}:s;
 case 'BRIEFING':return {...s,briefing:!s.briefing};
 default:return s;
 }
}
