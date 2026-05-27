# RoomFit

작은 주거 공간을 위한 2D 가구 배치 시뮬레이터 MVP입니다. 방 크기를 입력하고, 가구를 추가한 뒤 드래그 앤 드롭으로 배치하면서 겹침 여부와 방 밖 이탈 여부를 바로 확인할 수 있습니다.

## Stack

- React 18
- TypeScript
- Vite 4
- Tailwind CSS 3

## Features

- 방 크기 입력과 템플릿 적용
- 기본 가구 추가와 커스텀 가구 시작점 제공
- 가구 선택, 드래그 이동, 90도 회전, 복사, 삭제
- 방 안의 하위 공간 추가와 베란다/주방/현관 구역 분리
- 벽 방향별 창문 위치와 길이 설정
- 가구 겹침 감지와 방 밖 이탈 감지
- 면적 요약과 상태 메시지
- 실행 취소 / 다시 실행
- localStorage 기반 배치안 저장 / 불러오기

## Run

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 열면 됩니다.

## Deploy to GitHub Pages

```bash
npm run deploy
```

`dist`가 빌드된 뒤 `gh-pages` 브랜치로 배포됩니다. GitHub 저장소의 Pages 설정에서 배포 소스를 `gh-pages` 브랜치로 지정하면 됩니다.
