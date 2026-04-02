import { Filter } from './Filter';
import type { Todo } from './Todo';

// ─── Model ────────────────────────────────────────────────────────────────────
// 앱 전체의 상태를 하나의 불변 객체로 표현합니다.
// 모든 UI 는 이 State 를 읽어 렌더링되며, State 는 오직 reducer 를 통해서만 변경됩니다.
export interface State {
    todos: Todo[];
    filter: Filter;
}

export const initialState: State = {
    todos: [
        { id: 1, text: '할일 1', completed: false },
        { id: 2, text: '할일 2', completed: true },
        { id: 3, text: '할일 3', completed: false },
    ],
    filter: Filter.ALL,
};

// ─── Intent ───────────────────────────────────────────────────────────────────
// 사용자가 할 수 있는 모든 의도(Intent)를 discriminated union 으로 정의합니다.
// View 에서 발생한 이벤트는 반드시 이 Action 중 하나로 변환되어 dispatch 됩니다.
export type Action =
    | { type: 'ADD_TODO';        text: string }
    | { type: 'DELETE_TODO';     id: number }
    | { type: 'TOGGLE_TODO';     id: number }
    | { type: 'EDIT_TODO';       id: number; newText: string }
    | { type: 'TOGGLE_ALL';      completed: boolean }
    | { type: 'DELETE_COMPLETED' }
    | { type: 'CHANGE_FILTER';   filter: Filter };

// ─── Reducer ──────────────────────────────────────────────────────────────────
// Action 을 받아 새로운 State 를 반환하는 순수 함수입니다.
// 부수 효과(side effect) 없이 "이전 상태 + 액션 → 다음 상태"를 계산합니다.
export function reducer(state: State, action: Action): State {
    switch (action.type) {

        case 'ADD_TODO': {
            // 새 id 는 마지막 항목의 id + 1 (목록이 비어 있으면 1부터 시작)
            const nextId = state.todos.length > 0
                ? state.todos[state.todos.length - 1].id + 1
                : 1;
            return {
                ...state,
                todos: [...state.todos, { id: nextId, text: action.text, completed: false }],
            };
        }

        case 'DELETE_TODO':
            // 해당 id 의 항목만 제거합니다.
            return { ...state, todos: state.todos.filter(t => t.id !== action.id) };

        case 'TOGGLE_TODO':
            // 해당 id 의 완료 상태를 반전합니다.
            return {
                ...state,
                todos: state.todos.map(t =>
                    t.id === action.id ? { ...t, completed: !t.completed } : t
                ),
            };

        case 'EDIT_TODO':
            // 해당 id 의 텍스트를 새 내용으로 교체합니다.
            return {
                ...state,
                todos: state.todos.map(t =>
                    t.id === action.id ? { ...t, text: action.newText } : t
                ),
            };

        case 'TOGGLE_ALL':
            // 모든 항목의 완료 상태를 일괄 설정합니다.
            return {
                ...state,
                todos: state.todos.map(t => ({ ...t, completed: action.completed })),
            };

        case 'DELETE_COMPLETED':
            // 완료된 항목을 모두 삭제합니다.
            return { ...state, todos: state.todos.filter(t => !t.completed) };

        case 'CHANGE_FILTER':
            // 현재 필터를 변경합니다.
            return { ...state, filter: action.filter };

        default:
            return state;
    }
}

export function useIntent(dispatch: React.Dispatch<Action>) {
    return {
        addTodo: (text: string) => dispatch({ type: 'ADD_TODO', text }),
        deleteTodo: (id: number) => dispatch({ type: 'DELETE_TODO', id }),
        toggleTodo: (id: number) => dispatch({ type: 'TOGGLE_TODO', id }),
        editTodo: (id: number, newText: string) => dispatch({ type: 'EDIT_TODO', id, newText }),
        toggleTodoAll: (completed: boolean) => dispatch({ type: 'TOGGLE_ALL', completed }),
        deleteTodoCompleted: () => dispatch({ type: 'DELETE_COMPLETED' }),
        changeFilter: (filter: Filter) => dispatch({ type: 'CHANGE_FILTER', filter }),
    };
}