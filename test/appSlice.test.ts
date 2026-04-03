import { describe, expect, it } from 'vitest';
import appReducer, { appActions, initialState, type AppState } from '../src/model/appSlice';
import { Filter } from '../src/model/Filter';

// ─── Model 테스트 ─────────────────────────────────────────────────────────────
// Redux slice reducer 가 순수 함수이므로 정확하고 예측 가능하게 테스트할 수 있습니다.
// 각 Action에 대해 "입력 상태 + 액션 → 기대하는 상태"를 검증합니다.

describe('appSlice', () => {
    // ━━━ addTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('addTodo', () => {
        it('빈 할일 목록에 새 할일을 추가하면 id가 1부터 시작한다', () => {
            const state: AppState = { todos: [], filter: Filter.ALL };
            const nextState = appReducer(state, appActions.addTodo('첫 번째 할일'));

            expect(nextState.todos).toHaveLength(1);
            expect(nextState.todos[0]).toEqual({
                id: 1,
                text: '첫 번째 할일',
                completed: false,
            });
        });

        it('할일이 있을 때 새 할일 추가하면 마지막 id + 1이 된다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.addTodo('새 할일'));

            expect(nextState.todos).toHaveLength(3);
            expect(nextState.todos[2].id).toBe(3);
            expect(nextState.todos[2].text).toBe('새 할일');
            expect(nextState.todos[2].completed).toBe(false);
        });

        it('원본 상태를 변경하지 않는다 (불변성)', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Original', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.addTodo('새 할일'));

            expect(state.todos).toHaveLength(1);
            expect(nextState).not.toBe(state);
            expect(nextState.todos).not.toBe(state.todos);
        });
    });

    // ━━━ deleteTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteTodo', () => {
        it('특정 id의 할일을 삭제한다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteTodo(2));

            expect(nextState.todos).toHaveLength(2);
            expect(nextState.todos.map((t) => t.id)).toEqual([1, 3]);
        });

        it('존재하지 않는 id는 상태에 영향을 주지 않는다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteTodo(999));

            expect(nextState.todos).toHaveLength(1);
            expect(nextState.todos[0].id).toBe(1);
        });

        it('마지막 할일을 삭제하면 목록이 비워진다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteTodo(1));

            expect(nextState.todos).toHaveLength(0);
        });
    });

    // ━━━ toggleTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleTodo', () => {
        it('특정 id의 완료 상태를 반전한다 (false → true)', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleTodo(1));

            expect(nextState.todos[0].completed).toBe(true);
            expect(nextState.todos[0].text).toBe('Todo 1');
        });

        it('특정 id의 완료 상태를 반전한다 (true → false)', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo 1', completed: true }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleTodo(1));

            expect(nextState.todos[0].completed).toBe(false);
        });

        it('다른 할일들은 영향을 받지 않는다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                    { id: 3, text: 'Todo 3', completed: true },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleTodo(2));

            expect(nextState.todos[0].completed).toBe(false);
            expect(nextState.todos[1].completed).toBe(true);
            expect(nextState.todos[2].completed).toBe(true);
        });
    });

    // ━━━ editTodo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('editTodo', () => {
        it('특정 id의 텍스트를 수정한다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: '원본 텍스트', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.editTodo({ id: 1, newText: '수정된 텍스트' }));

            expect(nextState.todos[0].text).toBe('수정된 텍스트');
            expect(nextState.todos[0].completed).toBe(false);
        });

        it('빈 문자열로 수정할 수 있다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.editTodo({ id: 1, newText: '' }));

            expect(nextState.todos[0].text).toBe('');
        });

        it('다른 할일들은 영향을 받지 않는다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.editTodo({ id: 1, newText: '수정됨' }));

            expect(nextState.todos[0].text).toBe('수정됨');
            expect(nextState.todos[1].text).toBe('Todo 2');
        });
    });

    // ━━━ toggleAll ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('toggleAll', () => {
        it('모든 할일을 완료로 설정할 수 있다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleAll(true));

            expect(nextState.todos.every((t) => t.completed)).toBe(true);
        });

        it('모든 할일을 미완료로 설정할 수 있다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: true },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleAll(false));

            expect(nextState.todos.every((t) => !t.completed)).toBe(true);
        });

        it('빈 목록에서도 동작한다', () => {
            const state: AppState = { todos: [], filter: Filter.ALL };
            const nextState = appReducer(state, appActions.toggleAll(true));

            expect(nextState.todos).toHaveLength(0);
        });

        it('모든 할일의 텍스트와 id는 변경되지 않는다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.toggleAll(true));

            expect(nextState.todos[0].id).toBe(1);
            expect(nextState.todos[0].text).toBe('Todo 1');
            expect(nextState.todos[1].id).toBe(2);
            expect(nextState.todos[1].text).toBe('Todo 2');
        });
    });

    // ━━━ deleteCompleted ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('deleteCompleted', () => {
        it('완료된 모든 할일을 삭제한다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                    { id: 4, text: 'Todo 4', completed: true },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteCompleted());

            expect(nextState.todos).toHaveLength(2);
            expect(nextState.todos.map((t) => t.id)).toEqual([1, 3]);
            expect(nextState.todos.every((t) => !t.completed)).toBe(true);
        });

        it('완료된 할일이 없으면 상태는 변경되지 않는다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteCompleted());

            expect(nextState.todos).toHaveLength(2);
        });

        it('모든 할일이 완료되면 목록이 비워진다', () => {
            const state: AppState = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: true },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.deleteCompleted());

            expect(nextState.todos).toHaveLength(0);
        });

        it('빈 목록에서도 안전하게 동작한다', () => {
            const state: AppState = { todos: [], filter: Filter.ALL };
            const nextState = appReducer(state, appActions.deleteCompleted());

            expect(nextState.todos).toHaveLength(0);
        });
    });

    // ━━━ changeFilter ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('changeFilter', () => {
        it("필터를 'all'로 변경한다", () => {
            const state: AppState = { todos: [], filter: Filter.ACTIVE };
            const nextState = appReducer(state, appActions.changeFilter(Filter.ALL));

            expect(nextState.filter).toBe(Filter.ALL);
        });

        it("필터를 'active'로 변경한다", () => {
            const state: AppState = { todos: [], filter: Filter.ALL };
            const nextState = appReducer(state, appActions.changeFilter(Filter.ACTIVE));

            expect(nextState.filter).toBe(Filter.ACTIVE);
        });

        it("필터를 'completed'로 변경한다", () => {
            const state: AppState = { todos: [], filter: Filter.ALL };
            const nextState = appReducer(state, appActions.changeFilter(Filter.COMPLETED));

            expect(nextState.filter).toBe(Filter.COMPLETED);
        });

        it('필터 변경은 할일 목록에 영향을 주지 않는다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.changeFilter(Filter.ACTIVE));

            expect(nextState.todos).toEqual(state.todos);
        });
    });

    // ━━━ 복합 시나리오 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('복합 시나리오', () => {
        it('여러 액션을 순차적으로 실행해도 상태가 일관성 있게 유지된다', () => {
            let state = initialState;

            // 1단계: 할일 2개 추가
            state = appReducer(state, appActions.addTodo('새 할일 1'));
            state = appReducer(state, appActions.addTodo('새 할일 2'));
            expect(state.todos).toHaveLength(5); // 초기 3개 + 2개

            // 2단계: 첫 번째 새 할일 완료 표시
            const lastTodoId = state.todos[state.todos.length - 2].id;
            state = appReducer(state, appActions.toggleTodo(lastTodoId));

            // 3단계: 필터 변경
            state = appReducer(state, appActions.changeFilter(Filter.ACTIVE));
            expect(state.filter).toBe(Filter.ACTIVE);

            // 4단계: 완료된 할일 삭제
            state = appReducer(state, appActions.deleteCompleted());

            // 최종 검증
            expect(state.todos.length).toBeGreaterThan(0);
            expect(state.filter).toBe(Filter.ACTIVE);
        });

        it('초기 상태에서 모든 액션을 실행할 수 있다', () => {
            let state = initialState;

            state = appReducer(state, appActions.addTodo('Test'));
            state = appReducer(state, appActions.toggleTodo(1));
            state = appReducer(state, appActions.editTodo({ id: 1, newText: 'Edited' }));
            state = appReducer(state, appActions.toggleAll(false));
            state = appReducer(state, appActions.deleteCompleted());
            state = appReducer(state, appActions.changeFilter(Filter.ALL));

            expect(state.todos).toBeDefined();
            expect(state.filter).toBeDefined();
        });
    });

    // ━━━ 불변성 검증 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('불변성 (Immutability)', () => {
        it('모든 액션은 새로운 State 객체를 반환한다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };

            const state1 = appReducer(state, appActions.addTodo('New'));
            const state2 = appReducer(state, appActions.toggleTodo(1));
            const state3 = appReducer(state, appActions.changeFilter(Filter.ACTIVE));

            expect(state1).not.toBe(state);
            expect(state2).not.toBe(state);
            expect(state3).not.toBe(state);

            expect(state.todos).toHaveLength(1);
            expect(state.filter).toBe(Filter.ALL);
        });

        it('todos 배열 수정은 새로운 배열을 생성한다', () => {
            const state: AppState = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };
            const nextState = appReducer(state, appActions.addTodo('New'));

            expect(nextState.todos).not.toBe(state.todos);
        });
    });
});
