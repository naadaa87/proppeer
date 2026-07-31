/* =========================================================
   PROPPEER · diagnosis.js
   기능명세서 DG-01 문제진단 위저드 / DG-02 진단 결과
   - 한 화면에 질문 하나, 진행률·이전 이동·임시저장 제공
   - 결과는 규칙 기반으로 생성하며 확정 판단을 하지 않습니다
   ========================================================= */
(function () {
  "use strict";

  var store = window.ppStore || {
    get: function () {
      return null;
    },
    set: function () {
      return false;
    },
    del: function () {}
  };
  var track = window.ppTrack || function () {};
  var SAVE_KEY = "pp_diagnosis_v1";

  /* ---------------- 문제 정의 ---------------- */
  var PROBLEMS = {
    vacancy: {
      label: "공실을 활용하고 싶어요",
      short: "공실 활용",
      detailQ: "지금 공실에서 가장 걸리는 부분을 모두 골라주세요.",
      details: [
        "임대가 오래 나가지 않는다",
        "어떤 업종이 들어올 수 있는지 모르겠다",
        "직접 운영(숙박·스터디·창고 등)을 검토 중이다",
        "리모델링 범위와 비용을 모르겠다",
        "매각과 임대 중 무엇이 나은지 판단이 안 된다"
      ],
      goalQ: "이번 검토로 무엇을 결정하고 싶으신가요?",
      goals: [
        "가능한 활용 방식을 추려내고 싶다",
        "예상 투입비와 회수 기간을 알고 싶다",
        "임대료 수준이 적정한지 확인하고 싶다",
        "실행할 전문가를 찾고 싶다"
      ],
      issues: [
        "<strong>공실 원인의 구분</strong> — 임대료 수준 때문인지, 업종 제한이나 공간 조건 때문인지에 따라 해법이 완전히 달라집니다.",
        "<strong>희망 업종의 허용 여부</strong> — 현재 건축물 용도에서 어떤 업종이 들어올 수 있는지가 활용안의 출발점입니다.",
        "<strong>공간이 감당할 수 있는 조건</strong> — 전기 용량, 급배수, 층고, 주차 대수가 업종 선택 범위를 결정합니다.",
        "<strong>투입비와 회수 기간</strong> — 리모델링 비용을 임대료 상승분으로 몇 년에 회수하는지 계산해야 판단이 섭니다.",
        "<strong>기존 계약 정리</strong> — 종전 임차인의 원상복구·명도 조건이 남아 있으면 일정에 직접 영향을 줍니다."
      ],
      risks: [
        "희망 업종의 입점 가능 여부는 건축물대장과 현장 확인 전에는 단정할 수 없습니다.",
        "예상 임대료와 수익률은 인근 실제 거래 조건을 확인하기 전까지 추정치입니다."
      ],
      seq: ["공실개발·공간기획", "건축·인허가", "상업용 중개"],
      docs: ["건축물대장", "평면도(또는 현황 도면)", "현재 임대차 조건 요약", "관리비 내역", "현장 사진"],
      product: "deep30",
      productWhy: "활용 가능한 방식을 추리려면 자료를 함께 보며 조건을 확인하는 30분 상담이 적합합니다.",
      caseSlug: "vacancy-to-lodging"
    },

    purchase: {
      label: "부동산 매입을 검토 중이에요",
      short: "매입 검토",
      detailQ: "매입 검토에서 확인이 필요한 항목을 모두 골라주세요.",
      details: [
        "제시 가격이 적정한지 모르겠다",
        "권리관계(근저당·임차인·가압류)가 걱정된다",
        "임대수익과 공실 위험을 확인하고 싶다",
        "건물에 위반사항이 있는지 확인이 필요하다",
        "세금과 자금계획을 같이 봐야 한다"
      ],
      goalQ: "이번 검토의 목적은 무엇인가요?",
      goals: [
        "매입 여부를 결정하고 싶다",
        "가격 협상 근거를 만들고 싶다",
        "중개사 설명과 별개인 의견을 듣고 싶다",
        "잔금 전 위험요인을 정리하고 싶다"
      ],
      issues: [
        "<strong>가격의 근거</strong> — 인근 실거래와 현재 임대료를 기준으로 제시가격이 어느 수준인지 확인해야 협상이 가능합니다.",
        "<strong>권리관계</strong> — 근저당, 임차인의 대항력과 계약 잔여기간, 가압류·신탁 여부는 등기부와 계약서로 확인합니다.",
        "<strong>수익의 실제성</strong> — 표기된 임대수익이 실제 입금 기준인지, 렌트프리나 미납이 있는지 구분이 필요합니다.",
        "<strong>건축물 위반 여부</strong> — 위반건축물로 등재되면 대출과 용도 활용에 영향을 줍니다.",
        "<strong>세금과 자금 일정</strong> — 취득 단계 세금과 자금 조달 일정이 잔금일과 맞물립니다."
      ],
      risks: [
        "권리관계와 위반 여부는 등기부등본·건축물대장 확인 전에는 판단할 수 없습니다.",
        "예상 수익률은 임대차 현황의 사실 확인 이후에 다시 계산해야 합니다."
      ],
      seq: ["상업용 중개·시장검토", "법률(권리분석)", "세무", "건축(위반·구조)"],
      docs: ["등기부등본", "건축물대장", "임대차 현황표", "중개사 제공 자료", "자금계획(대출 조건 포함)"],
      product: "second",
      productWhy:
        "이해관계가 없는 독립 전문가의 재검토가 매입 결정에서 가장 효과가 큽니다.",
      caseSlug: "pre-purchase-review"
    },

    lease: {
      label: "상가 임대차 문제가 있어요",
      short: "임대차·원상복구",
      detailQ: "현재 겪고 있는 상황을 모두 골라주세요.",
      details: [
        "계약 갱신 또는 종료 문제",
        "원상복구 범위를 두고 다툼이 있다",
        "권리금 회수가 막혔다",
        "관리비·수선비 부담 주체가 불분명하다",
        "명도 요구나 내용증명을 받았다"
      ],
      goalQ: "무엇을 먼저 정리하고 싶으신가요?",
      goals: [
        "내 입장에서 무엇을 주장할 수 있는지 알고 싶다",
        "합의 가능한 선을 찾고 싶다",
        "요구받은 금액이 타당한지 확인하고 싶다",
        "대응 문서를 준비하고 싶다"
      ],
      issues: [
        "<strong>계약서 문언과 특약</strong> — 원상복구와 비용 부담은 대부분 특약 문구에서 갈립니다.",
        "<strong>원상(原狀)의 기준 시점</strong> — 입주 당시 상태를 어디로 보느냐에 따라 복구 범위가 크게 달라집니다.",
        "<strong>시점 관리</strong> — 갱신 요구나 권리금 관련 통지는 정해진 기간 안에 해야 효력이 유지됩니다.",
        "<strong>요구 금액의 근거</strong> — 상대가 제시한 견적이 실제 필요한 공사 범위와 맞는지 항목 단위로 봐야 합니다.",
        "<strong>기록의 확보</strong> — 사진, 문자, 통지문이 이후 협의와 절차에서 그대로 근거가 됩니다."
      ],
      risks: [
        "법적 결론은 계약서 전문과 사실관계를 확인한 자격 전문가만 판단할 수 있습니다.",
        "이 결과는 쟁점 정리를 돕기 위한 것이며, 상대방에게 보내는 답변의 근거로 그대로 쓰기에는 적절하지 않습니다."
      ],
      seq: ["부동산 법률", "원상복구·시공 검토", "중개(재임대 검토)"],
      docs: ["계약서 전문과 특약", "입주 당시 사진", "임대인·임차인 간 통지문", "복구 견적서", "관리비 내역"],
      product: "docs",
      productWhy:
        "계약서와 견적서를 먼저 검토하면 쟁점이 정리되어 이후 상담 시간이 짧아집니다.",
      caseSlug: "restoration-scope"
    },

    usage: {
      label: "용도변경이 가능한지 궁금해요",
      short: "용도변경",
      detailQ: "확인이 필요한 부분을 모두 골라주세요.",
      details: [
        "희망 업종으로 바꿀 수 있는지 모르겠다",
        "주차 대수가 부족할 것 같다",
        "소방·피난 기준이 걱정된다",
        "위반건축물로 등재되어 있다",
        "절차와 기간, 비용을 알고 싶다"
      ],
      goalQ: "이번 검토로 무엇을 확인하고 싶으신가요?",
      goals: [
        "가능 여부를 판단하고 싶다",
        "필요한 절차와 기간을 알고 싶다",
        "추가로 드는 비용을 알고 싶다",
        "진행할 건축사를 찾고 싶다"
      ],
      issues: [
        "<strong>시설군 이동 여부</strong> — 현재 용도와 희망 용도가 어느 시설군에 속하는지에 따라 신고와 허가가 갈립니다.",
        "<strong>주차 대수</strong> — 용도가 바뀌면 요구 주차 대수가 늘어나는 경우가 많고, 확보 방법이 관건이 됩니다.",
        "<strong>소방·피난·설비</strong> — 피난 동선, 소방 설비, 정화조 용량이 실제 비용을 좌우합니다.",
        "<strong>기존 위반사항</strong> — 위반 등재가 있으면 대부분 선해소가 전제됩니다.",
        "<strong>절차와 기간</strong> — 설계, 접수, 보완, 사용승인까지의 일정이 입점 계획과 맞아야 합니다."
      ],
      risks: [
        "용도변경 가능 여부는 건축물대장, 도면, 현장 확인과 관할 기준 검토 전에는 확정할 수 없습니다.",
        "지역과 건물 상태에 따라 같은 업종이라도 결론이 달라질 수 있습니다."
      ],
      seq: ["건축·인허가(건축사)", "소방·설비", "시공", "세무(부가세·비용처리)"],
      docs: ["건축물대장", "건축 도면", "토지이용계획확인원", "현장 사진(내부·주차·진입로)"],
      product: "deep30",
      productWhy: "자료를 함께 보며 확인 순서를 정리하는 데 30분 상담이 적합합니다.",
      caseSlug: "vacancy-to-lodging"
    },

    cost: {
      label: "공사비와 견적을 확인하고 싶어요",
      short: "공사비·견적",
      detailQ: "견적과 관련해 확인이 필요한 부분을 모두 골라주세요.",
      details: [
        "금액이 적정한지 모르겠다",
        "항목이 빠진 것 같다",
        "업체마다 견적 차이가 크다",
        "추가공사 요구를 받았다",
        "계약서와 지급 조건을 확인하고 싶다"
      ],
      goalQ: "무엇을 결정하려고 하시나요?",
      goals: [
        "이 견적으로 진행해도 될지 판단하고 싶다",
        "협상할 항목을 찾고 싶다",
        "다른 업체와 비교하고 싶다",
        "계약 전 위험을 줄이고 싶다"
      ],
      issues: [
        "<strong>빠지기 쉬운 항목</strong> — 철거와 폐기물 처리, 전기 증설, 소방, 냉난방, 간판, 준공 청소는 누락이 잦습니다.",
        "<strong>물량과 단가의 구분</strong> — 총액만 적힌 견적은 비교가 불가능하므로 항목별 물량·단가 분리가 먼저입니다.",
        "<strong>공사 범위의 경계</strong> — 인허가, 감리, 설계 변경이 견적에 포함되는지 명시되어야 합니다.",
        "<strong>지급 조건과 하자</strong> — 선금 비중, 기성 기준, 하자보수 기간과 보증 방식이 위험을 좌우합니다.",
        "<strong>추가공사 처리 기준</strong> — 변경 발생 시 승인 절차를 계약서에 넣어두면 분쟁이 줄어듭니다."
      ],
      risks: [
        "도면과 현장 조건 없이 금액만으로 적정성을 단정할 수는 없습니다.",
        "같은 범위라도 건물 상태와 공사 시기에 따라 금액이 달라집니다."
      ],
      seq: ["시공·인테리어 검토", "건축(범위·인허가)", "법률(계약 조건)"],
      docs: ["견적서(항목별)", "도면 또는 현황 실측", "현장 사진", "공사 계약서 초안"],
      product: "docs",
      productWhy: "견적서를 항목 단위로 검토하는 문서검토가 가장 직접적입니다.",
      caseSlug: "restoration-scope"
    },

    tax: {
      label: "세금과 계약을 검토하고 싶어요",
      short: "세금·계약",
      detailQ: "어떤 부분이 궁금하신가요? 해당하는 것을 모두 골라주세요.",
      details: [
        "취득 단계 세금이 궁금하다",
        "보유·임대 단계 세금이 궁금하다",
        "매각(양도) 단계 세금이 궁금하다",
        "개인과 법인 중 어느 쪽이 나은지 모르겠다",
        "계약서 문구가 세금에 미치는 영향을 알고 싶다"
      ],
      goalQ: "이번 상담에서 얻고 싶은 결과는 무엇인가요?",
      goals: [
        "예상 세부담의 범위를 알고 싶다",
        "선택지별 차이를 비교하고 싶다",
        "계약 전에 고칠 부분을 찾고 싶다",
        "담당 세무사를 찾고 싶다"
      ],
      issues: [
        "<strong>거래 단계 구분</strong> — 취득·보유·양도 중 어느 단계인지에 따라 검토 항목이 완전히 달라집니다.",
        "<strong>명의 구조</strong> — 개인, 공동명의, 법인 중 무엇으로 진행하느냐가 이후 세부담 전체에 영향을 줍니다.",
        "<strong>부가세 처리</strong> — 상업용은 부가세 환급과 포괄양수도 요건 충족 여부가 금액에 직접 반영됩니다.",
        "<strong>계약서 문구</strong> — 잔금일, 부가세 부담 주체, 임대차 승계 조항은 세금과 직결됩니다.",
        "<strong>자금 계획</strong> — 자금 출처와 대출 일정이 취득 일정과 맞아야 합니다."
      ],
      risks: [
        "구체적인 세액은 자료를 확인한 세무사만 계산할 수 있으며, 이 결과는 상담 준비용 정리입니다.",
        "세법과 지자체 기준은 변경될 수 있어 진행 시점 기준으로 다시 확인해야 합니다."
      ],
      seq: ["세무", "법률(계약서)", "중개(거래 조건)"],
      docs: ["등기부등본", "계약서 또는 초안", "취득 당시 자료", "임대차 현황", "대출 조건"],
      product: "deep30",
      productWhy: "선택지별 차이를 비교하려면 자료를 함께 보는 상담이 필요합니다.",
      caseSlug: "pre-purchase-review"
    },

    team: {
      label: "여러 전문가가 필요해요",
      short: "전문가팀·프로젝트",
      detailQ: "어떤 역할이 필요할 것 같은지 모두 골라주세요.",
      details: [
        "사업성 검토·기획",
        "건축·인허가",
        "법률",
        "세무",
        "금융·자금조달",
        "시공",
        "운영·임대"
      ],
      goalQ: "프로젝트의 현재 단계는 어디인가요?",
      goals: [
        "아이디어 단계, 가능성부터 보고 싶다",
        "부지·건물은 정해졌고 검토가 필요하다",
        "실행 직전, 팀을 구성해야 한다",
        "진행 중인데 관리가 안 되고 있다"
      ],
      issues: [
        "<strong>역할 경계</strong> — 누가 어디까지 책임지는지 정하지 않으면 중복과 공백이 동시에 생깁니다.",
        "<strong>의사결정 순서</strong> — 검토 순서가 틀리면 이미 쓴 비용이 매몰됩니다.",
        "<strong>예산과 일정</strong> — 단계별 예산 범위와 마감이 있어야 제안을 비교할 수 있습니다.",
        "<strong>자료 보안</strong> — 사업수지와 계약 자료는 열람 전 비밀유지 동의가 필요합니다.",
        "<strong>산출물 정의</strong> — 각 참여자가 무엇을 제출하는지 미리 정해야 완료 확인이 가능합니다."
      ],
      risks: [
        "일정과 비용은 초기 조건을 확인하기 전까지 확정할 수 없습니다.",
        "각 분야 업무계약은 해당 전문가와 직접 체결하며, 프롭피어는 구성과 관리를 지원합니다."
      ],
      seq: ["프로젝트 구성 상담", "필요 분야 배정", "제안 비교", "프로젝트룸 운영"],
      docs: ["프로젝트 목표와 범위", "예산 범위", "희망 일정", "보유 자료 목록(도면·수지·계약)"],
      product: "second",
      productWhy:
        "복합 의뢰는 운영자 상담으로 역할을 먼저 정리한 뒤 전문가팀을 구성합니다.",
      caseSlug: "vacancy-to-lodging"
    }
  };

  var ASSETS = [
    "상가·근린생활시설",
    "오피스·업무시설",
    "주택·다가구·빌라",
    "토지·부지",
    "숙박·물류·기타"
  ];
  var STANCES = [
    "소유주·임대인",
    "임차인·운영자",
    "매수 검토 중",
    "시행·개발 검토 중",
    "업계 종사자(중개·자문 등)"
  ];
  var TIMINGS = ["이미 진행 중", "1개월 안", "3개월 안", "아직 미정"];
  var REGIONS = ["서울", "경기·인천", "지방 광역시", "그 외 지역"];
  var DOCS = [
    "계약서",
    "건축물대장",
    "도면",
    "견적서",
    "등기부등본",
    "현장 사진",
    "사업수지·수익표",
    "아직 없음"
  ];

  /* ---------------- 상태 ---------------- */
  var A = {
    problem: "",
    asset: "",
    stance: "",
    details: [],
    goal: "",
    timing: "",
    region: "",
    docs: [],
    memo: ""
  };
  var step = 0;
  var root = document.getElementById("wz-root");
  if (!root) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- 스텝 정의 ---------------- */
  function steps() {
    var P = PROBLEMS[A.problem];
    var list = [
      {
        key: "problem",
        type: "radio",
        q: "어떤 상황인지 먼저 알려주세요.",
        help: "정답을 몰라도 괜찮습니다. 가장 가까운 것을 고르시면 됩니다.",
        options: Object.keys(PROBLEMS).map(function (k) {
          return { v: k, t: PROBLEMS[k].label };
        })
      },
      {
        key: "asset",
        type: "radio",
        q: "대상 부동산의 유형은 무엇인가요?",
        options: ASSETS.map(function (t) {
          return { v: t, t: t };
        })
      },
      {
        key: "stance",
        type: "radio",
        q: "현재 어떤 입장이신가요?",
        help: "같은 문제도 입장에 따라 확인할 내용이 달라집니다.",
        options: STANCES.map(function (t) {
          return { v: t, t: t };
        })
      }
    ];

    if (P) {
      list.push({
        key: "details",
        type: "check",
        q: P.detailQ,
        help: "여러 개를 고를 수 있습니다.",
        options: P.details.map(function (t) {
          return { v: t, t: t };
        })
      });
      list.push({
        key: "goal",
        type: "radio",
        q: P.goalQ,
        options: P.goals.map(function (t) {
          return { v: t, t: t };
        })
      });
    }

    list.push({
      key: "timing",
      type: "radio",
      q: "언제까지 결정이 필요하신가요?",
      options: TIMINGS.map(function (t) {
        return { v: t, t: t };
      })
    });
    list.push({
      key: "region",
      type: "radio",
      q: "대상 부동산은 어느 지역에 있나요?",
      help: "지역에 따라 확인 기준과 연결 가능한 전문가가 달라집니다.",
      options: REGIONS.map(function (t) {
        return { v: t, t: t };
      })
    });
    list.push({
      key: "docs",
      type: "check",
      q: "지금 가지고 계신 자료가 있나요?",
      help: "자료가 없어도 진단은 끝까지 진행됩니다. 없는 자료는 준비 목록으로 정리해 드립니다.",
      options: DOCS.map(function (t) {
        return { v: t, t: t };
      })
    });
    list.push({
      key: "memo",
      type: "text",
      q: "더 알려주실 내용이 있다면 적어주세요.",
      help: "선택 항목입니다. 비워두셔도 됩니다."
    });

    return list;
  }

  /* ---------------- 렌더 ---------------- */
  function render() {
    var S = steps();
    if (step >= S.length) return renderResult();

    var s = S[step];
    var total = S.length;
    var pct = Math.round((step / total) * 100);
    var mins = Math.max(1, Math.round(((total - step) * 18) / 60));

    var html =
      '<div class="wz__bar"><i style="width:' +
      pct +
      '%"></i></div>' +
      '<div class="wz__meta"><span class="num">' +
      (step + 1) +
      " / " +
      total +
      ' 단계</span><span>남은 시간 약 ' +
      mins +
      '분</span></div>' +
      '<div class="wz__card">' +
      '<h1 class="wz__q">' +
      esc(s.q) +
      "</h1>" +
      (s.help ? '<p class="wz__help">' + esc(s.help) + "</p>" : "");

    if (s.type === "text") {
      html +=
        '<div class="field" style="margin-top:22px">' +
        '<label for="wz-memo">추가 설명 (선택)</label>' +
        '<textarea id="wz-memo" placeholder="예: 1층 상가 40평, 6개월째 공실이고 숙박업을 검토 중입니다.">' +
        esc(A.memo) +
        "</textarea></div>";
    } else {
      html += '<div class="wz__opts">';
      s.options.forEach(function (o) {
        var on =
          s.type === "check" ? A[s.key].indexOf(o.v) > -1 : A[s.key] === o.v;
        html +=
          '<button type="button" class="opt' +
          (s.type === "radio" ? " opt--radio" : "") +
          '" data-v="' +
          esc(o.v) +
          '" aria-pressed="' +
          (on ? "true" : "false") +
          '">' +
          '<span class="opt__box" aria-hidden="true">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          "</span><span>" +
          esc(o.t) +
          "</span></button>";
      });
      html += "</div>";
    }

    html +=
      '<div class="wz__nav">' +
      (step > 0
        ? '<button type="button" class="btn btn--ghost btn--sm" data-back>이전</button>'
        : "") +
      '<button type="button" class="wz__save" data-save>임시저장</button>' +
      '<button type="button" class="btn btn--primary" data-next>' +
      (step === total - 1 ? "진단 결과 보기" : "다음") +
      "</button></div></div>" +
      '<p class="wz__help" style="margin-top:18px;text-align:center;color:var(--pp-text-3);font-size:var(--pp-fs-caption)">' +
      "진단 결과는 상담 준비를 돕기 위한 정리이며, 법률·세무·감정 판단을 확정하지 않습니다.</p>";

    root.innerHTML = html;
    bindStep(s);
    focusHead();
  }

  function bindStep(s) {
    root.querySelectorAll(".opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-v");
        if (s.type === "check") {
          var i = A[s.key].indexOf(v);
          if (i > -1) A[s.key].splice(i, 1);
          else A[s.key].push(v);
          btn.setAttribute(
            "aria-pressed",
            A[s.key].indexOf(v) > -1 ? "true" : "false"
          );
        } else {
          A[s.key] = v;
          root.querySelectorAll(".opt").forEach(function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          // 단일 선택은 곧바로 다음 질문으로 (모바일 입력 부담 감소)
          window.setTimeout(next, 180);
        }
      });
    });

    var back = root.querySelector("[data-back]");
    if (back)
      back.addEventListener("click", function () {
        step = Math.max(0, step - 1);
        render();
      });

    var nx = root.querySelector("[data-next]");
    if (nx) nx.addEventListener("click", next);

    var sv = root.querySelector("[data-save]");
    if (sv)
      sv.addEventListener("click", function () {
        readMemo();
        var ok = store.set(SAVE_KEY, JSON.stringify({ a: A, s: step }));
        sv.textContent = ok
          ? "이 브라우저에 저장했습니다"
          : "저장할 수 없는 환경입니다";
        window.setTimeout(function () {
          sv.textContent = "임시저장";
        }, 2200);
      });
  }

  function readMemo() {
    var t = document.getElementById("wz-memo");
    if (t) A.memo = t.value;
  }

  function next() {
    var S = steps();
    var s = S[step];
    readMemo();

    if (s.type === "radio" && !A[s.key]) return shake();
    if (s.type === "check" && s.key === "details" && !A.details.length)
      return shake();

    step += 1;
    store.set(SAVE_KEY, JSON.stringify({ a: A, s: step }));
    track("diagnosis_step", { step: step, problem: A.problem });
    render();
  }

  function shake() {
    var card = root.querySelector(".wz__card");
    if (!card) return;
    card.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" }
      ],
      { duration: 260 }
    );
    var help = root.querySelector(".wz__help");
    if (help) {
      help.textContent = "하나 이상 선택하면 다음으로 넘어갑니다.";
      help.style.color = "var(--pp-red)";
    }
  }

  function focusHead() {
    var h = root.querySelector(".wz__q");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }

  /* ---------------- 결과 ---------------- */
  function missingDocs(P) {
    var have = A.docs.filter(function (d) {
      return d !== "아직 없음";
    });
    return P.docs.filter(function (d) {
      return !have.some(function (h) {
        return d.indexOf(h) > -1 || h.indexOf(d.slice(0, 3)) > -1;
      });
    });
  }

  function renderResult() {
    var P = PROBLEMS[A.problem];
    if (!P) {
      step = 0;
      return render();
    }
    track("diagnosis_complete", { problem: A.problem });
    store.set(SAVE_KEY, JSON.stringify({ a: A, s: step }));

    var need = missingDocs(P);
    var urgent = A.timing === "이미 진행 중" || A.timing === "1개월 안";
    var outside = A.region === "그 외 지역";

    var prod = null;
    (window.PROPPEER.products || []).forEach(function (p) {
      if (p.id === P.product) prod = p;
    });

    var h = "";

    h +=
      '<div class="wz__bar"><i style="width:100%"></i></div>' +
      '<div class="wz__meta"><span>진단 완료</span><span>' +
      esc(P.short) +
      "</span></div>";

    h += '<div class="wz__card">';
    h +=
      '<span class="eyebrow">진단 결과</span>' +
      '<h1 class="wz__q">' +
      esc(P.label.replace(/요$/, "신 상황")) +
      "에 대해<br>지금 확인할 것을 정리했습니다.</h1>";

    /* 상황 요약 */
    h += '<div class="res__block"><div class="res__k">입력하신 상황</div><div class="res__sum">';
    [
      ["문제", P.short],
      ["자산", A.asset],
      ["입장", A.stance],
      ["목표", A.goal],
      ["시점", A.timing],
      ["지역", A.region]
    ].forEach(function (p) {
      if (p[1]) h += "<b>" + esc(p[0]) + " <em>" + esc(p[1]) + "</em></b>";
    });
    h += "</div>";
    if (A.details.length) {
      h +=
        '<p class="wz__help" style="margin-top:12px">세부 상황 : ' +
        esc(A.details.join(" · ")) +
        "</p>";
    }
    h += "</div>";

    /* 핵심 쟁점 */
    h +=
      '<div class="res__block"><div class="res__k">먼저 확인해야 할 것</div><ul class="res__list">';
    P.issues.forEach(function (t) {
      h += "<li>" + t + "</li>";
    });
    h += "</ul></div>";

    /* 확인 전 단정할 수 없는 것 */
    h +=
      '<div class="res__block"><div class="res__k">확인 전에는 단정할 수 없는 부분</div>' +
      '<div class="note note--gold"><div class="note__t">판단이 아니라 확인이 필요한 항목입니다</div>';
    P.risks.forEach(function (t) {
      h += "<p style='margin-bottom:6px'>· " + esc(t) + "</p>";
    });
    h += "</div></div>";

    /* 준비 자료 */
    h += '<div class="res__block"><div class="res__k">상담 전에 준비하면 좋은 자료</div>';
    if (need.length) {
      h += '<ul class="checks">';
      need.forEach(function (d) {
        h += "<li><strong>" + esc(d) + "</strong></li>";
      });
      h += "</ul>";
      h +=
        '<p class="wz__help">자료가 없어도 상담은 가능합니다. 없는 자료는 상담 과정에서 확보 방법을 함께 안내합니다.</p>';
    } else {
      h +=
        '<div class="note note--green"><div class="note__t">준비 완료</div><p>필요한 자료를 이미 보유하고 계십니다. 상담에서 바로 내용 검토로 들어갈 수 있습니다.</p></div>';
    }
    h += "</div>";

    /* 추천 분야와 순서 */
    h +=
      '<div class="res__block"><div class="res__k">필요한 전문 분야와 확인 순서</div><div class="res__seq">';
    P.seq.forEach(function (t, i) {
      h += "<span>" + esc(t) + "</span>";
      if (i < P.seq.length - 1) h += "<i>→</i>";
    });
    h += "</div>";
    h +=
      '<p class="wz__help" style="margin-top:12px">순서를 지키는 이유는, 앞 단계 결과에 따라 뒤 단계의 검토 범위가 달라지기 때문입니다.</p>';
    if (urgent) {
      h +=
        '<div class="note" style="margin-top:16px"><div class="note__t">일정이 촉박한 경우</div><p>결정 시점이 가깝다면 전체 검토보다 <strong>' +
        esc(P.seq[0]) +
        "</strong> 분야를 먼저 확인해 되돌릴 수 없는 항목부터 점검하는 편이 낫습니다.</p></div>";
    }
    h += "</div>";

    /* 추천 상담 */
    if (prod) {
      h +=
        '<div class="res__block"><div class="res__k">이 상황에 맞는 상담</div>' +
        '<div class="prod" style="max-width:420px">' +
        '<div class="prod__top"><div class="prod__name">' +
        esc(prod.name) +
        '</div><div class="prod__price">' +
        esc(prod.price) +
        "<small>출시 시점 기준</small></div></div>" +
        '<div class="prod__body">' +
        '<div class="prod__row"><span class="prod__k">포함</span><span class="prod__v">' +
        esc(prod.include) +
        "</span></div>" +
        '<div class="prod__row"><span class="prod__k">제외</span><span class="prod__v">' +
        esc(prod.exclude) +
        "</span></div>" +
        '<div class="prod__row"><span class="prod__k">결과물</span><span class="prod__v">' +
        esc(prod.output) +
        "</span></div></div></div>" +
        '<p class="wz__help" style="margin-top:12px">' +
        esc(P.productWhy) +
        "</p></div>";
    }

    if (outside) {
      h +=
        '<div class="res__block"><div class="note note--gold"><div class="note__t">서비스 지역 안내</div><p>초기 검증 전문가는 수도권과 광역시를 중심으로 구성하고 있습니다. 그 외 지역은 순차적으로 넓히고 있으며, 신청해주시면 해당 지역 전문가가 준비되는 대로 우선 안내드립니다.</p></div></div>';
    }

    /* 다음 행동 */
    h +=
      '<div class="res__block"><div class="res__k">지금 하실 수 있는 것</div>' +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn--primary" data-goform data-track="diagnosis_result_cta">상담 오픈 시 우선 안내받기</button>' +
      '<button type="button" class="btn btn--ghost" data-copy>결과 복사하기</button>' +
      '<button type="button" class="btn btn--ghost" data-print>인쇄 · PDF 저장</button>' +
      '<a class="btn btn--ghost" href="/cases/' +
      esc(P.caseSlug) +
      '">관련 사례 보기</a>' +
      "</div>" +
      '<p class="wz__help" style="margin-top:14px">진단 내용은 이 브라우저에만 저장됩니다. 서버로 보내려면 아래에서 연락처를 남겨주세요.</p>' +
      "</div>";

    h += "</div>"; /* /wz__card */

    /* 접수 폼 */
    h +=
      '<div class="wz__card" id="wz-form" style="margin-top:20px">' +
      '<span class="eyebrow">상담 오픈 알림</span>' +
      '<h2 class="wz__q" style="font-size:1.25rem">진단 내용을 남겨두시면, 담당 분야 전문가가 준비되는 대로 먼저 안내드립니다.</h2>' +
      '<p class="wz__help">지금은 정식 상담 오픈 전이라 검증된 전문가를 분야별로 모으고 있는 단계입니다. 남겨주신 순서대로 연락드립니다.</p>' +
      '<form class="form" data-pp-form="diagnosis-waitlist" data-pp-subject="진단 접수" style="margin-top:22px">' +
      '<input type="hidden" name="문제" value="' +
      esc(P.short) +
      '"><input type="hidden" name="자산" value="' +
      esc(A.asset) +
      '"><input type="hidden" name="입장" value="' +
      esc(A.stance) +
      '"><input type="hidden" name="세부상황" value="' +
      esc(A.details.join(" / ")) +
      '"><input type="hidden" name="목표" value="' +
      esc(A.goal) +
      '"><input type="hidden" name="시점" value="' +
      esc(A.timing) +
      '"><input type="hidden" name="지역" value="' +
      esc(A.region) +
      '"><input type="hidden" name="보유자료" value="' +
      esc(A.docs.join(" / ")) +
      '"><input type="hidden" name="추가설명" value="' +
      esc(A.memo) +
      '">' +
      '<div class="grid grid-2">' +
      '<div class="field"><label for="wz-name">이름</label><input id="wz-name" name="이름" type="text" required placeholder="홍길동"><span class="field__err">이름을 입력해주세요.</span></div>' +
      '<div class="field"><label for="wz-contact">연락처</label><input id="wz-contact" name="연락처" type="text" required placeholder="이메일 또는 휴대폰 번호"><span class="field__err">연락받으실 방법을 입력해주세요.</span></div>' +
      "</div>" +
      '<div class="field"><label>연락 희망 방법</label><div class="chips">' +
      ["이메일", "문자", "전화"]
        .map(function (t, i) {
          return (
            '<label class="chip"><input type="radio" name="연락방법" value="' +
            t +
            '"' +
            (i === 0 ? " checked" : "") +
            "><span>" +
            t +
            "</span></label>"
          );
        })
        .join("") +
      "</div></div>" +
      '<label class="agree"><input type="checkbox" name="동의" value="동의" required><span>진단 내용과 연락처를 상담 안내 목적으로 수집·이용하는 데 동의합니다. 목적 달성 후 파기하며, 동의는 언제든 철회할 수 있습니다. <a href="/trust">처리 기준 보기</a></span></label>' +
      '<div class="form__msg" role="status"></div>' +
      '<button type="submit" class="btn btn--primary btn--block">진단 내용과 함께 접수하기</button>' +
      "</form></div>";

    h +=
      '<div style="margin-top:18px;text-align:center">' +
      '<button type="button" class="wz__save" data-restart>처음부터 다시 진단하기</button></div>';

    root.innerHTML = h;
    bindResult(P);
    focusHead();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resultText(P) {
    var L = [];
    L.push("[프롭피어 진단 결과] " + P.short);
    L.push("");
    L.push("· 자산 : " + A.asset);
    L.push("· 입장 : " + A.stance);
    L.push("· 세부 : " + A.details.join(", "));
    L.push("· 목표 : " + A.goal);
    L.push("· 시점 : " + A.timing + " / 지역 : " + A.region);
    if (A.memo) L.push("· 추가 : " + A.memo);
    L.push("");
    L.push("[먼저 확인해야 할 것]");
    P.issues.forEach(function (t, i) {
      L.push(i + 1 + ". " + t.replace(/<[^>]+>/g, ""));
    });
    L.push("");
    L.push("[확인 전 단정할 수 없는 부분]");
    P.risks.forEach(function (t) {
      L.push("· " + t);
    });
    L.push("");
    L.push("[준비 자료] " + P.docs.join(", "));
    L.push("[확인 순서] " + P.seq.join(" → "));
    L.push("");
    L.push("※ 이 결과는 상담 준비용 정리이며 법률·세무·감정 판단을 대신하지 않습니다.");
    return L.join("\n");
  }

  function bindResult(P) {
    var copy = root.querySelector("[data-copy]");
    if (copy)
      copy.addEventListener("click", function () {
        var txt = resultText(P);
        var done = function () {
          copy.textContent = "복사했습니다";
          window.setTimeout(function () {
            copy.textContent = "결과 복사하기";
          }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(done, function () {
            fallbackCopy(txt, done);
          });
        } else fallbackCopy(txt, done);
      });

    var pr = root.querySelector("[data-print]");
    if (pr) pr.addEventListener("click", function () { window.print(); });

    var go = root.querySelector("[data-goform]");
    if (go)
      go.addEventListener("click", function () {
        var f = document.getElementById("wz-form");
        if (f) {
          f.scrollIntoView({ behavior: "smooth", block: "start" });
          var i = f.querySelector("input[type=text]");
          if (i) window.setTimeout(function () { i.focus(); }, 400);
        }
      });

    var rs = root.querySelector("[data-restart]");
    if (rs)
      rs.addEventListener("click", function () {
        store.del(SAVE_KEY);
        A = {
          problem: "",
          asset: "",
          stance: "",
          details: [],
          goal: "",
          timing: "",
          region: "",
          docs: [],
          memo: ""
        };
        step = 0;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  }

  function fallbackCopy(txt, done) {
    var ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------------- 시작 ---------------- */
  function boot() {
    var q = new URLSearchParams(window.location.search);
    var p = q.get("p");
    var saved = store.get(SAVE_KEY);

    if (p && PROBLEMS[p]) {
      A.problem = p;
      step = 1;
      track("diagnosis_start", { entry: "problem_card", problem: p });
      render();
      return;
    }

    if (saved) {
      try {
        var o = JSON.parse(saved);
        if (o && o.a && o.a.problem) {
          root.innerHTML =
            '<div class="wz__card" style="text-align:center">' +
            '<h1 class="wz__q">이어서 진행할까요?</h1>' +
            '<p class="wz__help">이 브라우저에 저장된 진단이 있습니다. (' +
            esc(PROBLEMS[o.a.problem] ? PROBLEMS[o.a.problem].short : "진행 중") +
            ")</p>" +
            '<div class="btn-row" style="justify-content:center;margin-top:24px">' +
            '<button type="button" class="btn btn--primary" data-resume>이어서 하기</button>' +
            '<button type="button" class="btn btn--ghost" data-fresh>새로 시작하기</button></div></div>';
          root.querySelector("[data-resume]").addEventListener("click", function () {
            A = o.a;
            step = o.s || 0;
            render();
          });
          root.querySelector("[data-fresh]").addEventListener("click", function () {
            store.del(SAVE_KEY);
            track("diagnosis_start", { entry: "fresh" });
            render();
          });
          return;
        }
      } catch (e) {}
    }

    track("diagnosis_start", { entry: "direct" });
    render();
  }

  boot();
})();
