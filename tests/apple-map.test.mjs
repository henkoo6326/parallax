import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,reduce} from '../app/state.mjs';
import {teammateMapData} from '../app/teammate-map-data.mjs';
import {projectPoint,validScene,operationalFeatures,operationStyle,cameraWedge,validRegion} from '../app/apple-map-model.mjs';
import {liveMapView} from '../app/apple-live-map.mjs';
const original=teammateMapData.incidents.find(i=>i.id==='A-102');
const scene={...original,zones:[{id:'3F',points:teammateMapData.zones.find(z=>z.id==='A-102-2').points}]};
test('native metre projection retains anchor and bearing; invalid geometry is rejected',()=>{
 assert.deepEqual(projectPoint([0,0],scene),original.anchor);
 const p=projectPoint([10,0],{...scene,bearing:0});assert.ok(Math.abs((p.latitude-original.anchor.latitude)*111320-10)<1e-7);assert.equal(p.longitude,original.anchor.longitude);
 assert.ok(validScene(scene));assert.ok(!validScene({...scene,anchor:{latitude:NaN,longitude:0}}));assert.ok(!validScene({...scene,zones:[{id:'3F',points:[[0,0],[1,1],[NaN,3]]}]}));
 assert.ok(!validScene({...scene,zones:[...scene.zones,...scene.zones]}));assert.ok(!validRegion({center:original.anchor,span:{latitudeDelta:-1,longitudeDelta:1}}));
});
test('geographic overlays use saved results, owner and selected zone without inheriting teammate sample completion',()=>{
 let s=createState(),request=s.handoffRequests.find(r=>r.id==='h2');
 assert.equal(operationalFeatures(s,scene)[0].summary.status,'미확인');
 s=reduce(s,{type:'MAP_ZONE',id:'3F'});s={...s,zoneOwners:{'3F':'배정 팀'}};
 s=reduce(s,{type:'ZONE_RESULT',id:request.id,body:'확인 완료',status:'완료',time:'12:30',recordId:'apple-test'});
 const f=operationalFeatures(s,scene)[0];assert.equal(f.summary.status,'완료');assert.equal(f.summary.owner,'배정 팀');assert.equal(operationStyle(f.summary,f.selected).strokeColor,'#2446f0');assert.equal(operationStyle(f.summary).fillColor,'#5ca656');
 assert.deepEqual(operationalFeatures(s,null),[]);
});
test('native camera wedge projects its origin and finite arc into coordinates',()=>{
 const c=teammateMapData.cameras[0],points=cameraWedge(c,scene);
 assert.deepEqual(points[0],projectPoint(c.point,scene));assert.ok(points.every(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)));assert.ok(points.length>20);
});
test('missing token displays an honest connection state and keeps selectable work, never a fake map',()=>{
 const html=liveMapView(createState(),()=>'',()=>'', 'primary');
 assert.match(html,/Apple 지도 연결 대기/);assert.match(html,/data-action="map-zone-select"/);assert.doesNotMatch(html,/data-team-svg|m-block|openstreetmap|leaflet/i);
});

test('MapKit adapter wires selection, viewport, gestures and disposal with a test SDK (no live map)',async t=>{
 const {appleMapConfig}=await import('../app/apple-map-config.mjs');
 const {mountLiveMap,disposeLiveMap,liveMapControl}=await import('../app/apple-live-map.mjs');
 const oldDoc=globalThis.document,oldWindow=globalThis.window,oldConfig={...appleMapConfig};
 t.after(()=>{disposeLiveMap();Object.assign(appleMapConfig,oldConfig);globalThis.document=oldDoc;globalThis.window=oldWindow;});
 const makeEl=()=>({dataset:{},hidden:false,children:[],append(...v){this.children.push(...v);},replaceChildren(){this.children=[];},setAttribute(k,v){this[k]=v;},remove(){}});
 const status=makeEl(),toggle=makeEl(),buttons={...makeEl(),querySelector:()=>toggle};
 const root={classList:{add(){},remove(){}},querySelector:sel=>sel==='[data-apple-status]'?status:buttons};
 const canvas={closest:()=>root};let script,created=0,instance;
 class Coordinate{constructor(latitude,longitude){Object.assign(this,{latitude,longitude});}}
 class Span{constructor(latitudeDelta,longitudeDelta){Object.assign(this,{latitudeDelta,longitudeDelta});}}
 class Region{constructor(center,span){Object.assign(this,{center,span});}}
 class Item{constructor(coords,opts){this.coords=coords;Object.assign(this,opts);}}
 class TestMap extends EventTarget{constructor(el,opts){super();created++;instance=this;Object.assign(this,opts);this.overlays=[];this.annotations=[];}addOverlay(o){this.overlays.push(o);}addAnnotation(a){this.annotations.push(a);}destroy(){this.destroyed=true;}}
 const sdk=Object.assign(new EventTarget(),{Map:TestMap,Coordinate,CoordinateSpan:Span,CoordinateRegion:Region,PolygonOverlay:Item,MarkerAnnotation:Item,Style:class{constructor(opts){Object.assign(this,opts);}}});
 globalThis.window={mapkit:sdk};globalThis.document={querySelector:()=>canvas,createElement:()=>makeEl(),head:{append(el){script=el;queueMicrotask(()=>window.parallaxMapKitReady());}}};
 Object.assign(appleMapConfig,{token:'test-only-token-not-sent',scene});
 let selected,viewport;
 await mountLiveMap(createState(),()=>'',(action,data)=>{selected={action,data};},v=>viewport=v);
 assert.equal(script.src,'https://cdn.apple-mapkit.com/mk/6/mapkit.core.js');assert.ok(script.dataset.libraries.includes('overlays'));
 assert.equal(instance.isZoomEnabled,true);assert.equal(instance.isScrollEnabled,true);assert.equal(instance.overlays.length,1);assert.equal(status.hidden,true);
 instance.dispatchEvent(Object.assign(new Event('select'),{overlay:instance.overlays[0]}));
 assert.deepEqual(selected,{action:'map-zone',data:{id:'3F'}});assert.equal(viewport.sceneId,scene.id);assert.ok(validRegion(viewport.region));
 assert.equal(liveMapControl('satellite'),true);assert.equal(viewport.satellite,true);
 sdk.dispatchEvent(new Event('error'));assert.equal(status.hidden,false);assert.equal(buttons.hidden,true);assert.match(status.children[0].textContent,/연결하지 못했습니다/);
 disposeLiveMap();assert.equal(instance.destroyed,true);
 appleMapConfig.scene=null;
 await mountLiveMap(createState(),()=>'',()=>{},v=>viewport=v);
 assert.equal(created,2,'a token must display the real basemap without incident coordinates');assert.equal(instance.overlays.length,0);assert.ok(instance.region.span.latitudeDelta>.1);disposeLiveMap();
 const pending=mountLiveMap(createState(),()=>'',()=>{},()=>{});disposeLiveMap();await pending;assert.equal(created,2,'a disposed asynchronous mount must not recreate the map');
});
