import {zoneSummary} from './map-model.mjs';

// Port of MapProj.coord in teammate macOS MapData.swift.
export function projectPoint([x,y],{anchor,bearing}) {
 const b=bearing*Math.PI/180, east=x*Math.sin(b)+y*Math.cos(b), north=x*Math.cos(b)-y*Math.sin(b);
 return {latitude:anchor.latitude+north/111320,longitude:anchor.longitude+east/(111320*Math.cos(anchor.latitude*Math.PI/180))};
}
export function validCoordinate(c){return !!c&&Number.isFinite(c.latitude)&&Math.abs(c.latitude)<=85&&Number.isFinite(c.longitude)&&Math.abs(c.longitude)<=180;}
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
export function validScene(s){return !!s&&typeof s.id==='string'&&validCoordinate(s.anchor)&&Number.isFinite(s.bearing)&&Array.isArray(s.zones)&&s.zones.every(z=>['2F','3F','entry','parking'].includes(z.id)&&Array.isArray(z.points)&&z.points.length>=3&&z.points.every(validPoint))&&new Set(s.zones.map(z=>z.id)).size===s.zones.length&&(!s.pins||Array.isArray(s.pins)&&s.pins.every(p=>validPoint(p.point)&&typeof p.title==='string'&&['team','cameras','alerts'].includes(p.layer)))&&(!s.cameras||Array.isArray(s.cameras)&&s.cameras.every(c=>validPoint(c.point)&&Number.isFinite(c.facing)&&c.fov>0&&c.fov<180&&c.range>0&&Number.isFinite(c.range)));}
export function validRegion(r){return r&&validCoordinate(r.center)&&r.span&&Number.isFinite(r.span.latitudeDelta)&&r.span.latitudeDelta>0&&r.span.latitudeDelta<=170&&Number.isFinite(r.span.longitudeDelta)&&r.span.longitudeDelta>0&&r.span.longitudeDelta<=360;}
export function regionForScene(scene,wide=false){return {center:scene.anchor,span:{latitudeDelta:wide?.012:.0018,longitudeDelta:wide?.016:.0024}};}
// Like the native version, blue denotes selection, green only verified completion.
export function operationStyle(summary,selected=false){
 const color=summary.status==='완료'?'#5ca656':summary.status==='재확인 필요'?'#b58b21':summary.status==='확인 중'?'#2446f0':'#6b7787';
 return {strokeColor:selected?'#2446f0':color,fillColor:color,fillOpacity:summary.status==='완료'?.22:.12,lineWidth:selected?3:1.8,lineDash:summary.status==='미확인'?[6,4]:[]};
}
export function operationalFeatures(state,scene){
 if(!validScene(scene))return [];
 return scene.zones.map(z=>({id:z.id,coordinates:z.points.map(p=>projectPoint(p,scene)),summary:zoneSummary(state,z.id),selected:state.mapSelection===z.id}));
}
// Port of CCTVGeo.wedgePoints. Facing is relative to the local metre coordinate system.
export function cameraWedge(c,scene){
 const out=[c.point];for(let i=0;i<=32;i++){const a=(c.facing-c.fov/2+c.fov*i/32)*Math.PI/180;out.push([c.point[0]+Math.cos(a)*c.range,c.point[1]+Math.sin(a)*c.range]);}
 return out.map(p=>projectPoint(p,scene));
}
