import {sceneEntities as defaultSceneEntities,positionAt,sceneDuration,routeFeature} from './map-presence-model.mjs';
import {zoneSummary} from './map-model.mjs';
const glyphs={team:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5"/>',car:'<path d="m4 10 2-6h12l2 6M3 10h18v8H3zM5 18v3m14-3v3M6 14h2m8 0h2M10 4V2h4v2"/>',entry:'<path d="M11 3h9v18h-9M2 12h12m-4-4 4 4-4 4"/>',parking:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9 18V6h4a4 4 0 0 1 0 8H9"/>',cctv:'<path d="m3 5 15 5-3 7L1 12zM17 12l5-2v7l-6-2M7 15v6h11"/>',flag:'<path d="M5 22V3m0 1c5-5 9 5 15 0v10c-6 5-10-5-15 0"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',follow:'<circle cx="12" cy="12" r="6"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',play:'<path d="m8 4 12 8-12 8z"/>',pause:'<path d="M8 4v16M16 4v16"/>',reset:'<path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]||glyphs.follow}</svg>`;
// View-only demonstration state: never alters operational records or GPS state.
const sceneEntities=defaultSceneEntities;
const session={seconds:0,selected:null,layers:new Set(['team','vehicle','facility'])};
const time=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
export function presenceView(){return `<section class="presence-controls" aria-label="지도 시연 제어"><details class="map-layer-menu"><summary>${icon('follow')}<span>표시 요소</span><span aria-hidden="true">⌄</span></summary><div class="presence-layers" role="group" aria-label="지도 표시 요소">${[['team','팀원',2],['vehicle','차량',1],['facility','시설',4]].map(([kind,label,n])=>`<button type="button" data-scene-action="layer" data-kind="${kind}" aria-pressed="${session.layers.has(kind)}">${icon(kind==='vehicle'?'car':kind==='facility'?'entry':'team')}${label}<span>${n}</span></button>`).join('')}</div></details></section>`;}
export function presenceAfterMap(){return `<section class="presence-playback" aria-label="위치 이동 시연"><button type="button" data-scene-action="play" aria-label="위치 시연 재생">${icon('play')}</button><div><div class="presence-time"><strong data-scene-play-label>이동 시연</strong><span><output data-scene-time>${time(session.seconds)}</output> / 1:30</span></div><input data-scene-timeline type="range" min="0" max="90" step="1" value="${session.seconds}" aria-label="위치 시연 시간" aria-valuetext="${time(session.seconds)}"></div><button type="button" data-scene-action="reset" aria-label="위치 시연 처음으로">${icon('reset')}</button></section><div class="presence-roster" aria-label="지도 대상 목록">${sceneEntities.map(e=>`<button type="button" data-scene-action="select" data-entity="${e.id}" aria-pressed="${session.selected===e.id}">${icon(e.icon)}${e.short}</button>`).join('')}</div>`;}
export function mountPresence({map,gl,root,state,onAction,sceneEntities=defaultSceneEntities}){
 let disposed=false,playing=false,following=false,frame=0,last=0,painted=0,lastDetail=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const markers=new Map(),panel=root.querySelector('[data-presence-detail]');

 const empty={type:'FeatureCollection',features:[]};
 map.addSource('presence-route',{type:'geojson',data:empty});
 map.addLayer({id:'presence-route-line',type:'line',source:'presence-route',paint:{'line-color':'#4564d8','line-width':3,'line-dasharray':[2,2],'line-opacity':.65}});
 for(const entity of sceneEntities){
  const button=document.createElement('button');button.type='button';button.className=`presence-marker ${entity.kind}`;button.dataset.sceneAction='select';button.dataset.entity=entity.id;button.setAttribute('aria-label',`${entity.name} 선택 · 시연 위치`);button.title=`${entity.name} · 시연 위치`;button.innerHTML=`<span class="presence-symbol">${icon(entity.icon)}</span><span class="presence-label">${entity.short}</span>`;
  markers.set(entity.id,{button,marker:new gl.Marker({element:button,anchor:'center'}).setLngLat(positionAt(entity,session.seconds)).addTo(map)});
 }
 function sync(){
  for(const entity of sceneEntities){const item=markers.get(entity.id),visible=session.layers.has(entity.kind);item.button.hidden=!visible;item.button.setAttribute('aria-pressed',String(session.selected===entity.id));item.button.classList.toggle('selected',session.selected===entity.id);item.marker.setLngLat(positionAt(entity,session.seconds));}
  root.querySelectorAll('[data-scene-action="layer"]').forEach(b=>b.setAttribute('aria-pressed',String(session.layers.has(b.dataset.kind))));
  root.querySelectorAll('.presence-roster button').forEach(b=>{const entity=sceneEntities.find(e=>e.id===b.dataset.entity);b.hidden=!session.layers.has(entity.kind);b.setAttribute('aria-pressed',String(session.selected===entity.id));});
  root.querySelector('[data-scene-time]').textContent=time(session.seconds);const slider=root.querySelector('[data-scene-timeline]');slider.value=session.seconds;slider.style.setProperty('--play-progress',`${session.seconds/sceneDuration*100}%`);slider.setAttribute('aria-valuetext',`${time(session.seconds)} / 1:30`);
  const play=root.querySelector('[data-scene-action="play"]');play.innerHTML=icon(playing?'pause':'play');play.setAttribute('aria-label',playing?'위치 시연 일시정지':'위치 시연 재생');root.querySelector('[data-scene-play-label]').textContent=playing?'시연 재생 중':session.seconds===sceneDuration?'시연 종료':'이동 시연 · 일시정지';
  const entity=sceneEntities.find(e=>e.id===session.selected);
  if(following&&entity)map.easeTo({center:positionAt(entity,session.seconds),offset:[0,-(parseFloat(root.style.getPropertyValue('--sheet-height'))||176)/2],duration:0});
  const output=panel.querySelector('[data-entity-update]');if(output)output.textContent=`시연 ${time(session.seconds)}${entity?.path&&session.seconds===sceneDuration?' · 구간 종료':''}`;
 }
 function detail(){
  const entity=sceneEntities.find(e=>e.id===session.selected);panel.hidden=!entity;root.querySelector('[data-sheet-close]').hidden=!entity&&!state.mapSelection;
  const feature=routeFeature(entity);map.getSource('presence-route').setData(feature||empty);
  if(!entity){panel.innerHTML='';lastDetail=null;return;}
  const work=entity.zone?zoneSummary(state,entity.zone):null;
  panel.innerHTML=`<section class="presence-detail" aria-label="선택한 지도 대상"><div class="presence-detail-heading"><span class="presence-detail-icon">${icon(entity.icon)}</span><div><small>시연 위치 · ${entity.kind==='team'?'팀':entity.kind==='vehicle'?'차량':'시설'}</small><h3>${entity.name}</h3></div></div><div class="presence-detail-meta"><strong>${entity.status}</strong><span data-entity-update>시연 ${time(session.seconds)}</span></div>${work?`<div class="presence-linked-work"><span>연결 업무 <b>${work.remaining}건 남음</b></span><span>완료 ${work.complete}건</span></div>`:''}<div class="presence-detail-actions">${entity.path?`<button type="button" data-scene-action="follow" aria-pressed="${following}">${icon('follow')}${following?'따라가는 중':'따라가기'}</button>`:''}<button type="button" data-scene-action="linked">${entity.id==='camera'?'연결 영상 보기':'연결 업무 보기'}</button></div><details class="presence-info"><summary>위치와 자료 정보</summary><p>${entity.detail}</p>${entity.path?'<small class="presence-route-note">점선은 시연 이동선 · 실제 이동 경로 아님</small>':''}</details></section>`;
  if(lastDetail!==entity.id&&!reduced){panel.getAnimations().forEach(a=>a.cancel());panel.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});}lastDetail=entity.id;
 }
 function select(id){const entity=sceneEntities.find(e=>e.id===id);if(!entity)return;session.selected=id;following=false;session.layers.add(entity.kind);root.dispatchEvent(new CustomEvent('map-sheet-reveal',{detail:{height:390}}));map.easeTo({center:positionAt(entity,session.seconds),offset:[0,-(parseFloat(root.style.getPropertyValue('--sheet-height'))||176)/2],duration:reduced?0:320});detail();sync();}
 function onClick(event){const b=event.target.closest('[data-scene-action]');if(!b||!root.contains(b))return;const action=b.dataset.sceneAction;
  if(action==='select')select(b.dataset.entity);
  else if(action==='layer'){const kind=b.dataset.kind;if(session.layers.has(kind)){session.layers.delete(kind);if(sceneEntities.find(e=>e.id===session.selected)?.kind===kind){session.selected=null;following=false;detail();}}else session.layers.add(kind);sync();}
  else if(action==='close'){session.selected=null;following=false;detail();sync();root.dispatchEvent(new CustomEvent('map-sheet-reveal',{detail:{collapsed:true}}));if(state.mapSelection)onAction('map-zone',{id:null});}
  else if(action==='follow'){following=!following;detail();sync();}
  else if(action==='play'){if(session.seconds>=sceneDuration)session.seconds=0;playing=!playing;last=0;sync();}
  else if(action==='reset'){session.seconds=0;playing=false;following=false;detail();sync();}
  else if(action==='overview'){following=false;const visible=sceneEntities.filter(e=>session.layers.has(e.kind));if(visible.length){const bounds=new gl.LngLatBounds();visible.forEach(e=>bounds.extend(positionAt(e,session.seconds)));map.fitBounds(bounds,{padding:65,maxZoom:18,duration:reduced?0:400});}detail();sync();}
  else if(action==='linked'){const entity=sceneEntities.find(e=>e.id===session.selected);if(entity){session.selected=null;following=false;detail();sync();onAction(entity.id==='camera'?'camera-details':'map-zone',{id:entity.zone,focusWork:true});}}
 }
 function onInput(event){if(!event.target.matches('[data-scene-timeline]'))return;session.seconds=Number(event.target.value);playing=false;sync();}
 function stopFollow(){if(following){following=false;detail();}}
 function tick(now){if(disposed)return;if(last&&playing&&!document.hidden){session.seconds=Math.min(sceneDuration,session.seconds+(now-last)/1000);if(session.seconds===sceneDuration)playing=false;}last=now;if(now-painted>150){if(playing||session.seconds===sceneDuration)sync();painted=now;}frame=requestAnimationFrame(tick);}
 root.addEventListener('click',onClick);root.addEventListener('input',onInput);map.on('dragstart',stopFollow);map.on('zoomstart',stopFollow);detail();sync();frame=requestAnimationFrame(tick);
 return {dispose(){disposed=true;cancelAnimationFrame(frame);root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);map.off('dragstart',stopFollow);map.off('zoomstart',stopFollow);for(const item of markers.values())item.marker.remove();}};
}
