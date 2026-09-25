import {situationEvents,zoneMapPosition} from './situation.mjs?v=situation4';
import {zones,requestZone} from './zones.mjs';
import {initialRequests} from './handoff.mjs?v=handoff3';
import {sourceById,sources} from './media.mjs?v=ops1';
export function createState(){return {
 version:1,uiVersion:2,historySelection:null,mapFov:false,handoffRequests:initialRequests(),requestDraft:{source:'ar',second:0,kind:'재확인',title:'',reason:'',next:'',changeBefore:'',changeAfter:'',decisionBy:'',decisionTime:''},notes:[],noteDrafts:{},photoConfirmed:{before:false,after:false},theme:'light',mapStyle:'standard',selectedZone:'building',layers:{team:true,cameras:true,alerts:true},hud:true,playing:false,playhead:0,
 mode:'field',team:'현장 2팀',folded:false,primary:'map',secondary:'mission',active:'mission',floor:'2F',camera:'ar',zoom:1,
 online:true,connected:true,recording:false,alertRead:false,checks:[false,false,false],taskStatus:'진행 중',draft:'',recipient:'지휘통제실',handoff:'pending',reviewed:false,briefing:false,
 messages:[{id:'initial',from:'지휘통제실',body:'증원 1팀이 이동 중입니다. 동측 출입구에서 합류해 주세요.',time:'12:14',status:'received'}],
 records:[{id:'r1',title:'계단실 조명 확인 필요',kind:'음성 기록',time:'12:12',place:'2층 · 계단실'},{id:'r2',title:'동측 출입구 확인',kind:'AR 장면',time:'12:09',place:'1층 · 공동현관'}]
};}
export function hydrateState(saved){
 const fresh=createState();
 if(saved?.version!==1)return fresh;
 const s={...fresh,...saved,layers:{...fresh.layers,...saved.layers},playing:false,briefing:false};
 s.requestDraft={...fresh.requestDraft,...saved.requestDraft};
 s.handoffRequests=s.handoffRequests.map(r=>{
  if(r.id!=='h3'||r.kind!=='변경 사항')return r;
  const base=fresh.handoffRequests.find(v=>v.id==='h3');
  const legacy=r.reason==='지휘실이 합류 위치를 정문에서 동측 출입구로 변경함.';
  return {...base,...r,...(legacy?{reason:base.reason,reviewed:false}:{})};
 });
 if(s.handoffRequests.some(r=>!r.reviewed)){s.reviewed=false;if(s.handoff==='accepted')s.handoff='pending';}
 for(const [id,result] of Object.entries(s.zoneResults||{})){
  const r=s.handoffRequests.find(r=>r.id===id);
  if(r&&!s.records.some(record=>record.kind==='현장 확인 결과'&&record.requestId===id))s.records=[{id:`legacy-result:${id}`,kind:'현장 확인 결과',requestId:id,title:result.body,status:result.status,author:result.author,time:result.time,zone:requestZone(r),place:r.place,source:r.source,playhead:r.second},...s.records];
 }
 if(saved.uiVersion!==2){s.theme='light';s.mapStyle='standard';s.uiVersion=2;}
 if(!sources.some(source=>source.id===s.camera)){s.camera='ar';s.playhead=0;}
 s.playhead=Math.max(0,Math.min(sourceById(s.camera).duration,Number(s.playhead)||0));
 return s;
}
export function reduce(s,a){
 switch(a.type){
 case 'MAP_ZONE':{const id=a.id;if(id!==null&&!['2F','3F','entry','parking'].includes(id))return s;return {...s,mapSelection:id,...(id?{selectedZone:['entry','parking'].includes(id)?id:'building',floor:['entry','parking'].includes(id)?'1F':id}:{})};}
 case 'MAP_FOV':return {...s,mapFov:!s.mapFov};
 case 'HISTORY_SELECT':return situationEvents(s).some(e=>e.id===a.id)?{...s,historySelection:a.id}:s;
 case 'HISTORY_EXIT':return {...s,historySelection:null};
 case 'HISTORY_ZONE':{const event=situationEvents(s).find(e=>e.id===a.id);if(!event?.zone)return s;const zone=event.zone;return {...reduce(s,{type:'NAV',view:'map',panel:'primary'}),historySelection:event.id,mapSelection:zone,consoleViewport:undefined,mapStyle:'standard',selectedZone:['entry','parking'].includes(zone)?zone:'building',floor:zone==='entry'||zone==='parking'?'1F':zone,mapViewport:zoneMapPosition(zone)};}
 case 'RESULT_DRAFT':return {...s,resultDrafts:{...s.resultDrafts,[a.id]:a.value}};
 case 'CHANGE_READ':return {...s,changesRead:{...s.changesRead,[a.id]:!s.changesRead?.[a.id]}};
 case 'ZONE_RESULT':{const r=s.handoffRequests.find(r=>r.id===a.id);if(!r||!a.body?.trim()||!['완료','확인 중','재확인 필요'].includes(a.status))return s;return {...s,zoneResults:{...s.zoneResults,[a.id]:{body:a.body.trim(),status:a.status,time:a.time,author:s.team}},resultDrafts:{...s.resultDrafts,[a.id]:undefined},records:[{id:a.recordId,title:a.body.trim(),kind:'현장 확인 결과',requestId:r.id,status:a.status,author:s.team,zone:requestZone(r),place:r.place,time:a.time,source:r.source,playhead:r.second},...s.records]};}
 case 'REQUEST_DRAFT':return {...s,requestDraft:{...s.requestDraft,...a.value}};
 case 'SAVE_REQUEST':{const d=s.requestDraft,source=sources.find(v=>v.id===d.source);if(d.kind==='변경 사항'&&['changeBefore','changeAfter','decisionBy','decisionTime'].some(key=>!d[key]?.trim()))return s;if(!source||!d.title.trim()||!d.reason.trim()||!d.next.trim()||!Number.isFinite(Number(d.second))||Number(d.second)<0||Number(d.second)>source.duration)return s;return {...s,reviewed:false,handoff:'pending',handoffRequests:[...s.handoffRequests,{...d,id:a.id,second:Number(d.second),author:s.team,zone:zones.some(z=>z.id===d.zone)?d.zone:requestZone({place:source.place}),place:zones.find(z=>z.id===d.zone)?.name||source.place,reviewed:false}],requestDraft:{...d,title:'',reason:'',next:'',changeBefore:'',changeAfter:'',decisionBy:'',decisionTime:''}};}
 case 'REQUEST_READ':return {...s,reviewed:false,handoff:s.handoff==='accepted'?'pending':s.handoff,handoffRequests:s.handoffRequests.map(r=>r.id===a.id?{...r,reviewed:!r.reviewed}:r)};
 case 'REQUEST_SCENE':{const r=s.handoffRequests.find(r=>r.id===a.id);return r?{...reduce(s,{type:'CAMERA',id:r.source}),playhead:r.second,playing:false,...(s.mode==='review'||s.active==='handoff'?{primary:'handoff',secondary:'video'}:{})}:s;}
 case 'OPEN_NOTES':{const source=a.panel==='secondary'?'secondary':'primary',target=source==='primary'?'secondary':'primary';if(s[source]==='notes')return {...s,active:'notes'};const previous=s[target]==='notes'?s.noteReturn:{panel:target,view:s[target]};const reference=s.noteDrafts[a.reference.view]?.trim()&&s.noteTarget?.view===a.reference.view?s.noteTarget:a.reference;return {...s,[target]:'notes',active:'notes',noteTarget:reference,noteReturn:previous};}
 case 'NOTE_TITLE_DRAFT':return {...s,noteTitleDrafts:{...s.noteTitleDrafts,[a.view]:a.value}};
 case 'NOTE_DRAFT':return {...s,noteDrafts:{...s.noteDrafts,[a.view]:a.value}};
 case 'SAVE_NOTE':return a.note.body.trim()?{...s,notes:[a.note,...s.notes],noteTitleDrafts:{...s.noteTitleDrafts,[a.note.view]:''},noteDrafts:{...s.noteDrafts,[a.note.view]:''}}:s;
 case 'DELETE_NOTE':return {...s,notes:s.notes.filter(n=>n.id!==a.id)};
 case 'PHOTO_CONFIRM':return {...s,photoConfirmed:{...s.photoConfirmed,[a.phase]:true}};
 case 'THEME':return {...s,theme:a.value==='light'?'light':'dark'};
 case 'MAP_STYLE':return {...s,mapStyle:['drone','indoor'].includes(a.value)?a.value:'standard'};
 case 'ZONE':return {...s,selectedZone:a.value};
 case 'LAYER':return Object.hasOwn(s.layers,a.key)?{...s,layers:{...s.layers,[a.key]:Boolean(a.value)}}:s;
 case 'HUD':return {...s,hud:!s.hud};
 case 'PLAY':return {...s,playing:!s.playing,playhead:s.playhead>=sourceById(s.camera).duration?0:s.playhead};
 case 'SEEK':return {...s,playhead:Math.max(0,Math.min(sourceById(s.camera).duration,Number(a.value)||0))};
 case 'TICK':{const end=sourceById(s.camera).duration,next=Math.min(end,s.playhead+1);return s.playing?{...s,playhead:next,playing:next<end}:s;}
 case 'FOLD':return {...s,folded:!s.folded};
 case 'NAV':{const panel=a.panel||'primary',other=panel==='primary'?'secondary':'primary';return {...s,[panel]:a.view,[other]:s[other]===a.view?s[panel]:s[other],active:a.view};}
 case 'MODE':return {...reduce(s,{type:'NAV',panel:'secondary',view:a.value==='review'?'handoff':'mission'}),mode:a.value};
 case 'DRAFT':return {...s,draft:a.value};
 case 'CAMERA':return sources.some(source=>source.id===a.id)?{...(s.primary==='video'?{...s,active:'video'}:reduce(s,{type:'NAV',panel:'secondary',view:'video'})),camera:a.id,playing:false,playhead:a.id===s.camera?s.playhead:0}:s;
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
 case 'ACCEPT':return s.reviewed&&s.handoffRequests.every(r=>r.reviewed)?{...s,handoff:'accepted'}:s;
 case 'HOLD_HANDOFF':return {...s,handoff:'held'};
 case 'REQUEST_HANDOFF':return {...s,handoff:s.online?'requested':'queued'};
 case 'CONTINUE':return s.handoff==='accepted'&&s.connected?{...s,mode:'field',team:'증원 1팀',floor:'3F',secondary:'mission',active:'mission',checks:[false,false,false],taskStatus:'진행 중'}:s;
 case 'BRIEFING':return {...s,briefing:!s.briefing};
 default:return s;
 }
}
