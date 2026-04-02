import { describe, expect, it } from 'vitest';
import { initialState, reducer, type Action, type State } from '../src/model/appReducer';
import { Filter } from '../src/model/Filter';

// ─── Model 테스트 ─────────────────────────────────────────────────────────────
// reducer 함수가 순수 함수이므로 정확하고 예측 가능하게 테스트할 수 있습니다.
// 각 Action에 대해 "입력 상태 + 액션 → 기대하는 상태"를 검증합니다.

describe('appReducer', () => {
    // ━━━ ADD_TODO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('ADD_TODO', () => {
        it('빈 할일 목록에 새 할일을 추가하면 id가 1부터 시작한다', () => {
            const state: State = { todos: [], filter: Filter.ALL };
            const action: Action = { type: 'ADD_TODO', text: '첫 번째 할일' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(1);
            expect(nextState.todos[0]).toEqual({
                id: 1,
                text: '첫 번째 할일',
                completed: false,
            });
        });

        it('할일이 있을 때 새 할일 추가하면 마지막 id + 1이 된다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'ADD_TODO', text: '새 할일' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(3);
            expect(nextState.todos[2].id).toBe(3);
            expect(nextState.todos[2].text).toBe('새 할일');
            expect(nextState.todos[2].completed).toBe(false);
        });

        it('원본 상태를 변경하지 않는다 (불변성)', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Original', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'ADD_TODO', text: '새 할일' };

            const nextState = reducer(state, action);

            // 원본 상태는 변경되지 않아야 함
            expect(state.todos).toHaveLength(1);
            // 새로운 상태 객체여야 함
            expect(nextState).not.toBe(state);
            expect(nextState.todos).not.toBe(state.todos);
        });
    });

    // ━━━ DELETE_TODO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('DELETE_TODO', () => {
        it('특정 id의 할일을 삭제한다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_TODO', id: 2 };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(2);
            expect(nextState.todos.map(t => t.id)).toEqual([1, 3]);
        });

        it('존재하지 않는 id는 상태에 영향을 주지 않는다', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_TODO', id: 999 };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(1);
            expect(nextState.todos[0].id).toBe(1);
        });

        it('마지막 할일을 삭제하면 목록이 비워진다', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_TODO', id: 1 };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(0);
        });
    });

    // ━━━ TOGGLE_TODO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('TOGGLE_TODO', () => {
        it('특정 id의 완료 상태를 반전한다 (false → true)', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo 1', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_TODO', id: 1 };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].completed).toBe(true);
            expect(nextState.todos[0].text).toBe('Todo 1'); // 다른 필드는 변경 안 됨
        });

        it('특정 id의 완료 상태를 반전한다 (true → false)', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo 1', completed: true }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_TODO', id: 1 };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].completed).toBe(false);
        });

        it('다른 할일들은 영향을 받지 않는다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                    { id: 3, text: 'Todo 3', completed: true },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_TODO', id: 2 };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].completed).toBe(false); // 변경 안 됨
            expect(nextState.todos[1].completed).toBe(true);  // 변경됨
            expect(nextState.todos[2].completed).toBe(true);  // 변경 안 됨
        });
    });

    // ━━━ EDIT_TODO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('EDIT_TODO', () => {
        it('특정 id의 텍스트를 수정한다', () => {
            const state: State = {
                todos: [{ id: 1, text: '원본 텍스트', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'EDIT_TODO', id: 1, newText: '수정된 텍스트' };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].text).toBe('수정된 텍스트');
            expect(nextState.todos[0].completed).toBe(false); // 다른 필드는 변경 안 됨
        });

        it('빈 문자열로 수정할 수 있다', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'EDIT_TODO', id: 1, newText: '' };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].text).toBe('');
        });

        it('다른 할일들은 영향을 받지 않는다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'EDIT_TODO', id: 1, newText: '수정됨' };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].text).toBe('수정됨');
            expect(nextState.todos[1].text).toBe('Todo 2'); // 변경 안 됨
        });
    });

    // ━━━ TOGGLE_ALL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('TOGGLE_ALL', () => {
        it('모든 할일을 완료로 설정할 수 있다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_ALL', completed: true };

            const nextState = reducer(state, action);

            expect(nextState.todos.every(t => t.completed)).toBe(true);
        });

        it('모든 할일을 미완료로 설정할 수 있다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: true },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_ALL', completed: false };

            const nextState = reducer(state, action);

            expect(nextState.todos.every(t => !t.completed)).toBe(true);
        });

        it('빈 목록에서도 동작한다', () => {
            const state: State = { todos: [], filter: Filter.ALL };
            const action: Action = { type: 'TOGGLE_ALL', completed: true };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(0);
        });

        it('모든 할일의 텍스트와 id는 변경되지 않는다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'TOGGLE_ALL', completed: true };

            const nextState = reducer(state, action);

            expect(nextState.todos[0].id).toBe(1);
            expect(nextState.todos[0].text).toBe('Todo 1');
            expect(nextState.todos[1].id).toBe(2);
            expect(nextState.todos[1].text).toBe('Todo 2');
        });
    });

    // ━━━ DELETE_COMPLETED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('DELETE_COMPLETED', () => {
        it('완료된 모든 할일을 삭제한다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: true },
                    { id: 3, text: 'Todo 3', completed: false },
                    { id: 4, text: 'Todo 4', completed: true },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_COMPLETED' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(2);
            expect(nextState.todos.map(t => t.id)).toEqual([1, 3]);
            expect(nextState.todos.every(t => !t.completed)).toBe(true);
        });

        it('완료된 할일이 없으면 상태는 변경되지 않는다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: false },
                    { id: 2, text: 'Todo 2', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_COMPLETED' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(2);
        });

        it('모든 할일이 완료되면 목록이 비워진다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo 1', completed: true },
                    { id: 2, text: 'Todo 2', completed: true },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'DELETE_COMPLETED' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(0);
        });

        it('빈 목록에서도 안전하게 동작한다', () => {
            const state: State = { todos: [], filter: Filter.ALL };
            const action: Action = { type: 'DELETE_COMPLETED' };

            const nextState = reducer(state, action);

            expect(nextState.todos).toHaveLength(0);
        });
    });

    // ━━━ CHANGE_FILTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('CHANGE_FILTER', () => {
        it("필터를 'all'로 변경한다", () => {
            const state: State = {
                todos: [],
                filter: Filter.ACTIVE,
            };
            const action: Action = { type: 'CHANGE_FILTER', filter: Filter.ALL };

            const nextState = reducer(state, action);

            expect(nextState.filter).toBe(Filter.ALL);
        });

        it("필터를 'active'로 변경한다", () => {
            const state: State = {
                todos: [],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'CHANGE_FILTER', filter: Filter.ACTIVE };

            const nextState = reducer(state, action);

            expect(nextState.filter).toBe(Filter.ACTIVE);
        });

        it("필터를 'completed'로 변경한다", () => {
            const state: State = {
                todos: [],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'CHANGE_FILTER', filter: Filter.COMPLETED };

            const nextState = reducer(state, action);

            expect(nextState.filter).toBe(Filter.COMPLETED);
        });

        it('필터 변경은 할일 목록에 영향을 주지 않는다', () => {
            const state: State = {
                todos: [
                    { id: 1, text: 'Todo', completed: false },
                ],
                filter: Filter.ALL,
            };
            const action: Action = { type: 'CHANGE_FILTER', filter: Filter.ACTIVE };

            const nextState = reducer(state, action);

            expect(nextState.todos).toEqual(state.todos);
        });
    });

    // ━━━ 복합 시나리오 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('복합 시나리오', () => {
        it('여러 액션을 순차적으로 실행해도 상태가 일관성 있게 유지된다', () => {
            let state = initialState;

            // 1단계: 할일 2개 추가
            state = reducer(state, { type: 'ADD_TODO', text: '새 할일 1' });
            state = reducer(state, { type: 'ADD_TODO', text: '새 할일 2' });
            expect(state.todos).toHaveLength(5); // 초기 3개 + 2개

            // 2단계: 첫 번째 새 할일 완료 표시
            const lastTodoId = state.todos[state.todos.length - 2].id;
            state = reducer(state, { type: 'TOGGLE_TODO', id: lastTodoId });

            // 3단계: 필터 변경
            state = reducer(state, { type: 'CHANGE_FILTER', filter: Filter.ACTIVE });
            expect(state.filter).toBe(Filter.ACTIVE);

            // 4단계: 완료된 할일 삭제
            state = reducer(state, { type: 'DELETE_COMPLETED' });

            // 최종 검증
            expect(state.todos.length).toBeGreaterThan(0);
            expect(state.filter).toBe(Filter.ACTIVE);
        });

        it('초기 상태에서 모든 액션을 실행할 수 있다', () => {
            let state = initialState;

            // 각 액션 타입을 실행
            state = reducer(state, { type: 'ADD_TODO', text: 'Test' });
            state = reducer(state, { type: 'TOGGLE_TODO', id: 1 });
            state = reducer(state, { type: 'EDIT_TODO', id: 1, newText: 'Edited' });
            state = reducer(state, { type: 'TOGGLE_ALL', completed: false });
            state = reducer(state, { type: 'DELETE_COMPLETED' });
            state = reducer(state, { type: 'CHANGE_FILTER', filter: Filter.ALL });

            // 모든 액션 실행 후에도 상태는 유효해야 함
            expect(state.todos).toBeDefined();
            expect(state.filter).toBeDefined();
        });
    });

    // ━━━ 불변성 검증 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    describe('불변성 (Immutability)', () => {
        it('모든 액션은 새로운 State 객체를 반환한다', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };

            const state1 = reducer(state, { type: 'ADD_TODO', text: 'New' });
            const state2 = reducer(state, { type: 'TOGGLE_TODO', id: 1 });
            const state3 = reducer(state, { type: 'CHANGE_FILTER', filter: Filter.ACTIVE });

            // 모두 새로운 객체여야 함
            expect(state1).not.toBe(state);
            expect(state2).not.toBe(state);
            expect(state3).not.toBe(state);

            // 원본은 변경되지 않아야 함
            expect(state.todos).toHaveLength(1);
            expect(state.filter).toBe(Filter.ALL);
        });

        it('todos 배열 수정은 새로운 배열을 생성한다', () => {
            const state: State = {
                todos: [{ id: 1, text: 'Todo', completed: false }],
                filter: Filter.ALL,
            };

            const nextState = reducer(state, { type: 'ADD_TODO', text: 'New' });

            expect(nextState.todos).not.toBe(state.todos);
        });
    });
});
