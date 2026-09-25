let loading;
export function loadAppleMap(token){
 if(!token?.trim())return Promise.reject(new Error('missing-token'));
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');let finished=false;
  const finish=(error)=>{if(finished)return;finished=true;clearTimeout(timer);if(error){script.remove();loading=null;reject(error);}else resolve(window.mapkit);};
  const timer=setTimeout(()=>finish(new Error('sdk-timeout')),20000);
  window.parallaxMapKitReady=()=>finish(window.mapkit?.Map&&window.mapkit?.PolygonOverlay?null:new Error('sdk-unavailable'));
  script.src='https://cdn.apple-mapkit.com/mk/6/mapkit.core.js';script.crossOrigin='anonymous';script.async=true;
  script.dataset.callback='parallaxMapKitReady';script.dataset.libraries='map,annotations,overlays';script.dataset.token=token.trim();
  script.onerror=()=>finish(new Error('sdk-network'));document.head.append(script);
 });
 return loading;
}
