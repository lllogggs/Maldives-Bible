<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 몰디브 리조트 가이드 앱

Vite + React로 작성된 정적 사이트로, `public/api`에 저장된 리조트 데이터를 바탕으로 몰디브 리조트를 탐색할 수 있습니다. 추가 API 키 없이도 로컬 실행과 GitHub Pages 배포가 가능합니다.

AI Studio에서 원본 앱을 확인하려면 다음 링크를 방문하세요: https://ai.studio/apps/drive/13AT_mh8BY8Loo3i_7IIIqVl7VMRfJMPt

## 로컬 실행 방법

**사전 준비:** Node.js

1. 의존성 설치
   ```bash
   npm install
   ```
2. 개발 서버 실행
   ```bash
   npm run dev
   ```
3. 브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 주소)로 접속합니다.

앱은 [`public/api`](public/api)에 포함된 JSON 데이터를 바로 로드하므로 추가 환경 변수나 비밀 키가 필요하지 않습니다.

## 프로덕션 빌드

최적화된 번들을 `dist/` 폴더에 생성하려면 다음 명령을 실행하세요.

```bash
npm run build
```

로컬에서 프로덕션 번들을 미리보고 싶다면:

```bash
npm run preview
```

## GitHub Pages 배포

이 저장소는 수동 배포(`gh-pages` 스크립트)와 자동 배포(GitHub Actions)를 모두 지원합니다.

### 자동 배포 (권장)
1. 저장소의 **Settings → Pages**에서 Source를 `GitHub Actions`로 설정합니다.
2. `main` 브랜치로 커밋을 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 워크플로가 자동으로 실행되어 사이트를 Pages에 게시합니다.

### 수동 배포
1. 저장소를 GitHub에 push한 뒤 Pages가 `gh-pages` 브랜치를 사용하도록 설정합니다.
2. 로컬에서 빌드 및 배포:
   ```bash
   npm run deploy
   ```
   이 스크립트는 `vite build`를 실행한 후 [`gh-pages`](https://www.npmjs.com/package/gh-pages) 패키지로 `dist/` 폴더를 게시합니다.
3. `https://<사용자명>.github.io/Maldives-Bible/` 주소에 접속하여 결과를 확인합니다.

## (선택) 리조트 데이터 재생성

현재 저장된 JSON 데이터만으로 앱을 실행하고 배포할 수 있습니다. 다만 최신 데이터를 Gemini 모델로 재생성하고 싶다면 다음 순서를 따르세요.

1. Google AI Studio에서 발급받은 키를 환경 변수로 설정합니다.
   ```bash
   export API_KEY="YOUR_GEMINI_API_KEY"
   ```
2. 데이터 생성 스크립트 실행
   ```bash
   npm run generate-data
   ```

생성된 결과는 `public/api` 아래 JSON 파일로 저장됩니다.
