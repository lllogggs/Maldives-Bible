<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/13AT_mh8BY8Loo3i_7IIIqVl7VMRfJMPt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build for Production

Generate an optimized bundle in `dist/`:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

## Deploy to GitHub Pages

The project now supports both manual deployment with `gh-pages` and automatic deployment through GitHub Actions.

### 자동 배포 (권장)
1. 저장소 **Settings → Pages**에서 Source를 `GitHub Actions`로 선택합니다.
2. **Settings → Secrets and variables → Actions**에서 `GEMINI_API_KEY` 시크릿을 추가합니다.
3. `main` 브랜치에 변경 사항을 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 자동으로 빌드하고 Pages에 게시합니다.

### 수동 배포
1. 저장소를 GitHub에 push한 뒤 Pages가 `gh-pages` 브랜치를 사용하도록 설정합니다.
2. 로컬에서 빌드 및 게시:

   ```bash
   npm run deploy
   ```

   이 명령은 `vite build`를 실행한 다음 [`gh-pages`](https://www.npmjs.com/package/gh-pages)를 사용해 `dist/` 폴더를 게시합니다.
3. `https://<사용자명>.github.io/Maldives-Bible/` URL에 접속해 결과를 확인합니다.

> **중요:** 빌드 시점에 `GEMINI_API_KEY`가 클라이언트 번들에 주입되므로 Pages에 공개 배포하면 키가 노출됩니다. 테스트용 키만 사용하거나, 민감한 요청은 백엔드 프록시로 처리하는 구조로 변경하세요.
