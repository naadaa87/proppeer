# 프롭피어 홈페이지 (proppeer-web)

부동산 문제 해결 플랫폼 **프롭피어**의 공식 웹사이트입니다.
「프롭피어 홈페이지 제작기획서·기능명세서·제작지시서 최종본」의 **Phase 0(사전 공개 사이트)** 범위를 구현했습니다.

- 빌드 도구 없이 동작하는 **순수 정적 사이트**입니다. (HTML + CSS + JavaScript)
- GitHub 저장소에 올리고 **Cloudflare Pages**에 연결하면 그대로 배포됩니다.
- 핵심 기능인 **3분 문제진단**은 서버 없이 브라우저에서 완결됩니다.

---

## 1. 구현 범위

| 기능 ID | 기능 | 상태 |
| --- | --- | --- |
| ST-01 | 브랜드 메인 (기획서 9장 10개 섹션 구성) | 완료 |
| ST-02 | 서비스 소개 · 검증 기준 페이지 | 완료 |
| ST-03 | 전문가 사전등록 (참여 조건 + 신청 폼) | 완료 |
| ST-04 | 해결사례 콘텐츠 3건 (SEO 발행) | 완료 |
| DG-01 | 문제진단 위저드 (9문항, 임시저장, 진행률) | 완료 (클라이언트 동작) |
| DG-02 | 진단 결과 리포트 (쟁점·한계·준비자료·분야 순서·추천 상담) | 완료 (규칙 기반) |

Phase 1에서 열리는 전문가 목록·예약·결제·결과서·관리자 기능은 포함되지 않습니다.
해당 경로는 `_redirects`에서 현재 페이지로 임시 연결해 두었습니다.

---

## 2. 폴더 구조

```
proppeer-web/
├─ index.html                  메인
├─ diagnosis.html              문제진단 (위저드가 실행되는 페이지)
├─ service.html                서비스 소개
├─ trust.html                  검증 기준과 신뢰 정책
├─ pro.html                    전문가센터 · 초기 파트너 모집
├─ 404.html                    없는 페이지
├─ cases/
│   ├─ index.html              해결사례 목록
│   ├─ vacancy-to-lodging.html 공실 → 숙박시설 용도변경
│   ├─ restoration-scope.html  원상복구 범위
│   └─ pre-purchase-review.html 매입 전 검토
├─ assets/
│   ├─ css/tokens.css          디자인 토큰 (색·서체·간격의 단일 출처)
│   ├─ css/main.css            레이아웃과 컴포넌트
│   ├─ js/config.js            ★ 설정 단일 출처 (가장 먼저 수정할 파일)
│   ├─ js/main.js              공통 동작 (메뉴·폼·분석)
│   ├─ js/diagnosis.js         진단 위저드와 결과 생성 규칙
│   └─ img/                    파비콘, OG 이미지, 앱 아이콘
├─ _redirects                  Cloudflare Pages 리다이렉트
├─ _headers                    보안 헤더와 캐시 정책
├─ robots.txt
└─ sitemap.xml
```

---

## 3. 로컬에서 먼저 확인하기

파일을 더블클릭해서 열면 `/assets/...` 같은 절대 경로가 동작하지 않습니다.
아래처럼 간단한 서버를 띄워서 확인하세요.

```bash
cd proppeer-web
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```

로컬 서버는 `/service` 같은 확장자 없는 주소를 자동 처리하지 않으므로,
확인할 때는 `http://localhost:8080/service.html` 로 접속하면 됩니다.
**실제 배포 후에는 `/service` 로 접속됩니다.** (아래 5-3 참고)

---

## 4. GitHub에 올리기

이미 저장소가 있다면 파일만 덮어쓰고 커밋하면 됩니다. 처음이라면:

```bash
cd proppeer-web
git init
git add .
git commit -m "init: 프롭피어 홈페이지 Phase 0"
git branch -M main
git remote add origin https://github.com/<계정>/proppeer-web.git
git push -u origin main
```

**브랜치 전략** (제작지시서 20.1)

| 브랜치 | 용도 |
| --- | --- |
| `main` | 운영 배포. 여기에 병합되면 실제 사이트가 갱신됩니다. |
| `dev` | 작업·검수용. Cloudflare가 미리보기 주소를 자동으로 만들어 줍니다. |
| `feature/*` | 개별 작업 단위 |

> API 키나 결제 키는 **절대 저장소에 커밋하지 마세요.** Cloudflare Pages의 환경변수로만 관리합니다.

---

## 5. Cloudflare Pages에 연결하기

### 5-1. 프로젝트 생성

1. Cloudflare 대시보드 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 계정을 연결하고 `proppeer-web` 저장소를 선택합니다.
3. 빌드 설정을 아래와 같이 입력합니다.

| 항목 | 값 |
| --- | --- |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | **비워둠** |
| Build output directory | `/` |
| Root directory | 비워둠 |

빌드 과정이 없으므로 1분 안에 배포가 끝나고 `<프로젝트명>.pages.dev` 주소가 생깁니다.

### 5-2. 커스텀 도메인 연결

프로젝트 → **Custom domains** → **Set up a domain** 에서 `proppeer.co.kr` 을 추가합니다.
SSL 인증서는 Cloudflare가 자동 발급합니다.

`www` 와 루트 도메인 중 **하나를 대표로 정해** 나머지는 301로 넘기세요.
(예: `www.proppeer.co.kr` → `proppeer.co.kr`)

### 5-3. ⚠️ URL 규칙 — 가장 주의할 부분

Cloudflare Pages는 정적 배포 시 **`.html` 확장자를 자동으로 정리**합니다.

- `service.html` 파일 → 실제 주소는 `/service`
- `/service.html` 로 요청하면 → `/service` 로 자동 정규화

그래서 다음 두 가지를 반드시 지켜야 합니다.

1. **사이트 안의 모든 링크는 확장자 없이** 씁니다.
   `href="/service"` (○) / `href="/service.html"` (×)
2. **`_redirects` 규칙에도 `.html` 을 쓰지 않습니다.**
   자동 정규화와 겹쳐 **리다이렉트 루프**가 발생합니다.

```
# 올바른 예
/join    /pro    301

# 잘못된 예 (무한 루프 위험)
/service.html    /service    301
```

현재 파일들은 이 규칙에 맞춰 작성되어 있습니다. 링크를 추가할 때만 주의하시면 됩니다.

---

## 6. 배포 후 바로 해야 할 설정

`assets/js/config.js` **한 파일만** 수정하면 사이트 전체에 반영됩니다.
HTML을 고칠 필요가 없습니다.

```js
channels: {
  email: "hello@proppeer.co.kr",   // 실제 수신 가능한 주소로 변경
  tel:   "02-0000-0000",           // 비워두면 푸터에서 자동으로 사라집니다
},

forms: {
  endpoint: "",                    // 폼 접수 주소 (아래 7번 참고)
},

analytics: {
  ga4: "G-XXXXXXXXXX",             // 넣으면 GA4가 자동 로드됩니다
  cfBeacon: ""                     // Cloudflare Web Analytics 토큰
},

ops: {
  launchLabel: "2026년 하반기 정식 오픈 예정",  // 오픈 시점 문구
  partnerTarget: 33                            // 모집 인원
}
```

앱 출시 후에는 `apps.ios` / `apps.android` 에 스토어 주소만 넣으면 푸터에 링크가 나타납니다.
값이 비어 있으면 해당 항목은 화면에서 자동으로 숨겨집니다.

---

## 7. 폼 접수 연결하기

지금은 `forms.endpoint` 가 비어 있어서, 신청 버튼을 누르면 **입력 내용이 담긴 메일 초안**이 열립니다.
서버 없이도 접수는 되지만, 실제 운영에서는 아래 중 하나를 연결하는 편이 좋습니다.

**방법 1 — Formspree 등 폼 서비스 (가장 빠름)**

```js
forms: { endpoint: "https://formspree.io/f/xxxxxxx", method: "POST" }
```

**방법 2 — Google Apps Script (스프레드시트에 바로 쌓기)**

스프레드시트에서 확장 프로그램 → Apps Script → 웹 앱으로 배포한 뒤 그 주소를 넣습니다.

**방법 3 — Cloudflare Pages Functions (Phase 1 권장)**

저장소에 `functions/api/submit.js` 를 만들면 `/api/submit` 이 자동으로 생깁니다.
알림 메일 발송이나 DB 저장까지 처리할 수 있습니다.

```js
forms: { endpoint: "/api/submit", method: "POST" }
```

어느 방법이든 전송되는 데이터는 JSON 한 덩어리이며,
`_form`(폼 종류), `_page`, `_at`(접수 시각) 필드가 자동으로 포함됩니다.

---

## 8. 내용 수정 안내

| 무엇을 바꾸려면 | 어디를 고치나 |
| --- | --- |
| 색상 · 서체 · 여백 · 모서리 | `assets/css/tokens.css` (여기만 고치면 전체 반영) |
| 이메일 · 전화 · 오픈 시점 · 모집 인원 | `assets/js/config.js` |
| 메인 문구와 섹션 | `index.html` |
| 진단 질문 · 결과 내용 | `assets/js/diagnosis.js` 상단 `PROBLEMS` 객체 |
| 상담 상품과 가격 | `index.html`, `service.html`, `config.js` 의 `products` |
| 사례 글 추가 | `cases/` 에 HTML 파일 추가 → `cases/index.html`과 `sitemap.xml`에 링크 추가 |

> **헤더와 푸터는 각 HTML 파일에 들어 있습니다.** 메뉴를 바꿀 때는 모든 파일에서 함께 수정해야 합니다.
> 편집기의 "전체 폴더에서 찾아 바꾸기" 기능을 쓰면 한 번에 처리됩니다.

### 진단 질문을 바꾸려면

`diagnosis.js` 의 `PROBLEMS` 안에서 문제 유형별로 아래 항목을 수정합니다.

| 항목 | 의미 |
| --- | --- |
| `details` / `goals` | 문제별 세부 질문 선택지 |
| `issues` | 결과의 "먼저 확인해야 할 것" |
| `risks` | "확인 전에는 단정할 수 없는 부분" (법률·세무 판단 회피 문구) |
| `seq` | 필요한 전문 분야와 순서 |
| `docs` | 준비 자료 목록 |
| `product` | 추천할 상담 상품 ID |

`risks` 항목은 **삭제하지 마세요.** 플랫폼이 확정적 판단을 하지 않는다는 고지가 이 자리에 들어갑니다.

---

## 9. 품질 기준 (검수 완료 항목)

- 반응형: 360 · 390 · 768 · 1024 · 1440px 전 구간 가로 스크롤 없음
- 접근성: 키보드 이동, 포커스 표시, 본문 대비 4.5:1 이상, 폼 라벨과 오류 안내, 건너뛰기 링크
- 모션: `prefers-reduced-motion` 설정 시 애니메이션 비활성화
- SEO: 페이지별 title · description · canonical · OG 태그, 사례 글 구조화 데이터(Article), sitemap · robots
- 자바스크립트가 꺼진 환경에서도 모든 정보 페이지는 정상 노출 (진단은 안내 문구로 대체)
- 진단 위저드 7개 문제 유형 전 흐름 동작 확인

**웹폰트** — Pretendard를 CDN(jsdelivr)에서 불러옵니다. CDN 장애 시에도 시스템 한글 폰트로 자연스럽게 대체됩니다.
자체 호스팅으로 바꾸려면 폰트 파일을 `assets/fonts/` 에 넣고 각 HTML의 `<link>` 한 줄을 교체하면 됩니다.

---

## 10. 표기 원칙 (변경 시 주의)

기획서에서 확정한 원칙이며, 화면 문구를 수정할 때도 유지해야 합니다.

- **검증되지 않은 수치를 쓰지 않습니다.** 회원 수, 거래액, 전문가 수를 임의로 표기하지 않고 "초기 파트너 모집 중"처럼 사실대로 적습니다.
- **AI가 판단하지 않습니다.** 진단 결과는 정리와 안내까지만 하고, 법률·세무·감정·가격 판단은 "확인 전에는 단정할 수 없는 부분"으로 분리합니다.
- **이해관계를 먼저 밝힙니다.** 상담 이후 중개·설계·시공 제안 가능성을 미리 표시합니다.
- **불안을 자극하지 않습니다.** "지금 안 하면 손해" 같은 표현 대신 확인해야 할 것을 담담히 안내합니다.
- **플랫폼의 역할을 고지합니다.** 자격 업무 계약의 당사자가 아니라는 문구를 푸터에서 빼지 마세요.

---

## 11. Phase 1로 넘어갈 때

이 저장소는 그대로 이어서 씁니다. 다음 항목이 그대로 이관됩니다.

- `tokens.css` 디자인 토큰 → Tailwind 설정 또는 CSS 변수로 이식
- `config.js` 설정 구조 → 환경변수와 서버 설정으로 확장
- URL 체계와 `_redirects` 규칙
- 사례 콘텐츠와 정책 페이지
- 진단 질문·결과 규칙 → 서버 로직과 AI 브리핑의 기준값

Next.js로 전환할 때의 Cloudflare 설정은 다음과 같이 바뀝니다.

| 항목 | 값 |
| --- | --- |
| Framework preset | Next.js |
| Build command | `npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |
| 호환성 플래그 | `nodejs_compat` |

---

## 12. 배포 전 마지막 확인

- [ ] `config.js` 의 이메일이 실제 수신 가능한 주소인가
- [ ] 폼을 실제로 제출해 접수가 도착하는가
- [ ] 커스텀 도메인 연결과 `www` 통일이 끝났는가
- [ ] `sitemap.xml` 과 `robots.txt` 의 도메인이 실제 주소와 같은가
- [ ] GA4 측정 ID를 넣고 진단 시작·완료 이벤트가 잡히는가
- [ ] 모바일 실기기(iOS·Android)에서 진단을 끝까지 진행해 봤는가
- [ ] `/service`, `/trust` 같은 주소가 확장자 없이 열리는가
- [ ] 없는 주소로 들어갔을 때 404 페이지가 뜨는가

---

© PropPeer. 이 저장소의 내용은 프롭피어 홈페이지 제작기획서·기능명세서·제작지시서 최종본을 기준으로 작성되었습니다.
