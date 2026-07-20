# PROPPEER 홈페이지 (멀티페이지)

프롭피어 공식 사이트 정적 파일입니다. 빌드 과정 없이 이 폴더 그대로 배포하면 됩니다.

## 구성

| 파일 | 내용 |
|---|---|
| `index.html` | 홈 — 핵심 가치, 프로필 카드 예시, 두 축(신뢰/연결), 작동 방식, 오픈 이벤트 |
| `trust.html` | 신뢰 시스템 — 검증등급 V0–V5, 인증뱃지, 거래증빙 후기·차원별 평점 |
| `connect.html` | 연결·협업 — 전문가 검색, 딜·프로젝트 보드, 레퍼런스, 실명 커뮤니티 |
| `membership.html` | 멤버십 — 오픈 이벤트(9/30까지 무료), 요금 안내, FAQ |
| `safety.html` | 신뢰와 안전 — 운영 원칙, 분쟁 처리 절차, 표현의 원칙 |
| `join.html` | 가입 신청 — Founding 500 안내와 신청 폼 |
| `styles.css` / `main.js` | 전 페이지 공용 스타일과 스크립트 |
| `assets/` | 로고, 파비콘, OG 이미지 |

## 배포 (GitHub → Cloudflare Pages)

1. 이 폴더의 파일 전체를 GitHub 저장소에 올립니다. (`index.html`이 저장소 루트에 오도록)
2. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git**에서 저장소 선택.
3. 빌드 설정은 모두 비워 둡니다. Framework preset **None**, Build command 없음, Output directory `/`.
4. Deploy 후 발급되는 `*.pages.dev` 주소로 확인하고, 필요하면 Custom domains에서 도메인을 연결합니다.
5. 이후에는 GitHub에 커밋할 때마다 자동으로 재배포됩니다.

## 배포 전 꼭 바꿀 것

1. **신청 접수 이메일** — `main.js` 상단의 `var CONTACT = "founding@proppeer.kr";`를 실제 주소로 교체하세요. 가입 폼이 이 주소로 메일을 엽니다.
2. **OG 이미지 절대 주소** — 도메인 확정 후 각 HTML의 `<meta property="og:image" content="assets/og.jpg">`를 `https://도메인/assets/og.jpg` 형태로 바꾸면 카카오톡·SNS 공유 미리보기가 정상 표시됩니다.

## 자주 고치게 될 문구 위치

- **오픈 이벤트 기간/문구**: 각 HTML 상단의 `.topbar` 한 줄, `index.html`의 히어로 배지·하단 이벤트 밴드, `membership.html`의 히어로·카드·안내문, `join.html`의 혜택 목록.
- **요금**: `membership.html` 카드의 `m-orig` 부분. 현재는 "정식 요금(예정)"으로 표기되어 있습니다.
- **프로필 카드·검색 결과 예시**: `index.html`, `connect.html`의 인물·수치는 모두 화면 예시이며 "표시 예시/화면 예시" 태그가 붙어 있습니다.

## 참고

- 웹폰트(Pretendard, IBM Plex Mono)는 CDN에서 불러오며, 차단된 환경에서는 시스템 폰트로 자연스럽게 대체됩니다.
- 폼은 서버 없이 mailto 방식으로 동작합니다. 추후 Formspree, Tally, 자체 API 등으로 바꿀 때는 `main.js`의 `joinForm` 부분만 교체하면 됩니다.
