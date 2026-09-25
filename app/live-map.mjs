import {imagePoint,droneCorners,droneCenter,droneEntities,droneBuilding} from './drone-map-model.mjs?v=2';
import {mountMapSheet} from './map-sheet.mjs';
import {presenceView,presenceAfterMap,mountPresence} from './map-presence.mjs?v=drone1';
import {mapZones,zoneSummary} from './map-model.mjs';
import {sourceById} from './media.mjs?v=ops1';
import {demoBuilding,buildingCenter,buildingWork,validOpenViewport} from './open-map-model.mjs';
import {loadOpenMap,styleOpenMap} from './open-map-sdk.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let controller;
export function disposeLiveMap(){controller?.dispose();controller=null;}
export function liveMapControl(action){if(!controller)return false;return controller.control(action);}
export function mapHeaderActions(s,ic,select,side){return `<div class="map-header-actions">${select(side,'map')}</div>`;}
function detailCard(s,ic){const zone=mapZones.find(z=>z.id===s.mapSelection);if(!zone)return '';const z=zoneSummary(s,zone.id);
 return `<section class="zone-inspector" aria-label="선택 구역 상세"><div class="row"><div><small>${['2F','3F'].includes(zone.id)?'시연 건물 · 가상 층별 업무':'지도 위치 미확정'} · ${esc(z.status)}</small><h3>${zone.name}</h3></div><button class="icon-button" data-action="map-clear" aria-label="구역 선택 닫기">${ic('close')}</button></div><p class="zone-owner">담당 <strong>${esc(z.owner)}</strong></p><div class="zone-work-count"><span>남은 업무 <b>${z.remaining}</b></span><span>완료 <b>${z.complete}</b></span></div>${z.requests.map(r=>`<article><div class="row"><strong>${esc(r.title)}</strong><small>${esc(s.zoneResults?.[r.id]?.status||'미확인')}</small></div>${s.zoneResults?.[r.id]?`<p>${esc(s.zoneResults[r.id].body)}</p><small>${esc(s.zoneResults[r.id].author)} · ${esc(s.zoneResults[r.id].time)}</small>`:`<p>${esc(r.next)}</p>`}<div class="zone-evidence-actions"><button data-action="request-scene" data-id="${esc(r.id)}">${ic('video')}${esc(sourceById(r.source).name)} · ${Math.floor(r.second/60)}:${String(r.second%60).padStart(2,'0')}</button><button data-action="zone-result" data-id="${esc(r.id)}">확인 결과</button></div></article>`).join('')||'<p>연결된 업무·근거가 없습니다. 아직 확인한 구역으로 처리하지 않습니다.</p>'}<button class="secondary-button full" data-action="zone-request-write">이 구역에 요청 추가</button></section>`;
}
export function liveMapView(s,ic,select,side){
 const work=buildingWork(s);
 const floorButton=id=>{const z=zoneSummary(s,id);return `<button data-action="map-zone-select" data-id="${id}" aria-pressed="${s.mapSelection===id}"><strong>${id==='2F'?'2층 · 계단실·서편':'3층 · 옥상'}</strong><small class="${z.status==='완료'?'floor-complete':''}">${esc(z.status)} · 남은 업무 ${z.remaining}</small></button>`;};
 return `<div class="map-view open-map ${s.mapSelection?'has-selection':''}"><div class="open-map-header">${mapHeaderActions(s,ic,select,side)}<div class="map-view-switch" role="group" aria-label="지도 보기">${[['standard','기본'],['drone','드론']].map(([value,label])=>`<button data-action="map-style" data-value="${value}" aria-pressed="${(s.mapStyle==='drone'?'drone':'standard')===value}">${label}</button>`).join('')}</div></div>
 <div class="open-map-stage">${presenceView()}${s.mapStyle==='drone'?'<span class="drone-provenance">생성 이미지 · 가상 배치</span>':''}<div data-open-canvas role="group" aria-label="${s.mapStyle==='drone'?'생성 드론 이미지':'화곡동 실제 지도'}. 휠·핀치로 확대 축소, 드래그로 이동"></div><div class="open-map-status" data-open-status role="status"><strong>${s.mapStyle==='drone'?'드론 이미지':'실제 지도'} 불러오는 중…</strong></div><div class="open-map-tools"><button data-action="live-home">시연 건물</button><button data-action="live-region">주변</button></div></div>
 <div class="map-work-sheet" data-map-sheet><div class="map-sheet-topbar"><button class="map-sheet-handle" data-sheet-handle type="button" aria-expanded="false" aria-label="지도 업무 시트 올리기"><i aria-hidden="true"></i></button><button class="map-sheet-close" ${s.mapSelection?'':'hidden'} data-sheet-close data-scene-action="close" aria-label="지도 업무 시트 닫기">${ic('close')}</button></div><div class="map-sheet-scroll" data-sheet-scroll><div data-presence-detail hidden></div>${presenceAfterMap()}<section class="building-work"><div class="row"><div><strong>시연 건물</strong><small>가상 배치 · 실제 층수·내부 구조 미검증</small></div><span class="tag">남은 업무 ${work.remaining}</span></div><p>팀 배정과 업무를 연결한 건물입니다. 실시간 팀 위치가 아닙니다.</p><div class="open-floor-list" aria-label="같은 건물의 층별 업무">${floorButton('2F')}${floorButton('3F')}</div></section>
 ${detailCard(s,ic)}
 <section class="unmapped-work"><h3>위치 미확정</h3><p>실제 위치는 미확정입니다. 지도 표식은 시연용 가상 배치입니다.</p><div>${['entry','parking'].map(id=>`<button data-action="map-zone-select" data-id="${id}" aria-pressed="${s.mapSelection===id}">${ic(id)}<span>${id==='entry'?'동측 출입구':'후면 주차장'}<small>${zoneSummary(s,id).remaining}건 남음 · 위치 미확정</small></span>${ic('chevron')}</button>`).join('')}<button data-action="camera-details">${ic('cctv')}<span>CCTV<small>위치·방향 미확정</small></span>${ic('chevron')}</button></div></section></div></div></div>`;
}
export async function mountLiveMap(s,ic,onAction,onViewport){
 const canvas=document.querySelector('[data-open-canvas]');if(!canvas)return;
 const root=canvas.closest('.open-map'),status=root.querySelector('[data-open-status]');let map,marker,observer,presence,disposed=false,timer,failed=false;
 const drone=s.mapStyle==='drone',center=drone?droneCenter:buildingCenter,footprint=drone?droneBuilding:demoBuilding;
 const disposeSheet=mountMapSheet(root);
 const showError=()=>{if(disposed)return;failed=true;status.hidden=false;status.innerHTML='<strong>지도 연결을 확인해 주세요.</strong><p>지도 데이터를 불러오지 못했습니다. 업무 목록은 계속 사용할 수 있습니다.</p><button data-action="map-retry">다시 시도</button>';};
 controller={dispose(){disposed=true;disposeSheet();clearTimeout(timer);observer?.disconnect();presence?.dispose();marker?.remove();map?.remove();},control(){return false;}};
 try{
  const gl=await loadOpenMap();if(disposed)return;
  let view=!drone&&validOpenViewport(s.openMapViewport)?s.openMapViewport:{center:buildingCenter,zoom:17.2};
  if(['2F','3F'].includes(s.mapSelection)&&view.selection!==s.mapSelection)view={center:buildingCenter,zoom:Math.max(17.2,view.zoom)};
  map=new gl.Map({container:canvas,style:drone?{version:8,sources:{'drone-photo':{type:'image',url:`assets/${s.theme==='dark'?'scene-map.png?v=night3':'scene-map-light.png?v=photo2'}`,coordinates:droneCorners}},layers:[{id:'drone-photo',type:'raster',source:'drone-photo',paint:{'raster-fade-duration':0}}]}:'https://tiles.openfreemap.org/styles/liberty',center:drone?center:view.center,zoom:drone?15.5:view.zoom,minZoom:drone?13:10,maxZoom:20,pitch:0,bearing:0,dragRotate:false,touchPitch:false,attributionControl:false});
  map.touchZoomRotate.disableRotation();if(!drone){map.addControl(new gl.AttributionControl({compact:true}),'bottom-right');map.addControl(new gl.ScaleControl({maxWidth:70}),'bottom-left');}
  const save=()=>{if(disposed||drone)return;const c=map.getCenter();onViewport({center:[c.lng,c.lat],zoom:map.getZoom(),selection:s.mapSelection});};
  map.on('error',showError);map.on('moveend',save);observer=new ResizeObserver(()=>map.resize());observer.observe(canvas);
  timer=setTimeout(showError,20000);
  map.on('style.load',()=>{if(disposed)return;try{
   if(!drone)styleOpenMap(map,s.theme==='dark');
   else map.jumpTo({center,zoom:15,padding:{top:48,bottom:176,left:0,right:0}});
   presence=mountPresence({map,gl,root,state:s,onAction,...(drone?{sceneEntities:droneEntities}:{})});
   map.addSource('demo-building',{type:'geojson',data:footprint});
   map.addLayer({id:'demo-building-fill',type:'fill',source:'demo-building',paint:{'fill-color':'#2446f0','fill-opacity':['2F','3F'].includes(s.mapSelection)?.24:.12}});
   map.addLayer({id:'demo-building-line',type:'line',source:'demo-building',paint:{'line-color':'#2446f0','line-width':2.5}});
   const button=document.createElement('button');button.className='demo-building-pin';button.type='button';button.setAttribute('aria-label','시연 건물 선택 · 가상 배치');button.innerHTML=`${ic('building')}<span>시연 건물<small>가상 배치</small></span>`;button.addEventListener('click',()=>onAction('map-zone',{id:['2F','3F'].includes(s.mapSelection)?s.mapSelection:'2F',focusWork:true}));
   marker=new gl.Marker({element:button,anchor:'bottom',offset:[0,-8]}).setLngLat(drone?imagePoint([780,430]):center).addTo(map);
   map.on('click','demo-building-fill',()=>onAction('map-zone',{id:['2F','3F'].includes(s.mapSelection)?s.mapSelection:'2F',focusWork:true}));
   map.on('mouseenter','demo-building-fill',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','demo-building-fill',()=>map.getCanvas().style.cursor='');
  }catch{showError();}});
  map.on('idle',()=>{if(disposed||failed)return;clearTimeout(timer);status.hidden=true;});
  controller.control=action=>{if(disposed)return false;const opts={duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:350};if(action==='home')map.easeTo({...opts,center,zoom:drone?15:17.5});else if(action==='region')map.easeTo({...opts,center,zoom:drone?15:15.5});else if(action==='in')map.zoomIn(opts);else if(action==='out')map.zoomOut(opts);else return false;return true;};
 }catch{showError();}
}
