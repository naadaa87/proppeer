/* =========================================================
   PROPPEER · config.js
   제작지시서 19.2 「설정 중앙화 원칙」
   바뀔 수 있는 값은 전부 여기 한 곳에서만 관리합니다.
   페이지 HTML/CSS 는 건드리지 않고 이 파일만 수정하세요.
   ========================================================= */

window.PROPPEER = {
  /* 브랜드 */
  brand: {
    name: "프롭피어",
    nameEn: "PropPeer",
    tagline: "부동산 문제, 누구에게 물어봐야 할지부터 해결합니다.",
    site: "https://proppeer.co.kr"
  },

  /* 연락 채널 — 값을 비워두면 해당 링크가 화면에서 자동으로 숨겨집니다 */
  channels: {
    email: "hello@proppeer.co.kr",
    tel: "",
    kakao: ""
  },

  /* 폼 전송
     endpoint 가 비어 있으면 입력 내용을 이메일 초안으로 열어 접수합니다.
     Formspree, Google Apps Script, Cloudflare Functions 등
     POST(JSON) 를 받는 주소를 넣으면 그쪽으로 전송합니다. */
  forms: {
    endpoint: "",
    method: "POST"
  },

  /* 결제 — Phase 1 에서 주입 (제작지시서 19.1) */
  payments: {
    provider: "tosspayments",
    clientKey: ""
  },

  /* 앱 — 출시 시 채워넣으면 푸터에 자동 노출 */
  apps: {
    ios: "",
    android: ""
  },

  /* API — Phase 1 에서 주입 */
  api: {
    baseUrl: ""
  },

  /* 분석 — 측정 ID 를 넣으면 자동으로 스크립트를 로드합니다 */
  analytics: {
    ga4: "",
    cfBeacon: ""
  },

  /* 운영 문구 */
  ops: {
    verifySla: "영업일 기준 2일",
    resultSla: "상담 종료 후 24시간",
    partnerTarget: 33,
    launchLabel: "2026년 하반기 정식 오픈 예정"
  },

  /* 상담상품 — 출시 시점 기준가. Phase 1 에서 DB 로 이관 */
  products: [
    {
      id: "quick15",
      name: "15분 빠른 상담",
      price: "29,000~59,000원",
      include: "쟁점 정리, 다음 단계 안내",
      exclude: "문서 정밀검토, 의견서 작성",
      output: "상담 요약",
      ready: "없어도 진행 가능"
    },
    {
      id: "deep30",
      name: "30분 심층 상담",
      price: "79,000~149,000원",
      include: "자료 검토, 쟁점별 확인 순서",
      exclude: "감정평가, 법률의견서, 설계",
      output: "상담결과서",
      ready: "계약서·도면 등 보유 자료"
    },
    {
      id: "docs",
      name: "문서 검토",
      price: "99,000원~",
      include: "계약서·견적서·대장 검토 1건",
      exclude: "현장 확인, 실측",
      output: "검토 의견 결과서",
      ready: "검토 대상 문서"
    },
    {
      id: "second",
      name: "세컨드 오피니언 · 현장진단",
      price: "250,000원~",
      include: "독립 전문가 재검토 또는 현장 방문",
      exclude: "인허가 대행, 시공",
      output: "비교 결과서",
      ready: "1차 상담 결과와 자료"
    }
  ]
};
