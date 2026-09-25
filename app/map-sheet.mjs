export function mountMapSheet(root){
 const sheet=root.querySelector('[data-map-sheet]'),handle=root.querySelector('[data-sheet-handle]'),scroll=root.querySelector('[data-sheet-scroll]'),close=root.querySelector('[data-sheet-close]');
 if(!sheet||!handle||!scroll)return()=>{};
 let start=null,suppressClick=false,height=176,wheelTimer;
 const max=()=>Math.max(100,root.clientHeight-12);
 const min=()=>Math.min(176,max());
 const stops=()=>[min(),Math.max(min(),max()*.64),max()];
 const set=(value,drag=false)=>{height=Math.max(min(),Math.min(max(),value));root.style.setProperty('--sheet-height',`${height}px`);sheet.classList.toggle('is-dragging',drag);handle.setAttribute('aria-expanded',String(height>min()+10));handle.setAttribute('aria-label',height>min()+10?'지도 업무 시트 접기':'지도 업무 시트 펼치기');};
 const snap=(velocity=0)=>{const points=stops();let target=points.reduce((a,b)=>Math.abs(b-height)<Math.abs(a-height)?b:a);if(velocity>.35)target=points.find(v=>v>height+8)??max();if(velocity<-.35)target=[...points].reverse().find(v=>v<height-8)??min();set(target);};
 const collapse=()=>{set(min());scroll.scrollTo({top:0,behavior:'instant'});};
 const click=()=>{if(suppressClick){suppressClick=false;return;}set(height>min()+10?min():max());};
 const down=e=>{if(e.button!==0)return;clearTimeout(wheelTimer);start={y:e.clientY,height,lastY:e.clientY,time:performance.now(),velocity:0,moved:false};suppressClick=false;handle.setPointerCapture(e.pointerId);};
 const move=e=>{if(!start)return;const t=performance.now(),delta=start.y-e.clientY;start.velocity=(start.lastY-e.clientY)/Math.max(1,t-start.time);start.lastY=e.clientY;start.time=t;if(Math.abs(delta)>4)start.moved=true;if(start.moved){e.preventDefault();set(start.height+delta,true);}};
 const up=e=>{if(!start)return;const drag=start;start=null;if(drag.moved){suppressClick=true;snap(performance.now()-drag.time<100?drag.velocity:0);}else set(height);if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);};
 const cancel=()=>{start=null;snap();};
 const wheel=e=>{if(e.ctrlKey)return;const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?scroll.clientHeight:1);if((delta>0&&height<max()-1)||(delta<0&&scroll.scrollTop<=0&&height>min()+1)){e.preventDefault();set(height+delta,true);clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>snap(),140);}};
 const reveal=e=>{set(e.detail?.collapsed?min():Math.max(max()*.64,e.detail?.height||390));scroll.scrollTo({top:0,behavior:'instant'});};
 const observer=new ResizeObserver(()=>set(height));observer.observe(root);
 handle.addEventListener('click',click);handle.addEventListener('pointerdown',down);handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancel);close.addEventListener('click',collapse);sheet.addEventListener('wheel',wheel,{passive:false});root.addEventListener('map-sheet-reveal',reveal);set(height);
 return()=>{clearTimeout(wheelTimer);observer.disconnect();handle.removeEventListener('click',click);handle.removeEventListener('pointerdown',down);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancel);close.removeEventListener('click',collapse);sheet.removeEventListener('wheel',wheel);root.removeEventListener('map-sheet-reveal',reveal);};
}
