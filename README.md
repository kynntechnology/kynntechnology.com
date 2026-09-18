# 킨테크놀로지 (KYNN TECHNOLOGY) 홈페이지

kynntechnology.com 의 소스입니다. 빌드 도구 없이 동작하는 정적 사이트(HTML/CSS)이며 GitHub Pages로 배포됩니다.

## 파일
- `index.html` — 메인 페이지
- `careers.html` — 채용 안내
- `styles.css` — 스타일 (상단 주석에 디자인 토큰 설명)
- `script.js` — 모바일 메뉴 토글(짧은 순수 JS, 없어도 메뉴는 펼쳐진 채로 보임)
- `assets/` — 로고, 파비콘, OG 이미지
- `.htmlvalidate.json` — `npx html-validate index.html careers.html` 검사 설정

## 수정·배포
1. 파일을 고친다 (문구는 `index.html`, `careers.html` 안에 그대로 있음).
2. 커밋 후 `main` 브랜치에 push 하면 1~2분 내 자동 반영된다.

```bash
git add -A
git commit -m "문구 수정"
git push
```

Claude Code에게 "대표 인사 문구를 다듬어줘"처럼 말해도 됩니다.

## 마크업 메모
- `<ul>`/`<ol>`에 붙은 `role="list"`는 일부러 둔 것입니다. `list-style: none`을 주면 Safari/VoiceOver가 목록 의미를 없애기 때문에 이를 되살리는 표기이며, 그래서 `.htmlvalidate.json`에서 `no-redundant-role`·`prefer-native-element` 규칙을 껐습니다.
- 채용 페이지의 자리 표는 560px 미만에서 CSS만으로 행마다 쌓인 항목표로 바뀝니다. 그때 표 의미가 사라지지 않도록 `role="table"/"row"/"rowheader"/"cell"`을 명시했고(첫 열의 역할명은 `<th scope="row">`), 머리글은 각 칸의 `data-label`에서 읽습니다. 머리글을 바꾸면 `data-label`도 같이 바꿔 주세요.
