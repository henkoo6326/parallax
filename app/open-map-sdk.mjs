let loading;
export function loadOpenMap(){
 if(window.maplibregl)return Promise.resolve(window.maplibregl);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');let done=false;
  const finish=error=>{if(done)return;done=true;clearTimeout(timer);if(error){script.remove();loading=null;reject(error);}else resolve(window.maplibregl);};
  const timer=setTimeout(()=>finish(new Error('지도 엔진 연결 시간 초과')),20000);
  script.src='https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js';script.async=true;script.onload=()=>finish(window.maplibregl?null:new Error('지도 엔진 없음'));script.onerror=()=>finish(new Error('지도 엔진 연결 실패'));document.head.append(script);
 });return loading;
}
export function styleOpenMap(map,dark=false){
 const layers=map.getStyle().layers,building=layers.find(l=>l['source-layer']==='building');
 for(const l of layers){
  if(l.type==='fill-extrusion')map.setLayoutProperty(l.id,'visibility','none');
  if(l.type==='background')map.setPaintProperty(l.id,'background-color',dark?'#1b2430':'#f3f5f7');
  if(l.type==='fill'&&l['source-layer']==='landcover')map.setPaintProperty(l.id,'fill-color',dark?'#273a33':'#e5eddf');
  if(l.type==='fill'&&l['source-layer']==='water')map.setPaintProperty(l.id,'fill-color',dark?'#293e56':'#dce8f2');
  if(l.type==='fill'&&l['source-layer']==='landuse')map.setPaintProperty(l.id,'fill-color',dark?'#27313c':'#eef0e7');
  if(l.type==='line'&&l['source-layer']==='transportation')map.setPaintProperty(l.id,'line-color',l.id.includes('casing')?(dark?'#394758':'#d9e0e7'):(dark?'#303d4c':'#ffffff'));
  if(l.type==='symbol'&&l.layout?.['text-field']){map.setLayoutProperty(l.id,'text-field',['coalesce',['get','name:ko'],['get','name'],'']);map.setPaintProperty(l.id,'text-color',dark?'#aebdd0':'#647184');map.setPaintProperty(l.id,'text-halo-color',dark?'#1b2430':'#f3f5f7');}
  if(l.type==='symbol'&&l['source-layer']==='poi')map.setLayoutProperty(l.id,'visibility','none');
 }
 if(building)map.addLayer({id:'parallax-buildings',type:'fill',source:building.source,'source-layer':'building',minzoom:14,paint:{'fill-color':dark?'#39485a':'#d8dfe7','fill-opacity':.8,'fill-outline-color':dark?'#526479':'#b4bfce'}},layers.find(l=>l.type==='symbol')?.id);
}
