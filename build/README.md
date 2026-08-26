# 페이지 생성기

전문가 프로필처럼 데이터에서 만들어지는 페이지를 생성합니다.

```bash
node build/gen-site.js
```

## 언제 실행하나요

| 상황 | 재생성 필요 |
| --- | --- |
| `assets/data/experts.json` 에 전문가를 추가·수정 | **필요** (프로필 페이지가 만들어집니다) |
| 전문가 검색·필터·비교 결과만 바뀌면 됨 | 불필요 (JSON을 직접 읽습니다) |
| 메뉴·푸터·공통 문구 변경 | 필요 |
| 사례 글 내용 변경 | 필요 |
| CSS·JS만 수정 | 불필요 |

## 파일

- `gen-site.js` — 메인·진단·소개·검증기준·전문가등록·사례·404
- `gen-experts.js` — 전문가 목록·프로필·상담요청

생성된 HTML은 저장소에 커밋해 올립니다.
Cloudflare Pages 설정의 Build command 에 `node build/gen-site.js` 를 넣으면 자동으로 처리할 수도 있습니다.
