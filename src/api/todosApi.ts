import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Todo } from '../model/Todo';

// ─── 1. API 엔드포인트 생성 (RTK Query API 정의) ───────────────────────────────────────────────────────
// createApi 는 엔드포인트별로 useXxxQuery / useXxxMutation 훅을 자동 생성합니다.
// 각 mutation 이 성공하면 invalidatesTags: ['Todo'] 로 getTodos 캐시를 자동 무효화하여
// 목록을 다시 fetch 하므로, extraReducers 로 수동 업데이트할 필요가 없습니다.
export const todosApi = createApi({
    reducerPath: 'todosApi',
    // axios 대신 fetch 기반의 baseQuery 사용. baseUrl 은 json-server 주소입니다.
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
    // 캐시 무효화에 사용할 태그 선언. mutation 이 이 태그를 invalidate 하면
    // providesTags: ['Todo'] 인 query 가 자동으로 재요청됩니다.
    tagTypes: ['Todo'],
    endpoints: (builder) => ({
        // ── Query (읽기) ────────────────────────────────────────────────────
        // builder.query: 데이터를 가져오는 엔드포인트.
        // useGetTodosQuery() 훅을 생성하며, 컴포넌트 마운트 시 자동으로 fetch 됩니다.
        getTodos: builder.query<Todo[], void>({
            query: () => '/todos',
            // 이 쿼리가 'Todo' 태그를 제공함을 선언.
            // 아래 mutation 들이 'Todo' 를 invalidate 하면 이 쿼리가 재실행됩니다.
            providesTags: ['Todo'],
        }),

        // ── Mutations (쓰기) ────────────────────────────────────────────────
        // builder.mutation: 서버 상태를 변경하는 엔드포인트.
        // 각 mutation 은 성공 후 invalidatesTags 로 캐시를 무효화합니다.
        addTodo: builder.mutation<Todo, string>({
            query: (text) => ({
                url: '/todos',
                method: 'POST',
                body: { text, completed: false },
            }),
            invalidatesTags: ['Todo'],
        }),
        deleteTodo: builder.mutation<void, number>({
            query: (id) => ({
                url: `/todos/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Todo'],
        }),
        editTodo: builder.mutation<Todo, { id: number; newText: string }>({
            query: ({ id, newText }) => ({
                url: `/todos/${id}`,
                method: 'PUT',
                body: { text: newText },
            }),
            invalidatesTags: ['Todo'],
        }),
        // toggleTodo: View 로부터 completed 를 받지 않고, 캐시에서 직접 현재 상태를 읽어 반전합니다.
        // queryFn 을 사용하면 queryApi.getState() 로 Redux store 에 접근할 수 있습니다.
        // 이렇게 하면 View 가 잘못된 completed 값을 전달하는 실수를 방지할 수 있습니다.
        toggleTodo: builder.mutation<Todo, number>({
            queryFn: async (id, queryApi, _extraOptions, baseQuery) => {
                // todosApi.endpoints.getTodos.select() 는 캐시에서 getTodos 결과를 읽는 selector 입니다.
                // queryApi.getState() 로 현재 Redux store 전체 상태를 가져옵니다.
                const { data: todos } = todosApi.endpoints.getTodos.select()(
                    queryApi.getState() as any
                );
                const todo = todos?.find(t => t.id === id);
                if (!todo) return { error: { status: 'CUSTOM_ERROR' as const, error: `Todo ${id} not found in cache` } };

                const result = await baseQuery({
                    url: `/todos/${id}`,
                    method: 'PATCH',
                    // 캐시에서 읽은 현재 completed 를 반전합니다.
                    body: { completed: !todo.completed },
                });
                if (result.error) return { error: result.error };
                return { data: result.data as Todo };
            },
            invalidatesTags: ['Todo'],
        }),

        // ── 배치 Mutations ──────────────────────────────────────────────────
        // 단일 HTTP 요청으로 표현할 수 없는 배치 작업은 queryFn 으로 직접 구현합니다.
        // queryFn 은 { data } 또는 { error } 를 반환해야 합니다.

        // 전체 토글: View(TodoList) 에서 todos 배열과 목표 completed 값을 전달받아
        // 각 항목에 PATCH 를 병렬 요청합니다.
        toggleTodoAll: builder.mutation<Todo[], { todos: Todo[]; completed: boolean }>({
            queryFn: async ({ todos, completed }, _queryApi, _extraOptions, baseQuery) => {
                const results = await Promise.all(
                    todos.map(todo =>
                        baseQuery({
                            url: `/todos/${todo.id}`,
                            method: 'PATCH',
                            body: { completed },
                        })
                    )
                );
                // 하나라도 실패하면 첫 번째 에러를 반환합니다.
                const failed = results.find(r => r.error);
                if (failed) return { error: failed.error! };
                return { data: results.map(r => r.data as Todo) };
            },
            invalidatesTags: ['Todo'],
        }),

        // 완료 항목 일괄 삭제: View(TodoList) 에서 completedIds 를 전달받아
        // 각 항목에 DELETE 를 병렬 요청합니다.
        deleteCompletedTodos: builder.mutation<void, number[]>({
            queryFn: async (completedIds, _queryApi, _extraOptions, baseQuery) => {
                const results = await Promise.all(
                    completedIds.map(id =>
                        baseQuery({ url: `/todos/${id}`, method: 'DELETE' })
                    )
                );
                const failed = results.find(r => r.error);
                if (failed) return { error: failed.error! };
                return { data: undefined };
            },
            invalidatesTags: ['Todo'],
        }),
    }),
});

// 자동 생성된 훅을 export 합니다.
// useIntent() 에서 mutation 훅을 래핑하고, TodoList 에서 query 훅을 직접 사용합니다.
export const {
    useGetTodosQuery,
    useAddTodoMutation,
    useDeleteTodoMutation,
    useEditTodoMutation,
    useToggleTodoMutation,
    useToggleTodoAllMutation,
    useDeleteCompletedTodosMutation,
} = todosApi;
