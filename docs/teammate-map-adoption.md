> 2026-09-21 후속 변경: 아래 SVG 이식은 철회하고 Apple MapKit JS 연결 준비로 교체했습니다. 현재 상태는 [Apple 지도 설정](apple-map-setup.md)을 따릅니다.

# 팀원 지도 이식

원본: PARALLAX_콘솔_20260919/통제실_3D/app.js의 cityBase(). teammate-city.mjs에 함수 본문을 수정 없이 복사. 네이티브 MapKit은 사용하지 않으며, 외부 타일·OpenStreetMap·Leaflet 로딩을 제거했다.

map-model.mjs: 기존 인계 요청/zoneResults에서 구역 상태를 도출한다. 읽음은 완료가 아니다. 요청이 없는 구역도 완료로 처리하지 않는다. 구역별 담당은 시연 배정 정보이고 인수 대기 상태를 구분한다.

live-map.mjs: 원본 도시 위에 우리 사건의 4개 업무 구역을 연결. 선택할 때만 상세 카드 표시. 휠/ctrl+wheel/Safari gesture/two-pointer pinch, 드래그, 키보드 제어. consoleViewport는 과거 지도 좌표와 분리해서 저장. 실제 m 단위 축척 표시는 제거.

검증: 구역 상태/선택/확대 기준점/최대최소 배율/원본 SVG 포함 테스트. 브라우저 휠 확대·축소, 드래그, 구역 선택 카드 확인. 실제 두 손가락 터치 핀치는 자동화 환경에서 검증하지 못함.
