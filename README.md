# 다독임 - 통합 심리 상담 서비스

React + TypeScript + Vite 기반의 통합 심리 상담 서비스입니다. AI 채팅, 지도 검색, 캘린더 기능을 제공합니다.

## 🚀 주요 기능

### 1. AI 상담 챗봇
- **Gemini & ChatGPT 지원**: 두 AI 모델 간 전환 가능
- **실시간 채팅**: 사용자와 AI 간의 실시간 대화
- **대화 기록**: 서버에서 대화 기록 불러오기 및 저장
- **다크/라이트 모드**: 사용자 선호에 따른 테마 변경

### 2. 주변 병원 검색
- **카카오 맵 연동**: 실시간 지도에서 병원 위치 확인
- **현재 위치 기반 검색**: GPS를 이용한 주변 병원 찾기
- **상세 정보 제공**: 병원 정보, 전화번호, 주소 등
- **반응형 UI**: 모바일 친화적인 인터페이스

### 3. 약물 캘린더 (예정)
- **일정 관리**: 약물 복용 일정 등록 및 관리
- **알림 기능**: 복용 시간에 맞춘 알림
- **복용 기록**: 시각적 복용 기록 확인

## 🏗️ 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트들
│   ├── Chat/           # 채팅 관련 컴포넌트
│   ├── Header/         # 헤더 컴포넌트
│   ├── Message/        # 메시지 컴포넌트
│   ├── Input/          # 입력 컴포넌트
│   └── Map/            # 지도 컴포넌트
├── hooks/              # 커스텀 훅들
│   ├── useChat.ts      # 채팅 관련 로직
│   ├── useTheme.ts     # 테마 관리
│   └── useMenu.ts      # 메뉴 상태 관리
├── services/           # API 서비스 레이어
│   └── api.ts          # API 호출 함수들
├── utils/              # 유틸리티 함수들
│   └── index.ts        # 날짜, 거리 계산 등
├── constants/          # 상수값들
│   └── index.ts        # API URL, 모델 타입 등
├── types/              # TypeScript 타입 정의
│   └── index.ts        # 인터페이스 정의
├── styles/             # 스타일 파일들
│   ├── App.css         # 메인 스타일
│   └── index.css       # 전역 스타일
├── pages/              # 페이지 컴포넌트들
│   ├── MainPage.tsx    # 메인 페이지
│   ├── ChatPage.tsx    # 채팅 페이지
│   ├── MapPage.tsx     # 지도 페이지
│   └── CalendarPage.tsx # 캘린더 페이지
├── lib/                # 외부 라이브러리 설정
│   └── kakao.ts        # 카카오 맵 API 설정
├── App.tsx             # 메인 애플리케이션 컴포넌트
└── main.tsx            # 애플리케이션 진입점
```

## 🛠️ 기술 스택

- **React 19.1.1**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite 7.1.2**: 빌드 도구
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **Tailwind CSS 3**: 유틸리티 기반 스타일링
- **카카오 맵 API**: 지도 서비스

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 필요한 값들을 설정하세요:
```bash
cp .env.example .env
```

```env
# 카카오 맵 API 키
VITE_KAKAO_JS_KEY=your_kakao_map_api_key_here

# 백엔드 API URL
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

### 5. 린트 검사
```bash
npm run lint
```

### Tailwind CSS
- 전역 엔트리(`src/styles/index.css`)에 Tailwind 기본 디렉티브가 포함되어 있습니다.
- 컴포넌트에서는 Tailwind 유틸리티 클래스를 활용해 스타일을 작성하세요.
- 필요 시 `tailwind.config.js`의 `theme.extend`를 수정해 색상/폰트 등을 확장할 수 있습니다.

## 🔧 설정

### 카카오 맵 API 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/)에서 애플리케이션 생성
2. JavaScript 키 발급
3. `.env` 파일에 `VITE_KAKAO_JS_KEY` 설정
4. 플랫폼 설정에서 도메인 등록

### 백엔드 API 설정
백엔드 서버는 다음 엔드포인트를 제공해야 합니다:
- `POST /api/gemini` - Gemini API 호출
- `POST /api/chat` - ChatGPT API 호출
- `GET /api/gemini/history/all` - 대화 기록 조회
- `GET /api/clinics/search` - 클리닉 검색

## 📱 사용법

### AI 상담
1. 메인 페이지에서 "AI 상담 시작하기" 클릭
2. Gemini 또는 ChatGPT 모델 선택
3. 메시지 입력 후 전송
4. AI 응답 확인

### 주변 병원 검색
1. 메인 페이지에서 "주변 병원 검색" 클릭
2. 검색어 입력 (예: "정신건강의학과")
3. "현 위치로" 버튼으로 현재 위치 기반 검색
4. 검색 결과에서 병원 선택하여 상세 정보 확인

## 🎨 디자인 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크/라이트 모드**: 사용자 선호에 따른 테마 변경
- **모던 UI**: 깔끔하고 직관적인 사용자 인터페이스
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 🔄 상태 관리

- **React Hooks**: useState, useEffect를 활용한 상태 관리
- **커스텀 훅**: 로직 재사용을 위한 커스텀 훅 활용
- **로컬 스토리지**: 테마 설정 등 사용자 설정 저장

## 🚀 배포

### Vercel 배포
```bash
npm run build
# dist 폴더를 Vercel에 업로드
```

### Netlify 배포
```bash
npm run build
# dist 폴더를 Netlify에 드래그 앤 드롭
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
