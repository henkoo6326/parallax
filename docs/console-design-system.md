# 디자인 시스템 적용 이력

## 현재: 부드러운 무광 UI

사용자 제공 Dribbble 영상(a1e8de5983151d3c28cc8ff966afcf1a.mp4)을 브라우저에서 확인하고 회백색 바탕, 낮은 대비의 카드 표면, 얕은 그림자로 변경했다. 파란 키 컬러 #2446F0는 유지한다. console-material.css의 재질 값을 교체하고 soft-surfaces.css에서 반사 테두리·광택·확대 동작을 제거한다. 지도 위 조작부와 모달에는 약한 흐림만 남긴다. 아래 내용은 이전 글래스 도입 기록이다.

## 이전: 팀원 콘솔 글래스 도입

기준: PARALLAX_콘솔_20260919/통제실_3D/styles.css의 최종 리퀴드 글래스 및 키 컬러 선언, 통제실_macOS/PARALLAXConsole/Theme.swift.

- console-material.css: 원본 regular/clear/prominent 재질, light/dark 반사광·그림자·블러·배경·키 컬러 선언을 직접 추출.
- console-system.css: 폴더블의 패널, 카드, 지도 조작부, 버튼, 선택 상태, 폼, 모달, 하단 메뉴에 연결.
- PretendardVariable.woff2와 LICENSE.txt를 팀원 폴더에서 함께 복사.
- 본문 16px, 제목 18/28px, 패널 24px. 보조 글자는 폴더블 밀도에 맞춰 13px. 기존 44/48px 터치 영역 유지.
- SwiftUI 네이티브 glassEffect와 브라우저 한정 SVG 굴절은 이식하지 않음. 웹 원본의 블러·채도·반사광 사용.
- 사용자 요청에 따른 빈 상단 여백과 캡슐 작업 공간 배치는 유지.
- 저동작·저투명도 설정과 backdrop-filter 미지원 대체 표면 제공.

검증: 상태 테스트 28개 통과. 브라우저 밝은 펼친 화면/어두운 접힌 화면 및 모달 육안 확인.
