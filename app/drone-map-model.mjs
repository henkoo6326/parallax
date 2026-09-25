import {sceneEntities} from './map-presence-model.mjs';
// Image-local coordinates only: never georeferenced or used as GPS locations.
export const droneSize=[1536,1024];
export const imagePoint=([x,y])=>[x/100000,-y/100000];
export const droneCorners=[[0,0],[1536,0],[1536,1024],[0,1024]].map(imagePoint);
export const droneCenter=imagePoint([780,530]);
const anchors={
 'field-2':[650,665], 'support-1':[1120,710], 'patrol-21':[950,798],
 entry:[663,609],parking:[990,662],camera:[913,525],meeting:[811,750]
};
const paths={
 'support-1':[[1120,710],[1065,750],[1000,800],[935,832]],
 'patrol-21':[[950,798],[895,821],[855,792],[811,750]]
};
export const droneEntities=sceneEntities.map(e=>({...e,coordinates:imagePoint(anchors[e.id]),path:paths[e.id]?.map(imagePoint),detail:e.detail+' 드론 표식은 생성 이미지의 보이는 공간에 맞춘 가상 배치이며 실제 좌표가 아닙니다.'}));
export const droneBuilding={type:'Feature',properties:{provenance:'synthetic-image'},geometry:{type:'Polygon',coordinates:[[[580,380],[774,287],[979,386],[786,500],[580,380]].map(imagePoint)]}};
