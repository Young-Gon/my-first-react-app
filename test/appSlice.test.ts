import { describe, expect, it } from 'vitest';
import appReducer, { appActions, initialState, type AppState } from '../src/model/appSlice';
import { addTodo, deleteTodo, deleteCompletedTodos, editTodo, fetchTodos, toggleTodo, toggleTodoAll } from '../src/api/fetchTodos';
import { Filter } from '../src/model/Filter';

// ─── 테스트 전략 ──────────────────────────────────────────────────────────────
// 모든 CRUD는 비동기 thunk로 처리되므로, API를 호출하지 않고
// RTK의 action creator(pending/fulfilled/rejected)를 직접 생성해 reducer 로직만 검증합니다.
// thunk 내부 로직(getState, API 호출)은 별도 통합 테스트 영역입니다.

const baseState = (): AppState => ({
    todos: [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: true },
        { id: 3, text: 'Todo 3', completed: false },
    ],
    filter: Filter.ALL,
    loading: false,
    error: null,
});

describe('appSlice', () => {

    // ━━━ loading / error 공통 패턴 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('loading / error 상태 전환', () => {
        it('pending 시 loading이 true가 된다', () => {
            const actions = [
                fetchTodos.pending('', undefined),
                addTodo.pending('', ''),
                deleteTodo.pending('', 0),
                editTodo.pending('', { id: 1, newText: '' }),
                toggleTodo.pending('', 0),
                toggleTodoAll.pending('', true),
                deleteCompletedTodos.pending('', undefined),
            ];
            actions.forEach(action => {
                const next = appReducer(initialState, action);
                expect(next.loading, `${action.type} should set loading true`).toBe(true);
            });
        });

        it('rejected 시 loading이 false가 되고 error가 기록된다', () => {
            const loadingState: AppState = { ...initialState, loading: true };
            const error = new Error('네트워크 오류');

            const actions = [
                fetchTodos.rejected(error, ''),
                addTodo.rejected(error, '', ''),
                deleteTodo.rejected(error, '', 0),
                editTodo.rejected(error, '', { id: 1, newText: '' }),
                toggleTodo.rejected(error, '', 0),
                toggleTodoAll.rejected(error, '', true),
                deleteCompletedTodos.rejected(error, '', undefined),
            ];
            actions.forEach(action => {
                const next = appReducer(loadingState, action);
                expect(next.loading, `${action.type} should set loading false`).toBe(false);
                expect(next.error, `${action.type} should set error`).toBe('네트워크 오류');
            });
        });
    });

    // ━━━ fetchTodos ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('fetchTodos', () => {
        it('fulfilled 시 todos 목록이 교체된다', () => {
            const fetched = [
                { id: 10, text: 'Fetched 1', completed: false },
                { id: 11, text: 'Fetched 2', completed: true },
            ];
            const action = fetchTodos.fulfilled(fetched, '');
            const next = appReducer(baseState(), action);

            expect(next.todos).toEqual(fetched);
            expect(next.loading).toBe(false);
        });

        it('fulfilled 시 빈 배열이면 todos가 비워진다', () => {
            const action = fetchTodos.fulfilled([], '');
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(0);
        });
    });

    // ━━━ addTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('addTodo', () => {
        it('fulfilled 시 서버에서 반환한 todo가 목록에 추가된다', () => {
            const newTodo = { id: 4, text: '새 할일', completed: false };
            const action = addTodo.fulfilled(newTodo, '', '새 할일');
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(4);
            expect(next.todos[3]).toEqual(newTodo);
            expect(next.loading).toBe(false);
        });

        it('빈 목록에도 추가할 수 있다', () => {
            const newTodo = { id: 1, text: '첫 할일', completed: false };
            const action = addTodo.fulfilled(newTodo, '', '첫 할일');
            const next = appReducer(initialState, action);

            expect(next.todos).toHaveLength(1);
            expect(next.todos[0]).toEqual(newTodo);
        });
    });

    // ━━━ deleteTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteTodo', () => {
        it('fulfilled 시 해당 id의 todo가 제거된다', () => {
            const action = deleteTodo.fulfilled(2, '', 2);
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(2);
            expect(next.todos.map(t => t.id)).toEqual([1, 3]);
            expect(next.loading).toBe(false);
        });

        it('존재하지 않는 id면 목록에 변화가 없다', () => {
            const action = deleteTodo.fulfilled(999, '', 999);
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(3);
        });

        it('마지막 항목을 삭제하면 목록이 비워진다', () => {
            const state: AppState = {
                ...initialState,
                todos: [{ id: 1, text: 'Only', completed: false }],
            };
            const action = deleteTodo.fulfilled(1, '', 1);
            const next = appReducer(state, action);

            expect(next.todos).toHaveLength(0);
        });
    });

    // ━━━ editTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('editTodo', () => {
        it('fulfilled 시 해당 todo가 서버 응답값으로 교체된다', () => {
            const updated = { id: 1, text: '수정된 텍스트', completed: false };
            const action = editTodo.fulfilled(updated, '', { id: 1, newText: '수정된 텍스트' });
            const next = appReducer(baseState(), action);

            expect(next.todos[0]).toEqual(updated);
            expect(next.todos).toHaveLength(3);
            expect(next.loading).toBe(false);
        });

        it('다른 todo들은 영향을 받지 않는다', () => {
            const updated = { id: 2, text: '수정됨', completed: true };
            const action = editTodo.fulfilled(updated, '', { id: 2, newText: '수정됨' });
            const next = appReducer(baseState(), action);

            expect(next.todos[0].text).toBe('Todo 1');
            expect(next.todos[2].text).toBe('Todo 3');
        });
    });

    // ━━━ toggleTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleTodo', () => {
        it('fulfilled 시 해당 todo가 서버 응답값으로 교체된다 (false → true)', () => {
            const toggled = { id: 1, text: 'Todo 1', completed: true };
            const action = toggleTodo.fulfilled(toggled, '', 1);
            const next = appReducer(baseState(), action);

            expect(next.todos[0].completed).toBe(true);
            expect(next.loading).toBe(false);
        });

        it('fulfilled 시 해당 todo가 서버 응답값으로 교체된다 (true → false)', () => {
            const toggled = { id: 2, text: 'Todo 2', completed: false };
            const action = toggleTodo.fulfilled(toggled, '', 2);
            const next = appReducer(baseState(), action);

            expect(next.todos[1].completed).toBe(false);
        });

        it('다른 todo들은 영향을 받지 않는다', () => {
            const toggled = { id: 1, text: 'Todo 1', completed: true };
            const action = toggleTodo.fulfilled(toggled, '', 1);
            const next = appReducer(baseState(), action);

            expect(next.todos[1].completed).toBe(true);
            expect(next.todos[2].completed).toBe(false);
        });
    });

    // ━━━ toggleTodoAll ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleTodoAll', () => {
        it('fulfilled 시 서버 응답값으로 모든 todo가 업데이트된다 (전체 완료)', () => {
            const allCompleted = baseState().todos.map(t => ({ ...t, completed: true }));
            const action = toggleTodoAll.fulfilled(allCompleted, '', true);
            const next = appReducer(baseState(), action);

            expect(next.todos.every(t => t.completed)).toBe(true);
            expect(next.loading).toBe(false);
        });

        it('fulfilled 시 서버 응답값으로 모든 todo가 업데이트된다 (전체 미완료)', () => {
            const allActive = baseState().todos.map(t => ({ ...t, completed: false }));
            const action = toggleTodoAll.fulfilled(allActive, '', false);
            const next = appReducer(baseState(), action);

            expect(next.todos.every(t => !t.completed)).toBe(true);
        });

        it('빈 목록에서도 안전하게 동작한다', () => {
            const action = toggleTodoAll.fulfilled([], '', true);
            const next = appReducer(initialState, action);

            expect(next.todos).toHaveLength(0);
        });

        it('id와 text는 변경되지 않는다', () => {
            const allCompleted = baseState().todos.map(t => ({ ...t, completed: true }));
            const action = toggleTodoAll.fulfilled(allCompleted, '', true);
            const next = appReducer(baseState(), action);

            expect(next.todos[0].id).toBe(1);
            expect(next.todos[0].text).toBe('Todo 1');
        });
    });

    // ━━━ deleteCompletedTodos ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteCompletedTodos', () => {
        it('fulfilled 시 반환된 id 목록에 해당하는 todo가 제거된다', () => {
            const action = deleteCompletedTodos.fulfilled([2], '', undefined);
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(2);
            expect(next.todos.map(t => t.id)).toEqual([1, 3]);
            expect(next.loading).toBe(false);
        });

        it('완료된 항목이 여러 개면 모두 제거된다', () => {
            const state: AppState = {
                ...initialState,
                todos: [
                    { id: 1, text: 'Todo 1', completed: true },
                    { id: 2, text: 'Todo 2', completed: false },
                    { id: 3, text: 'Todo 3', completed: true },
                ],
            };
            const action = deleteCompletedTodos.fulfilled([1, 3], '', undefined);
            const next = appReducer(state, action);

            expect(next.todos).toHaveLength(1);
            expect(next.todos[0].id).toBe(2);
        });

        it('빈 id 배열이면 목록에 변화가 없다', () => {
            const action = deleteCompletedTodos.fulfilled([], '', undefined);
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(3);
        });

        it('모든 항목이 삭제되면 목록이 비워진다', () => {
            const action = deleteCompletedTodos.fulfilled([1, 2, 3], '', undefined);
            const next = appReducer(baseState(), action);

            expect(next.todos).toHaveLength(0);
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

        it("필터를 'all'로 변경한다", () => {
            const state: AppState = { ...initialState, filter: Filter.ACTIVE };
            const next = appReducer(state, appActions.changeFilter(Filter.ALL));
            expect(next.filter).toBe(Filter.ALL);
        });

        it('필터 변경은 todos와 loading에 영향을 주지 않는다', () => {
            const state = baseState();
            const next = appReducer(state, appActions.changeFilter(Filter.ACTIVE));

            expect(next.todos).toEqual(state.todos);
            expect(next.loading).toBe(false);
        });
    });

    // ━━━ 불변성 검증 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('불변성 (Immutability)', () => {
        it('fulfilled 액션은 새로운 State 객체를 반환한다', () => {
            const state = baseState();
            const newTodo = { id: 4, text: 'New', completed: false };

            const next = appReducer(state, addTodo.fulfilled(newTodo, '', 'New'));

            expect(next).not.toBe(state);
            expect(next.todos).not.toBe(state.todos);
            expect(state.todos).toHaveLength(3);
        });

        it('changeFilter는 새로운 State 객체를 반환한다', () => {
            const state = baseState();
            const next = appReducer(state, appActions.changeFilter(Filter.ACTIVE));

            expect(next).not.toBe(state);
            expect(state.filter).toBe(Filter.ALL);
        });
    });
});
