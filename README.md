# KYNN TECHNOLOGY 홈페이지

kynntechnology.com 의 소스입니다. 빌드 도구 없는 정적 사이트이며 GitHub Pages로 배포됩니다.

## 구성
- `index.html` — 페이지 하나. 검은 바탕에 KYNN TECHNOLOGY 워드마크, 상단 탭 4개(회사소개 · 하는 일 · 채용 · 문의). 탭을 누르면 같은 페이지 안에서 해당 내용만 보입니다(주소 `#about`, `#work`, `#careers`, `#contact`). 하는 일 탭의 웨이퍼·부품·장비 그림은 파일 안에 직접 그린 SVG이므로 이미지 파일이 따로 없습니다.
- `styles.css` — 스타일. 색·서체 토큰은 파일 맨 위에 있습니다.
- `script.js` — 배경 웨이퍼 애니메이션(캔버스)과 탭 전환. 자바스크립트가 꺼져 있어도 내용은 모두 보입니다.
- `assets/` — 로고, 파비콘, OG 이미지, 자체 호스팅 글꼴(Pretendard).

## 수정·배포
문구는 `index.html` 안의 각 `<section class="panel">`에 있습니다. 고친 뒤 `main`에 push 하면 1~2분 내 반영됩니다.

```bash
git add -A
git commit -m "문구 수정"
git push
```
