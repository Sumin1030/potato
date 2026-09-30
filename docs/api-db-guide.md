# DB 작업 규칙

## 네이밍과 위치

- DB 작업 코드는 사용처 slice의 `api` segment에 둔다.
- 함수명은 생성 `create<Resource>()`, 조회 `get<Resource>()`, 수정 `update<Resource>()`, 삭제 `delete<Resource>()`로 짓는다.
- 파일명은 함수명에 대응하는 kebab-case를 사용한다: `create-<resource>.ts`, `get-<resource>.ts`, `update-<resource>.ts`, `delete-<resource>.ts`.
- 생성·수정·삭제 함수는 작업별로 분리하고 하나의 함수로 묶지 않는다.

## 서버 호출과 인스턴스 관리

- 서버 내부에서만 사용하는 조회 함수는 `import "server-only"`를 선언한다.
- 클라이언트에서 호출하는 함수는 조회·변경 여부와 관계없이 `"use server"`를 선언한 Server Action으로 제공한다.
- 일반 DB API는 호출 시 내부에서 `src/shared/lib/supabase-server.ts`의 `createSupabaseClient()`를 호출한다.
- 로그인·로그아웃 등 인증 세션 처리는 `createSessionClient()`를 사용한다. 대상 계정 인증 등 별도 세션이 필요한 작업은 현재 사용자 세션과 분리한다.
- Supabase 인스턴스를 API 인자로 전달하거나 요청 간 공유하지 않는다.
- 클라이언트는 요청 데이터만 전달하고 Supabase 인스턴스를 생성하거나 전달하지 않는다.

## 인증과 입력 검증

- 클라이언트에서 호출 가능한 서버 함수는 작업에 필요한 인증·권한과 입력값을 서버에서 검증한다. UI 검사나 메뉴 노출 여부만 신뢰하지 않는다.
- 검증 함수는 해당 slice의 `lib`에 두고 필요한 UI와 서버 함수에서 호출한다.
- UI 검증은 사용자 안내를 담당하며 서버 검증을 대체하지 않는다.

## 결과와 오류 처리

- DB 요청의 오류를 확인하고 실패를 성공으로 반환하지 않는다.
- 정상적인 빈 조회 결과와 요청 실패를 구분한다.
- 변경 작업은 대상 행에 반영되었는지 확인한 뒤 성공으로 처리한다.
- 클라이언트에는 처리에 필요한 결과와 사용자용 오류 메시지만 전달하고 내부 오류 상세는 노출하지 않는다.
