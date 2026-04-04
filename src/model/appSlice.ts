import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import {
    useAddTodoMutation,
    useDeleteTodoMutation,
    useEditTodoMutation,
    useToggleTodoMutation,
    useToggleTodoAllMutation,
    useDeleteCompletedTodosMutation,
} from '../api/todosApi';
import { Filter } from './Filter';
import type { Todo } from './Todo';

// ─── Model ────────────────────────────────────────────────────────────────────
// todos/loading/error 는 RTK Query 캐시가 엔드포인트별로 자동 관리합니다.
// appSlice 는 서버와 무관한 순수 UI 상태(filter)만 담당합니다.
export interface AppState {
    filter: Filter;
}

export const initialState: AppState = {
    filter: Filter.ALL,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
// filter 변경은 서버 요청 없이 동기적으로 처리되므로 일반 reducer 로 남겨둡니다.
// extraReducers 는 더 이상 필요하지 않습니다 (RTK Query 가 대체합니다).
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        changeFilter(state, action: PayloadAction<Filter>) {
            state.filter = action.payload;
        },
    },
});

export const appActions = appSlice.actions;
export default appSlice.reducer;

// ─── Intent ───────────────────────────────────────────────────────────────────
// DOM 이벤트를 Action 으로 변환하는 Intent 훅입니다.
// - 동기 액션(changeFilter): dispatch 로 처리
// - 비동기 CRUD: RTK Query mutation trigger 를 래핑
//   View 는 내부가 dispatch 인지 mutation 인지 알 필요 없이 intent.xxx() 만 호출합니다.
export function useIntent() {
    const dispatch = useDispatch<AppDispatch>();
    // useXxxMutation() 은 [trigger, result] 튜플을 반환합니다.
    // trigger 만 필요하므로 구조 분해로 첫 번째 요소만 가져옵니다.
    const [addTodo]                 = useAddTodoMutation();
    const [deleteTodo]              = useDeleteTodoMutation();
    const [editTodo]                = useEditTodoMutation();
    const [toggleTodo]              = useToggleTodoMutation();
    const [toggleTodoAll]           = useToggleTodoAllMutation();
    const [deleteCompletedTodos]    = useDeleteCompletedTodosMutation();

    return {
        changeFilter:           (filter: Filter)                        => dispatch(appActions.changeFilter(filter)),
        addTodo:                (text: string)                          => addTodo(text),
        deleteTodo:             (id: number)                            => deleteTodo(id),
        editTodo:               (id: number, newText: string)           => editTodo({ id, newText }),
        // id 만 전달합니다. completed 반전은 todosApi 내부에서 캐시를 읽어 처리합니다.
        toggleTodo:             (id: number)                            => toggleTodo(id),
        // todos 배열과 completedIds 를 호출 측(TodoList)에서 전달합니다.
        // 이전 구현은 thunk 내부에서 getState() 로 읽었으나,
        // RTK Query 에서는 View 가 이미 갖고 있는 데이터를 그대로 넘깁니다.
        toggleTodoAll:          (todos: Todo[], completed: boolean)     => toggleTodoAll({ todos, completed }),
        deleteCompletedTodos:   (completedIds: number[])                => deleteCompletedTodos(completedIds),
    };
}
