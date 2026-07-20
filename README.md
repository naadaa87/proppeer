# 프롭피어 PROPPEER — 공식 홈페이지

부동산 업계 신뢰 네트워크(Real Estate Trust Network) 프롭피어의 원페이지 홈페이지입니다.
정적 사이트(HTML 단일 파일)로, 빌드 과정 없이 GitHub + Cloudflare Pages에 바로 배포할 수 있습니다.

## 파일 구성

```
proppeer-site/
├── index.html      # 홈페이지 전체 (CSS·JS·로고 이미지 내장)
├── assets/
│   └── og.jpg      # SNS 공유용 미리보기 이미지 (1200×630)
└── README.md
```

로고와 파비콘은 index.html 안에 내장되어 있어 별도 이미지 경로가 깨질 일이 없습니다.

## GitHub + Cloudflare Pages 배포 절차

1. **GitHub 저장소 생성** — 예: `proppeer-site` (Public/Private 무관)
2. **파일 업로드** — 이 폴더의 `index.html`, `assets/`, `README.md`를 저장소 루트에 푸시
   ```bash
   git init
   git add .
   git commit -m "PROPPEER homepage v1.0"
   git branch -M main
   git remote add origin https://github.com/<계정명>/proppeer-site.git
   git push -u origin main
   ```
3. **Cloudflare 대시보드** → Workers & Pages → **Create** → **Pages** → **Connect to Git**
4. 방금 만든 저장소 선택 후 빌드 설정:
   - Framework preset: **None**
   - Build command: **(비워두기)**
   - Build output directory: **/** (루트)
5. **Save and Deploy** — 약 1분 뒤 `https://proppeer-site.pages.dev` 형태의 주소가 발급됩니다.
6. 이후 GitHub에 푸시할 때마다 자동으로 재배포됩니다.

### 커스텀 도메인 연결
Pages 프로젝트 → **Custom domains** → 도메인 입력(예: proppeer.kr) → 안내에 따라 DNS 레코드 추가.
도메인이 이미 Cloudflare에 등록되어 있으면 클릭 몇 번으로 완료됩니다.

## 배포 후 반드시 수정할 것 2가지

1. **사전등록 접수 이메일** — 현재 폼은 방문자의 메일 앱을 여는 방식(mailto)이며, 수신 주소가
   임시값입니다. `index.html`에서 아래 줄을 실제 주소로 교체하세요.
   ```js
   var CONTACT='founding@proppeer.kr'; /* TODO: 실제 접수 이메일로 교체하세요 */
   ```
   추후 Google Form, Tally, Cloudflare Pages Functions 등으로 폼을 교체할 수 있습니다.
2. **og:image 절대 주소** — 도메인 확정 후 `<meta property="og:image" ...>` 값을
   `https://도메인/assets/og.jpg` 형태의 전체 주소로 바꿔야 카카오톡·SNS 공유 미리보기가 나옵니다.

## 커스터마이징 포인트

- **브랜드 컬러**: `index.html` 상단 `:root`의 CSS 변수에 무드보드 컬러가 정의되어 있습니다.
  (Deep Navy `#0D1B2A` · Muted Gold `#B8945A` · Ivory `#F7F6F2` · Cool Gray `#6B7280` · Soft Blue `#C7D7EA`)
- **섹션 구성**: 왜 프롭피어 → 신뢰 체계(6대 분리) → 검증등급 V0–V5 → 인증뱃지 → 평점·신뢰지표 →
  후기·레퍼런스 → 딜소싱 → 멤버십 → 신뢰와 안전 → 로드맵 → Founding 500 사전등록
- **가격 표기**: 기획서 기준 "가격 가정"으로 표기되어 있습니다. 확정 시 멤버십 섹션에서 수정하세요.

## 고지

본 페이지의 기능·가격·정책 문구는 사업기획서 기준의 준비 단계 안내이며,
인물 평판 공개·개인정보 처리 관련 문구는 출시 전 법률 검토 후 확정하는 것을 전제로 작성되었습니다.

© 2026 PROPPEER · Verified People, Trusted Deals
