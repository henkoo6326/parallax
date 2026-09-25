import {zoneSummary} from './map-model.mjs';
// Building footprint selected from the rendered OpenFreeMap building layer on
// 2026-09-21, near Hwagok station. NOT the reported incident's actual location.
// Building height, occupancy and floor plan have NOT been verified.
export const demoBuilding={type:'Feature',properties:{id:'demo-hwagok-1',purpose:'시연 건물 · 가상 배치',source:'OpenFreeMap / OpenStreetMap'},geometry:{type:'Polygon',coordinates:[[[126.84107422828674,37.54232301820015],[126.84115469455719,37.542246455781054],[126.84100449085236,37.54214862590891],[126.84092402458191,37.542225188428475],[126.84107422828674,37.54232301820015]]]}};
export const buildingCenter=[126.84103935956955,37.54223582207965];
export function buildingWork(s){const floors=['2F','3F'].map(id=>({id,...zoneSummary(s,id)}));return {floors,complete:floors.reduce((n,f)=>n+f.complete,0),remaining:floors.reduce((n,f)=>n+f.remaining,0)};}
export function validOpenViewport(v){return v&&Array.isArray(v.center)&&v.center.length===2&&v.center.every(Number.isFinite)&&Math.abs(v.center[0])<=180&&Math.abs(v.center[1])<=85&&Number.isFinite(v.zoom)&&v.zoom>=10&&v.zoom<=20;}
