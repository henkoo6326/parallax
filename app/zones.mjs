export const zones=[{id:'2F',name:'2층 계단실·서편'},{id:'3F',name:'3층·옥상 진입로'},{id:'entry',name:'1층 동측 출입구'},{id:'parking',name:'후면 주차장'}];
export const selectedZoneKey=s=>s.selectedZone==='entry'||s.selectedZone==='parking'?s.selectedZone:s.floor==='1F'?'entry':['3F','RF'].includes(s.floor)?'3F':'2F';
export function requestZone(r){if(zones.some(z=>z.id===r.zone))return r.zone;const p=r.place||'';return /주차/.test(p)?'parking':/3층|옥상/.test(p)?'3F':/1층|출입구|공동현관/.test(p)?'entry':/2층|계단/.test(p)?'2F':null;}
export const zoneRequests=s=>s.handoffRequests.filter(r=>requestZone(r)===selectedZoneKey(s));
