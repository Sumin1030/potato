# DB 작업 규칙

## 네이밍과 위치

- DB 작업 코드는 사용처 slice의 `api` segment에 둔다.
- 함수명은 작업에 따라 생성 `create<Resource>()`, 조회 `get<Resource>()`, 수정 `update<Resource>()`, 삭제 `delete<Resource>()`로 짓는다.
- 파일명은 함수명에 대응하는 kebab-case를 사용한다: `create-<resource>.ts`, `get-<resource>.ts`, `update-<resource>.ts`, `delete-<resource>.ts`.
- 생성·수정·삭제 함수는 작업별로 분리하고 하나의 함수로 묶지 않는다.

## Supabase 인스턴스 관리

- 각 API 함수는 호출될 때 내부에서 `src/shared/lib/supabase-server.ts`의 `createSupabaseClient()`를 호출해 인스턴스를 생성한다.
- Supabase 인스턴스를 API 인자로 전달받거나 요청 간 공유하지 않는다.
- 조회 API는 `import "server-only"`를 선언하고 서버에서 호출한다.
- 생성·수정·삭제 API는 `"use server"`를 선언하고 클라이언트에서 직접 import하여 호출한다.
- 클라이언트는 요청 데이터만 전달하며 Supabase 인스턴스를 생성하거나 전달하지 않는다.
