/* Fictional neighbourhood geometry, not a geocoded map. Pins use the same canvas. */
export function streetMap(){return `<svg class="street-map" viewBox="0 0 600 760" preserveAspectRatio="none" role="img" aria-label="도로와 건물, 동측 합류 지점을 표시한 가상 현장 기본 지도">
 <defs><pattern id="map-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="currentColor" opacity=".09"/></pattern><pattern id="map-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v7" stroke="currentColor" stroke-width="2" opacity=".2"/></pattern></defs>
 <rect width="600" height="760" class="map-land"/><rect width="600" height="760" fill="url(#map-dots)"/>
 <g class="map-block"><rect x="-15" y="120" width="205" height="127" rx="17"/><rect x="222" y="106" width="178" height="141" rx="16"/><rect x="437" y="97" width="190" height="150" rx="18"/><rect x="-10" y="292" width="200" height="187" rx="15"/><rect x="435" y="295" width="190" height="184" rx="14"/><rect x="-10" y="521" width="196" height="199" rx="18"/><rect x="227" y="521" width="175" height="211" rx="16"/><rect x="441" y="519" width="196" height="214" rx="18"/></g>
 <g class="map-road"><path d="M0 267H600M0 500H600M209 70V760M419 72V760"/></g>
 <g class="map-road-center"><path d="M0 267H600M0 500H600M209 70V760M419 72V760"/></g>
 <g class="map-building"><rect x="27" y="161" width="61" height="53" rx="5"/><rect x="103" y="152" width="54" height="75" rx="5"/><rect x="247" y="147" width="62" height="74" rx="5"/><rect x="323" y="143" width="47" height="80" rx="5"/><rect x="458" y="141" width="80" height="57" rx="5"/><rect x="551" y="136" width="53" height="94" rx="5"/><rect x="20" y="329" width="58" height="116" rx="5"/><rect x="94" y="315" width="68" height="65" rx="5"/><rect x="94" y="397" width="65" height="57" rx="5"/><rect x="456" y="320" width="89" height="52" rx="5"/><rect x="476" y="395" width="74" height="53" rx="5"/><rect x="569" y="310" width="63" height="145" rx="5"/><rect x="19" y="552" width="65" height="90" rx="5"/><rect x="105" y="561" width="52" height="68" rx="5"/><rect x="25" y="657" width="139" height="63" rx="5"/><rect x="460" y="548" width="72" height="83" rx="5"/><rect x="548" y="549" width="61" height="107" rx="5"/></g>
 <rect x="242" y="552" width="143" height="111" rx="14" class="map-park"/><g class="map-tree"><circle cx="261" cy="570" r="8"/><circle cx="366" cy="573" r="10"/><circle cx="257" cy="640" r="9"/><circle cx="367" cy="641" r="8"/></g>
 <rect x="239" y="298" width="147" height="139" rx="14" class="map-case-halo"/><path d="M254 312H373V366H348V421H254Z" class="map-case-building"/>
 <g class="map-floorplan"><path d="M298 312V421M254 350H298M254 385H298M320 312V350H373M320 366H348"/><path d="M298 368H323V395H298" class="map-stairwell"/><path d="M301 373h19m-19 5h19m-19 5h19m-19 5h19"/></g>
 <g class="map-room-label"><text x="276" y="335">서편</text><text x="276" y="375">담당 구역</text><text x="347" y="336">동편</text></g>
 <path d="M359 355h14" class="map-door"/>
 <g class="map-perimeter"><path d="M231 291H394V440H231Z"/></g>
 <rect x="246" y="446" width="130" height="26" rx="5" fill="url(#map-hatch)" class="map-parking"/>
 <g class="map-crosswalk" stroke-width="3"><path d="M198 282h21m-21 6h21m-21 6h21M408 480h22m-22 6h22m-22 6h22M391 257v20m6-20v20m6-20v20"/></g>
 <path d="M311 591V500H419V433H380V360H369" class="map-route"/>
 <g class="map-route-origin"><circle cx="311" cy="591" r="7"/><circle cx="311" cy="591" r="3"/></g>
 <g class="map-text"><text x="42" y="272">화곡로 18길</text><text x="443" y="505">곰달래로 24길</text><text x="216" y="467" transform="rotate(-90 216 467)">화곡로 18나길</text><text x="312" y="610" text-anchor="middle">화곡 소공원</text><text x="34" y="317">한빛빌라</text><text x="461" y="311">주거 구역</text><text x="263" y="461">후면 주차장</text></g>
 </svg>`;}
