# 프로젝트 구조

이 프로젝트는 Feature-Sliced Design(FSD)을 기반으로 구성한다.

## Next.js와 Views 레이어

Next.js는 `src/pages`를 Pages Router의 예약 디렉터리로 인식한다. FSD의 Pages 레이어와 Next.js 라우팅이 충돌하지 않도록 이 프로젝트에서는 Pages 레이어의 이름을 `views`로 사용한다.

- Next.js 라우트는 `src/app`에서 관리한다.
- 화면 단위 UI는 `src/views`에서 관리한다.
- `src/pages` 디렉터리는 만들지 않는다.
- Next.js의 기본 라우팅 규칙이나 특수 파일명을 이 구조 때문에 변경하지 않는다.

## 레이어 구성

기본 구조는 다음과 같다.

```text
src/
├── app/
├── views/
│   └── <page>/
│       └── ui/
└── shared/
    ├── ui/
    ├── lib/
    └── styles/
```

`views`만 페이지별 slice를 가진다. 각 페이지 slice 안에는 `ui` 같은 segment를 둔다.

```text
views/
└── main/
    └── ui/
        ├── Main.tsx
        └── MainHeader.tsx
```

`views` 이외의 레이어는 별도 slice를 만들지 않고 레이어 바로 아래에 `ui`, `lib`, `styles` 같은 segment를 둔다.

```text
shared/
├── ui/
├── lib/
└── styles/
```

## 페이지 전용 컴포넌트

- 특정 페이지에서만 사용하고 다른 페이지에서 재사용하지 않는 컴포넌트는 해당 `views` slice의 `ui` segment에 둔다.
- 페이지 전용 하위 컴포넌트를 임의로 다른 레이어에 분리하지 않는다.
- 실제로 여러 페이지에서 재사용할 필요가 확인된 경우에만 적절한 공통 위치로 이동한다.

## 아이콘 에셋

- UI에서 사용하는 아이콘 파일은 모두 `public/assets`에 둔다.
- 아이콘 수가 적은 동안에는 `public/assets` 바로 아래에서 관리하고, 페이지나 기능별 하위 디렉터리를 미리 만들지 않는다.
- 아이콘 수가 많아져 탐색이나 이름 관리가 어려워지면 AI가 구조를 임의로 변경하지 않고, 분류 기준과 변경될 경로를 먼저 제안한다.
- `src/app/favicon.ico`처럼 Next.js가 특수 파일로 처리하는 라우팅 메타데이터는 UI 아이콘 에셋 규칙에서 제외한다.

## Features 레이어

- 컴포넌트나 로직을 `features` 레이어로 내리는 작업은 사용자가 명시적으로 요청한 경우에만 한다.
- AI가 기능의 성격이나 재사용 가능성을 자체적으로 판단해 `features`를 만들거나 코드를 이동하지 않는다.
- 사용자의 요청이 없으면 기능 관련 코드도 해당 `views` slice 안에 유지한다.

## Widgets 레이어

- 현재 프로젝트의 규모와 필요성을 고려하여 `widgets` 레이어는 사용하지 않는다.
- 여러 컴포넌트를 조합한 큰 UI 블록도 별도의 `widgets`로 이동하지 않고 해당 `views` slice 안에 둔다.
- 프로젝트 규모가 바뀌더라도 사용자의 명시적인 요청 없이 `widgets` 레이어를 추가하지 않는다.
