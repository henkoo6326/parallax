import {mapZones,zoneSummary} from './map-model.mjs';
import {sourceById} from './media.mjs?v=ops1';
import {appleMapConfig} from './apple-map-config.mjs';
import {loadAppleMap} from './apple-map-sdk.mjs';
import {validScene,validRegion,regionForScene,operationalFeatures,operationStyle,projectPoint,cameraWedge} from './apple-map-model.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let controller;
export function disposeLiveMap(){controller?.dispose();controller=null;}
export function liveMapControl(action){if(!controller)return false;return controller.control(action);}
export function mapHeaderActions(s,ic,select,side){return `<div class="map-header-actions"><div class="context-note-bar"><button data-action="note" data-view="map" aria-label="공간 작전 메모 남기기">${ic('records')}메모</button></div>${select(side,'map')}</div>`;}
function detailCard(s,ic){const zone=mapZones.find(z=>z.id===s.mapSelection);if(!zone)return '';const z=zoneSummary(s,zone.id);
 return `<section class="zone-inspector" aria-label="선택 구역 상세"><div class="row"><div><small>선택 구역 · ${esc(z.status)}</small><h3>${zone.name}</h3></div><button class="icon-button" data-action="map-clear" aria-label="구역 선택 닫기">${ic('close')}</button></div><p class="zone-owner">담당 <strong>${esc(z.owner)}</strong></p><div class="zone-work-count"><span>남은 업무 <b>${z.remaining}</b></span><span>완료 <b>${z.complete}</b></span></div>${z.requests.map(r=>`<article><div class="row"><strong>${esc(r.title)}</strong><small>${esc(s.zoneResults?.[r.id]?.status||'미확인')}</small></div>${s.zoneResults?.[r.id]?`<p>${esc(s.zoneResults[r.id].body)}</p><small>${esc(s.zoneResults[r.id].author)} · ${esc(s.zoneResults[r.id].time)}</small>`:`<p>${esc(r.next)}</p>`}<div class="zone-evidence-actions"><button data-action="request-scene" data-id="${esc(r.id)}">${ic('video')}${esc(sourceById(r.source).name)} · ${Math.floor(r.second/60)}:${String(r.second%60).padStart(2,'0')}</button><button data-action="zone-result" data-id="${esc(r.id)}">확인 결과</button></div></article>`).join('')||'<p>연결된 업무·근거가 없습니다. 아직 확인한 구역으로 처리하지 않습니다.</p>'}<button class="secondary-button full" data-action="zone-request-write">이 구역에 요청 추가</button></section>`;
}
export function liveMapView(s,ic,select,side){
 const configured=!!appleMapConfig.token.trim();
 return `<div class="map-view apple-map ${s.mapSelection?'has-selection':''}">
 <div class="apple-map-header"><strong>작전 지도</strong>${mapHeaderActions(s,ic,select,side)}</div>
 <div class="apple-map-stage"><div data-apple-canvas role="group" aria-label="Apple 작전 지도"></div>
 <div class="apple-map-status" role="status" data-apple-status><span class="apple-map-status-icon">${ic('map')}</span><h3>${configured?'Apple 지도 불러오는 중':'Apple 지도 연결 대기'}</h3><p>${configured?'지도 연결 상태를 확인하고 있습니다.':'지도 인증 설정이 필요합니다. 구역별 업무는 아래에서 계속 확인할 수 있습니다.'}</p></div>
 <div class="apple-map-tools" hidden data-apple-tools><button data-action="live-home">현장</button><button data-action="live-region">주변</button><button data-action="apple-satellite" aria-pressed="false">위성</button><button data-action="layers" aria-label="지도 표시 설정">${ic('layers')}</button><button data-action="map-fov" aria-label="CCTV 예상 시야" aria-pressed="${!!s.mapFov}">${ic('cctv')}</button></div></div>
 <div class="apple-map-zone-list" aria-label="작업 구역">${mapZones.map(z=>{const summary=zoneSummary(s,z.id);return `<button data-action="map-zone-select" data-id="${z.id}" aria-pressed="${s.mapSelection===z.id}"><strong>${z.name}</strong><small>${esc(summary.status)} · 남은 업무 ${summary.remaining}</small></button>`;}).join('')}</div>
 ${detailCard(s,ic)}</div>`;
}
export async function mountLiveMap(s,ic,onAction,onViewport){
 const canvas=document.querySelector('[data-apple-canvas]');if(!canvas)return;
 const root=canvas.closest('.apple-map'),status=root.querySelector('[data-apple-status]'),tools=root.querySelector('[data-apple-tools]');
 let disposed=false,map=null;const cleanup=[];
 const listen=(target,type,fn)=>{target.addEventListener(type,fn);cleanup.push(()=>target.removeEventListener(type,fn));};
 const showStatus=(title,body)=>{status.hidden=false;status.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=body;status.append(h,p);};
 const scene=validScene(appleMapConfig.scene)?appleMapConfig.scene:null;
 const sceneId=scene?.id||'seoul-overview';
 const initialRegion=wide=>scene?regionForScene(scene,wide):{center:{latitude:37.5665,longitude:126.9780},span:{latitudeDelta:.24,longitudeDelta:.32}};
 controller={dispose:()=>{disposed=true;cleanup.forEach(fn=>fn());map?.destroy();},control:()=>false};
 if(!appleMapConfig.token.trim())return;
 try{
  const mk=await loadAppleMap(appleMapConfig.token);if(disposed)return;
  const coordinate=c=>new mk.Coordinate(c.latitude,c.longitude);
  const region=r=>new mk.CoordinateRegion(coordinate(r.center),new mk.CoordinateSpan(r.span.latitudeDelta,r.span.longitudeDelta));
  const previous=s.appleMapViewport;
  let initial=previous?.sceneId===sceneId&&validRegion(previous.region)?previous.region:initialRegion(false);
  if(s.mapSelection&&previous?.selection!==s.mapSelection){
   const feature=operationalFeatures(s,scene).find(f=>f.id===s.mapSelection);
   if(feature)initial={center:{latitude:feature.coordinates.reduce((a,c)=>a+c.latitude,0)/feature.coordinates.length,longitude:feature.coordinates.reduce((a,c)=>a+c.longitude,0)/feature.coordinates.length},span:{latitudeDelta:Math.min(initial.span.latitudeDelta,.0018),longitudeDelta:Math.min(initial.span.longitudeDelta,.0024)}};
  }
  map=new mk.Map(canvas,{region:region(initial),mapType:previous?.sceneId===sceneId&&previous.satellite?'hybrid':'mutedStandard',colorScheme:s.theme==='dark'?'dark':'light',showsPointsOfInterest:false,isZoomEnabled:true,isScrollEnabled:true,isRotationEnabled:false,showsZoomControl:false,showsMapTypeControl:false});
  const save=()=>{if(disposed)return;const r=map.region;onViewport({sceneId,selection:s.mapSelection,region:{center:{latitude:r.center.latitude,longitude:r.center.longitude},span:{latitudeDelta:r.span.latitudeDelta,longitudeDelta:r.span.longitudeDelta}},satellite:map.mapType==='hybrid'});};
  const fail=()=>{if(disposed)return;tools.hidden=true;root.classList.remove('is-connected');showStatus('Apple 지도를 연결하지 못했습니다','인증 설정과 네트워크 연결을 확인한 뒤 다시 시도해 주세요.');const button=document.createElement('button');button.className='secondary-button';button.dataset.action='map-retry';button.textContent='다시 시도';status.append(button);};
  listen(mk,'error',fail);listen(map,'region-change-end',save);
  const features=operationalFeatures(s,scene);
  for(const f of features){
   const overlay=new mk.PolygonOverlay(f.coordinates.map(coordinate),{data:{zoneId:f.id},enabled:true,style:new mk.Style(operationStyle(f.summary,f.selected))});map.addOverlay(overlay);
   const center={latitude:f.coordinates.reduce((a,c)=>a+c.latitude,0)/f.coordinates.length,longitude:f.coordinates.reduce((a,c)=>a+c.longitude,0)/f.coordinates.length};
   const marker=new mk.MarkerAnnotation(coordinate(center),{title:mapZones.find(z=>z.id===f.id).name,subtitle:`${f.summary.owner} · ${f.summary.status}`,color:f.selected?'#2446f0':operationStyle(f.summary).fillColor,glyphText:f.id==='2F'?'2':f.id==='3F'?'3':'',data:{zoneId:f.id}});map.addAnnotation(marker);
  }
  for(const pin of scene?.pins||[]){if(!s.layers[pin.layer])continue;map.addAnnotation(new mk.MarkerAnnotation(coordinate(projectPoint(pin.point,scene)),{title:pin.title,color:pin.layer==='team'?'#2446f0':pin.layer==='alerts'?'#b58b21':'#6b7787',glyphText:pin.layer==='alerts'?'!':pin.layer==='cameras'?'C':'',data:{}}));}
  if(s.layers.cameras&&s.mapFov)for(const camera of scene?.cameras||[])map.addOverlay(new mk.PolygonOverlay(cameraWedge(camera,scene).map(coordinate),{enabled:false,style:new mk.Style({strokeColor:'#2446f0',strokeOpacity:.4,fillColor:'#2446f0',fillOpacity:.12,lineWidth:1})}));
  listen(map,'single-tap',()=>{if(s.mapSelection)onAction('map-zone',{id:null});});
  listen(map,'select',e=>{const id=(e.overlay||e.annotation)?.data?.zoneId;if(id&&id!==s.mapSelection){save();onAction('map-zone',{id});}});
  controller.control=action=>{if(disposed)return false;if(action==='home'||action==='region')map.region=region(initialRegion(action==='region'));else if(action==='satellite'){map.mapType=map.mapType==='hybrid'?'mutedStandard':'hybrid';tools.querySelector('[data-action=apple-satellite]').setAttribute('aria-pressed',String(map.mapType==='hybrid'));}else if(action==='in'||action==='out'){const r=map.region,f=action==='in'?.8:1.25;map.region=new mk.CoordinateRegion(r.center,new mk.CoordinateSpan(Math.min(170,Math.max(.0001,r.span.latitudeDelta*f)),Math.min(360,Math.max(.0001,r.span.longitudeDelta*f))));}else return false;save();return true;};
  if(!scene){tools.querySelector('[data-action=live-home]').textContent='서울';tools.querySelector('[data-action=live-region]').hidden=true;}
  status.hidden=true;tools.hidden=false;root.classList.add('is-connected');tools.querySelector('[data-action=apple-satellite]').setAttribute('aria-pressed',String(map.mapType==='hybrid'));
 }catch{if(!disposed)showStatus('Apple 지도를 불러오지 못했습니다','지도 인증 설정과 네트워크 연결을 확인해 주세요.');}
}
