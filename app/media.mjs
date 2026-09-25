export const sources=[
 {id:'ar',name:'내 AR 글래스',place:'2층 · 계단실',icon:'glasses',time:'12:12:08',image:'scene-ar.png',duration:84,summary:'2층 계단실의 조명과 상부 시야를 기록했습니다.',check:'0:28 계단 상부의 어두운 구간'},
 {id:'cctv',name:'공동현관 CCTV',place:'1층 · 동측 출입구',icon:'cctv',time:'12:14:32',image:'scene-camera.png',duration:96,summary:'동측 공동현관과 합류 위치가 보입니다.',check:'0:51 변경된 합류 출입구'},
 {id:'drone',name:'현장 드론',place:'건물 외곽 · 상공',icon:'drone',time:'12:10:16',image:'scene-map-light.png?v=photo2',duration:72,summary:'건물 외곽과 옥상 진입부를 상공에서 기록했습니다.',check:'0:42 옥상 위치 · 내부 통행 여부는 현장 확인 필요'}
];
export const sourceById=(id,theme='light')=>{const source=sources.find(source=>source.id===id)||sources[0];return source.id==='drone'&&theme==='dark'?{...source,image:'scene-map.png?v=night3'}:source;};
