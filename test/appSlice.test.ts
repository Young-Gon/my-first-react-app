import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import appReducer, { appActions, initialState } from '../src/model/appSlice';
import { todosApi } from '../src/api/todosApi';
import { Filter } from '../src/model/Filter';
import type { Todo } from '../src/model/Todo';

// ─── 테스트 전략 ──────────────────────────────────────────────────────────────
// appSlice: todos/loading/error 가 RTK Query 캐시로 이동했으므로
//           filter 상태와 changeFilter 액션만 reducer 단에서 검증합니다.
//
// todosApi:  fetchBaseQuery 는 fetch(Request) 형태로 단일 Request 객체를 전달합니다.
//            fetch 를 mockImplementation 으로 교체해 Request 의 url·method·body 를
//            캡처하고 실제 HTTP 요청 없이 엔드포인트 로직을 검증합니다.

// ─── 테스트 Store ─────────────────────────────────────────────────────────────
function createTestStore() {
    return configureStore({
        reducer: {
            app: appReducer,
            [todosApi.reducerPath]: todosApi.reducer,
        },
        middleware: (gDM) => gDM().concat(todosApi.middleware),
    });
}

// ─── fetch Mock 헬퍼 ──────────────────────────────────────────────────────────
// fetchBaseQuery 는 fetch(Request) 를 사용하므로, Request 객체를 clone 해 두면
// body 가 소비된 뒤에도 url·method·body 를 읽을 수 있습니다.
interface CapturedRequest {
    url: string;
    method: string;
    body: unknown;
}

function mockFetch(...bodies: unknown[]): CapturedRequest[] {
    const captured: CapturedRequest[] = [];
    let idx = 0;
    global.fetch = vi.fn().mockImplementation(async (req: Request) => {
        let parsedBody: unknown = undefined;
        try { parsedBody = await req.clone().json(); } catch { /* body 없음 */ }
        captured.push({ url: req.url, method: req.method, body: parsedBody });
        return new Response(JSON.stringify(bodies[idx++] ?? {}), { status: 200 });
    });
    return captured;
}

// ─── 공통 픽스처 ──────────────────────────────────────────────────────────────
const sampleTodos: Todo[] = [
    { id: 1, text: 'Todo 1', completed: false },
    { id: 2, text: 'Todo 2', completed: true },
    { id: 3, text: 'Todo 3', completed: false },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// appSlice — filter 상태 전용
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('appSlice', () => {

    describe('초기 상태', () => {
        it('filter 기본값은 ALL 이다', () => {
            expect(initialState.filter).toBe(Filter.ALL);
        });
    });

    // ━━━ changeFilter ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('changeFilter', () => {
        it("필터를 'active'로 변경한다", () => {
            const next = appReducer(initialState, appActions.changeFilter(Filter.ACTIVE));
            expect(next.filter).toBe(Filter.ACTIVE);
        });

        it("필터를 'completed'로 변경한다", () => {
            const next = appReducer(initialState, appActions.changeFilter(Filter.COMPLETED));
            expect(next.filter).toBe(Filter.COMPLETED);
        });

        it("필터를 'all'로 복원한다", () => {
            const state = { filter: Filter.ACTIVE };
            const next = appReducer(state, appActions.changeFilter(Filter.ALL));
            expect(next.filter).toBe(Filter.ALL);
        });

        it('changeFilter는 새로운 State 객체를 반환한다 (불변성)', () => {
            const state = { ...initialState };
            const next = appReducer(state, appActions.changeFilter(Filter.ACTIVE));
            expect(next).not.toBe(state);
            expect(state.filter).toBe(Filter.ALL);
        });
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// todosApi — RTK Query 엔드포인트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('todosApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // ━━━ getTodos ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('getTodos', () => {
        it('GET /todos 를 호출해 결과를 캐시에 저장한다', async () => {
            mockFetch(sampleTodos);
            const store = createTestStore();

            await store.dispatch(todosApi.endpoints.getTodos.initiate());

            const cached = todosApi.endpoints.getTodos.select()(store.getState());
            expect(cached.isSuccess).toBe(true);
            expect(cached.data).toEqual(sampleTodos);
        });

        it('빈 배열도 정상 처리한다', async () => {
            mockFetch([]);
            const store = createTestStore();

            await store.dispatch(todosApi.endpoints.getTodos.initiate());

            const cached = todosApi.endpoints.getTodos.select()(store.getState());
            expect(cached.data).toEqual([]);
        });
    });

    // ━━━ addTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('addTodo', () => {
        it('POST /todos 를 호출하고 서버가 반환한 todo를 결과로 받는다', async () => {
            const newTodo: Todo = { id: 4, text: '새 할일', completed: false };
            const captured = mockFetch(newTodo);
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.addTodo.initiate('새 할일')
            );

            expect(result.data).toEqual(newTodo);
            expect(captured[0].url).toContain('/todos');
            expect(captured[0].method).toBe('POST');
        });

        it('body에 text와 completed: false 가 포함된다', async () => {
            const newTodo: Todo = { id: 4, text: '새 할일', completed: false };
            const captured = mockFetch(newTodo);
            const store = createTestStore();

            await store.dispatch(todosApi.endpoints.addTodo.initiate('새 할일'));

            expect(captured[0].body).toEqual({ text: '새 할일', completed: false });
        });
    });

    // ━━━ deleteTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteTodo', () => {
        it('DELETE /todos/:id 를 호출한다', async () => {
            const captured = mockFetch({});
            const store = createTestStore();

            await store.dispatch(todosApi.endpoints.deleteTodo.initiate(2));

            expect(captured[0].url).toContain('/todos/2');
            expect(captured[0].method).toBe('DELETE');
        });
    });

    // ━━━ editTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('editTodo', () => {
        it('PUT /todos/:id 를 호출하고 수정된 todo를 반환한다', async () => {
            const updated: Todo = { id: 1, text: '수정된 텍스트', completed: false };
            const captured = mockFetch(updated);
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.editTodo.initiate({ id: 1, newText: '수정된 텍스트' })
            );

            expect(result.data).toEqual(updated);
            expect(captured[0].url).toContain('/todos/1');
            expect(captured[0].method).toBe('PUT');
        });
    });

    // ━━━ toggleTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleTodo', () => {
        it('캐시의 completed 값을 반전해 PATCH 요청한다 (false → true)', async () => {
            const toggled: Todo = { ...sampleTodos[0], completed: true };
            // 호출 순서: ① getTodos, ② toggleTodo PATCH, ③ invalidation 후 getTodos 재fetch
            const captured = mockFetch(sampleTodos, toggled, sampleTodos);
            const store = createTestStore();

            await store.dispatch(todosApi.endpoints.getTodos.initiate());
            // id=1 은 completed=false → true 로 반전
            const result = await store.dispatch(todosApi.endpoints.toggleTodo.initiate(1));

            expect(result.data).toEqual(toggled);
            const patchReq = captured.find(r => r.method === 'PATCH' && r.url.includes('/todos/1'));
            expect(patchReq).toBeDefined();
            expect((patchReq!.body as { completed: boolean }).completed).toBe(true);
        });

        it('캐시에 없는 id면 에러를 반환한다', async () => {
            mockFetch([]);
            const store = createTestStore();
            await store.dispatch(todosApi.endpoints.getTodos.initiate());

            const result = await store.dispatch(todosApi.endpoints.toggleTodo.initiate(999));

            expect(result.error).toBeDefined();
        });
    });

    // ━━━ toggleTodoAll ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleTodoAll', () => {
        it('todos 배열 각 항목에 병렬로 PATCH 요청을 보낸다', async () => {
            const allCompleted = sampleTodos.map(t => ({ ...t, completed: true }));
            const captured = mockFetch(...allCompleted);
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.toggleTodoAll.initiate({ todos: sampleTodos, completed: true })
            );

            expect(result.data).toEqual(allCompleted);
            const patchReqs = captured.filter(r => r.method === 'PATCH');
            expect(patchReqs).toHaveLength(sampleTodos.length);
        });

        it('빈 배열이면 fetch를 호출하지 않는다', async () => {
            const captured = mockFetch();
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.toggleTodoAll.initiate({ todos: [], completed: true })
            );

            expect(result.data).toEqual([]);
            expect(captured).toHaveLength(0);
        });
    });

    // ━━━ deleteCompletedTodos ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteCompletedTodos', () => {
        it('completedIds 각각에 병렬로 DELETE 요청을 보낸다', async () => {
            const completedIds = [2];
            const captured = mockFetch(...completedIds.map(() => ({})));
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.deleteCompletedTodos.initiate(completedIds)
            );

            expect(result.error).toBeUndefined();
            const deleteReqs = captured.filter(r => r.method === 'DELETE');
            expect(deleteReqs).toHaveLength(completedIds.length);
        });

        it('여러 항목도 모두 DELETE 요청한다', async () => {
            const completedIds = [1, 2, 3];
            const captured = mockFetch(...completedIds.map(() => ({})));
            const store = createTestStore();

            await store.dispatch(
                todosApi.endpoints.deleteCompletedTodos.initiate(completedIds)
            );

            const deleteReqs = captured.filter(r => r.method === 'DELETE');
            expect(deleteReqs).toHaveLength(3);
        });

        it('빈 배열이면 fetch를 호출하지 않는다', async () => {
            const captured = mockFetch();
            const store = createTestStore();

            const result = await store.dispatch(
                todosApi.endpoints.deleteCompletedTodos.initiate([])
            );

            expect(result.error).toBeUndefined();
            expect(captured).toHaveLength(0);
        });
    });
});
