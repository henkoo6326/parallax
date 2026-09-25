# Apple 지도 연결 준비

2026-09-21: 현재는 토큰과 현재 사건의 위치 설정이 없으므로 실제 Apple 지도는 아직 실행 검증하지 않았다. 가상 SVG 도시는 화면에서 제거했다. 지도 없이도 업무 구역 선택, 담당, 결과 작성, 근거 영상 이동은 사용할 수 있다.

## 연결 파일

`app/apple-map-config.mjs`의 `token`을 채운 뒤 새로고침하면 서울 전체 범위의 실제 지도가 먼저 열린다. `scene`은 사건 위치·구역을 지도 위에 표시할 때 추가한다. 캐시가 남으면 강력 새로고침한다.

### 인증

Apple Developer 계정 → Certificates, Identifiers & Profiles → Services → Maps Configure → Tokens → + 에서 **MapKit JS** 토큰을 만든다. 사용할 웹사이트 도메인과 만료 기간을 제한한다. 로컬 접속 주소도 토큰에서 허용되어야 한다. 발급 화면에서 로컬 호스트를 허용하지 않는 경우 허용 가능한 개발 도메인으로 미리보기를 연결해야 한다.

이 구성에는 웹 공개용 MapKit JS 토큰 문자열만 넣는다. `.p8` 개인 키나 Apple 계정 비밀번호는 넣지 않는다. MapKit JS 6의 정적 도메인 토큰을 사용하므로 별도 개인 키 서명 서버는 이 경로에서 필요하지 않다.

공식 자료:
- https://developer.apple.com/documentation/mapkitjs/creating-a-maps-token
- https://webkit.org/blog/18027/discover-mapkit-js-6-rebuilt-for-todays-web-developer/

### 현재 사건의 좌표

팀원 원본은 **의왕 내손동** 앵커와 가상 작전 도형을 사용한다. 우리 현재 사건 제목인 화곡동과 다르다. 원본 자료는 `app/teammate-map-data.mjs`에 출처와 함께 보존했지만 현재 사건에 자동 대입하지 않는다.

`scene` 형식:

```js
{
  id: '현재-사건-ID',
  anchor: { latitude: 확인한위도, longitude: 확인한경도 },
  bearing: 확인한방위각,
  zones: [
    { id: '2F', points: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] }
  ],
  pins: [
    { layer: 'team', title: '현장 2팀', point: [x,y] },
    { layer: 'cameras', title: 'CCTV', point: [x,y] },
    { layer: 'alerts', title: '현장 주의', point: [x,y] }
  ],
  cameras: [{ point: [x,y], facing: 방위, fov: 시야각, range: 거리 }]
}
```

위 코드는 형식 설명이며 실제 좌표 값이 아니다. `points`와 `point`의 단위는 앵커 기준 미터다. 북쪽 0°, 시계방향 bearing을 기준으로 x는 전방, y는 오른쪽이다. 구역 ID는 `2F`, `3F`, `entry`, `parking`이며 필요한 것만 설정한다. 층별 경계가 겹치면 아래 업무 목록으로 해당 층을 선택할 수 있다. `pins`, `cameras`는 선택 사항이다. 실제 위치가 없는 팀·카메라 표식은 표시하지 않는다.

## 구현한 것

- 팀원 `MapProj.coord` 좌표 변환과 `CCTVGeo.wedgePoints`를 JavaScript로 이식.
- `MapData.swift` 원본의 7개 사건 앵커, 26개 구역, 10개 CCTV를 별도 참고 데이터로 추출.
- Apple MapKit JS 6 로더, mutedStandard/위성 혼합 지도, 기본 이동·확대/축소 제스처 활성화.
- 구역 PolygonOverlay 및 이름/담당/상태 MarkerAnnotation, 선택 시 업무 카드 연결.
- 구역 상태는 현재 저장된 확인 결과로 계산. 원본 예제의 수색 완료 상태를 복사하지 않음.
- 지도 중심·범위·위성 모드 저장. 이전 SVG의 픽셀 좌표와 분리.
- 토큰 없음/SDK 실패 상태를 명시하고 가상 지도나 다른 지도 서비스로 대체하지 않음.

## 검증 범위와 남은 일

좌표 변환, 상태 연결, 미설정 화면은 테스트로 검증한다. 토큰 발급 후 실제 지도 로딩, 도메인 인증 오류, 지도 표식 클릭, 줌·핀치, 화면 전환을 실제 SDK와 함께 다시 검증해야 한다. 지도 데이터가 실제라는 것과 작전 도형의 경계가 정확하다는 것은 별개이므로 위치 자료를 대조해야 한다.
