# LG SW Bootcamp 2026 — 프로젝트 수상작 사이트

## 📌 개요
LG SW Bootcamp 2026 12기·13기 프로젝트 수상작을 소개하는 정적 웹사이트입니다.

## 🚀 로컬 실행
정적 사이트이므로 별도의 빌드 과정 없이 로컬 서버로 실행할 수 있습니다.

### 방법 1: VS Code Live Server
1. VS Code에서 이 폴더를 엽니다.
2. Live Server 확장을 설치합니다.
3. `index.html`을 우클릭 → **Open with Live Server**

### 방법 2: Python 내장 서버
```bash
cd bootcamp_project
python -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

### 방법 3: Node.js
```bash
npx serve .
```

## 📂 프로젝트 구조
```
bootcamp_project/
├── index.html              # 메인 페이지
├── css/style.css           # 스타일시트
├── js/
│   ├── main.js             # 탭 전환, 검색, 필터, 애니메이션
│   └── data-loader.js      # JSON 데이터 로드 및 카드 렌더링
├── data/projects.json      # 프로젝트 데이터 (여기만 수정하면 됩니다!)
├── project/detail.html     # 프로젝트 상세 페이지
└── README.md
```

## ✏️ 프로젝트 추가·수정 방법

### 새 프로젝트 추가
`data/projects.json` 파일을 열고, 해당 기수의 `projects` 배열에 아래 형식의 객체를 추가하세요:

```json
{
  "id": "13-011",
  "award": "우수상",
  "title": "프로젝트 이름",
  "team_name": "팀 이름",
  "members": ["이름1", "이름2", "이름3"],
  "summary": "프로젝트를 한 줄로 설명",
  "description": "프로젝트에 대한 상세 설명을 작성합니다.",
  "tech_stack": ["Python", "React"],
  "links": {
    "github": "https://github.com/...",
    "demo": "https://...",
    "video": "https://..."
  },
  "thumbnail": "images/13-011.jpg"
}
```

- **id**: `기수-번호` 형식 (예: `13-011`)
- **award**: `"대상"`, `"최우수상"`, `"우수상"`, `"인기상"`, 또는 `""` (수상 없음)
- 링크가 없으면 빈 문자열 `""` 입력

### 새 기수 추가
`data/projects.json`의 `cohorts` 객체에 새 키를 추가하세요:
```json
"14": {
  "name": "14기",
  "period": "2027.03 ~ 2027.04",
  "stats": { "participants": 120, "projects": 30, "duration_weeks": 4 },
  "projects": [ ... ]
}
```
그리고 `index.html`의 `.cohort-tabs`에 새 버튼을 추가합니다.

## 🌐 GitHub Pages 배포
1. GitHub 저장소에 코드를 push합니다.
2. **Settings → Pages → Source**에서 `main` 브랜치 / `/ (root)` 선택
3. 저장 후 `https://username.github.io/repo-name/` 에서 확인

## 🎨 기능
- 12기 / 13기 탭 전환 (URL 해시 연동)
- 프로젝트 검색 (이름, 팀명, 기술 스택)
- 수상 카테고리 필터
- 다크/라이트 모드 전환
- 반응형 디자인 (모바일/태블릿/데스크탑)
- 스크롤 등장 애니메이션
- 프로젝트 상세 페이지 (이전/다음 네비게이션)
