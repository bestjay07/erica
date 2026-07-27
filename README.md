# 스마트 인강 스케줄러 (Vercel 배포용)

Gemini API를 이용해 인강 정보를 자동 검색하고, 지정한 기간 동안 분배 및 재계산해주는 웹앱 프로젝트입니다.

## 파일 구조
- `api/generate.js`: Gemini 2.5 Flash API를 호출하는 Vercel 서버리스 백엔드
- `public/index.html`: 프론트엔드 메인 화면 및 실시간 학습 일정 계산/미수강 이월 로직
- `package.json`: Node.js 의존성 파일 (`@google/genai` 사용)

## Vercel 배포 가이드
1. 압축을 해제한 폴더의 파일들을 GitHub 레포지토리에 올립니다.
2. Vercel(https://vercel.com)에서 **Add New Project**를 선택하고 해당 레포지토리를 가져옵니다.
3. **Environment Variables** 설정에서 아래 환경변수를 입력합니다:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Google AI Studio에서 발급받은 API 키
4. **Deploy** 버튼을 눌러 배포를 완료합니다.
