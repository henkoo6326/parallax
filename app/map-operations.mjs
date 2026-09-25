// Visual rules adapted from teammate OpsMapKit.swift.
// Coordinates are deliberately fictional scenario geometry, not surveyed boundaries.
export const operationZones=[
 {id:'building',label:'인계 건물',kind:'incident',points:[[37.54252,126.84052],[37.54254,126.84099],[37.54213,126.84102],[37.54211,126.84055]]},
 {id:'entry',label:'합류 구역',kind:'control',points:[[37.54166,126.84139],[37.54166,126.84192],[37.54128,126.84192],[37.54128,126.84139]]},
 {id:'parking',label:'주차장 · 미확인',kind:'unknown',points:[[37.54254,126.83988],[37.54253,126.84035],[37.54219,126.84034],[37.54219,126.83988]]}
];
export function mapDetail(zoom){return zoom>=18?'close':zoom>=16?'area':'region';}
export function zoneStyle(kind,selected=false){const colors={incident:'#e9392f',control:'#3a4657',unknown:'#6b7787'};return {color:colors[kind],weight:selected?3:1.8,fillColor:colors[kind],fillOpacity:kind==='incident'?.18:.1,dashArray:kind==='unknown'?'6 4':kind==='control'?'10 5':undefined};}
