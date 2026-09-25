// The live app has one continuous inner-display root. During motion, inert HTML
// copies share the same full-width coordinate system; they are not two app roots.
// The independent cover display lives on the reverse face of the left leaf.
let busy=false;
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
function copyDisplay(source,width,height){
 const copy=source.cloneNode(true);
 copy.style.cssText=`width:${width}px;height:${height}px;max-width:none;margin:0;transition:none`;
 const scrolls=[...source.querySelectorAll('*')].map(e=>({top:e.scrollTop,left:e.scrollLeft}));
 copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
 return {element:copy,scrolls,restore(savedScrolls=scrolls){[...copy.querySelectorAll('*')].forEach((e,i)=>{e.scrollTop=savedScrolls[i]?.top||0;e.scrollLeft=savedScrolls[i]?.left||0;});}};
}
export async function foldTransition({folded,renderTarget}){
 if(busy)return;busy=true;
 const app=document.querySelector('#app'),source=document.querySelector('.device');
 const sourceRect=source.getBoundingClientRect(),sourceDisplay=copyDisplay(source,sourceRect.width,sourceRect.height);
 const scrollYBefore=window.scrollY;
 const oldMinHeight=document.body.style.minHeight;
 document.body.style.minHeight=`${document.documentElement.scrollHeight}px`;
 renderTarget();
 const target=document.querySelector('.device');
 // Measure the final layout without the old max-width transition interpolating it.
 target.style.transition='none';
 window.scrollTo({top:scrollYBefore,behavior:'instant'});
 const targetRect=target.getBoundingClientRect();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.style.minHeight=oldMinHeight;target.style.transition='';busy=false;return;}
 const innerRect=folded?targetRect:sourceRect,coverRect=folded?sourceRect:targetRect;
 const width=innerRect.width,height=innerRect.height;
 const innerSource=folded?target:sourceDisplay.element,coverSource=folded?sourceDisplay.element:target;
 const stage=document.createElement('div');stage.className='fold-stage';stage.inert=true;stage.setAttribute('aria-hidden','true');
 stage.style.cssText=`left:${innerRect.left}px;top:${innerRect.top}px;width:${width}px;height:${height}px`;
 const assembly=document.createElement('div');assembly.className='fold-assembly';
 const right=document.createElement('div');right.className='fold-right face';
 const rightUI=copyDisplay(innerSource,width,height);right.append(rightUI.element);
 const leaf=document.createElement('div');leaf.className='leaf left';
 const front=document.createElement('div');front.className='face leaf-front';
 const frontUI=copyDisplay(innerSource,width,height);front.append(frontUI.element);
 const back=document.createElement('div');back.className='face leaf-back';
 const coverWrapper=document.createElement('div');coverWrapper.className='fold-cover-layout compact';
 coverWrapper.style.cssText=`width:${coverRect.width}px;height:${coverRect.height}px;transform:scale(${width/2/coverRect.width},${height/coverRect.height});transform-origin:0 0`;
 const coverUI=copyDisplay(coverSource,coverRect.width,coverRect.height);coverWrapper.append(coverUI.element);back.append(coverWrapper);
 leaf.append(front,back);assembly.append(right,leaf);stage.append(assembly);
 // Positive Y rotation brings the left edge TOWARD the viewer around its right hinge.
 const pose=(rect,isClosed)=>{
  const sx=isClosed?2*rect.width/width:1,sy=isClosed?rect.height/height:1;
  const dx=rect.left+rect.width/2-(innerRect.left+width/2),dy=rect.top-innerRect.top;
  return `translate3d(${dx}px,${dy}px,0) scale(${sx},${sy}) translateX(${isClosed?-width/4:0}px)`;
 };
 const from=pose(sourceRect,folded),to=pose(targetRect,!folded);
 assembly.style.transform=from;leaf.style.transform=`rotateY(${folded?180:0}deg)`;
 document.body.append(stage);rightUI.restore(folded?rightUI.scrolls:sourceDisplay.scrolls);frontUI.restore(folded?frontUI.scrolls:sourceDisplay.scrolls);coverUI.restore(folded?sourceDisplay.scrolls:coverUI.scrolls);
 target.style.visibility='hidden';app.inert=true;
 // Two paint frames pre-rasterize the HTML faces before rotation; no layout in the animation.
 await frame();await frame();
 const options={duration:1050,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
 try{
  await Promise.all([
   leaf.animate([{transform:`rotateY(${folded?180:0}deg)`},{transform:`rotateY(${folded?0:180}deg)`}],options).finished,
   assembly.animate([{transform:from},{transform:to}],options).finished
  ]);
 }finally{
  target.style.visibility='';target.style.transition='';stage.remove();app.inert=false;
  document.body.style.minHeight=oldMinHeight;document.querySelector('[data-action="fold-toggle"]')?.focus({preventScroll:true});busy=false;
 }
}
