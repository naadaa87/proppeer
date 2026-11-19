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

## 주소(도메인)

- 대표 주소·사이트맵·robots.txt 는 `gen-site.js` 맨 위의 `SITE` 값으로 만들어집니다. 지금은 실제로 열리는 `https://proppeer.pages.dev` 입니다.
- 자체 도메인을 연결하면 `SITE` 와 `assets/js/config.js` 의 `brand.site` 를 그 주소로 바꾸고 `node build/gen-site.js` 를 다시 실행합니다.
- 전문가 프로필·질문 상세는 예시 데이터(`meta.mode: "sample"`)인 동안 검색 제외(noindex)로 만들어지고 사이트맵에서도 빠집니다. 실제 데이터로 바꾸면 자동으로 풀립니다.
- 링크는 `.html` 없는 주소로 적습니다. 손으로 만든 HTML 은 `python3 tools/clean_urls.py . proppeer.pages.dev` 로 맞춥니다.
