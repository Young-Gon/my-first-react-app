import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../model/appSlice';
import { todosApi } from '../api/todosApi';

// ─── 2. Store 등록 ───────────────────────────────────────────────────────────────────
// configureStore() 는 Redux DevTools 와 Immer 가 내장된 편리한 스토어 설정 함수입니다.
// appReducer 는 UI 상태(filter) 만 담당하며, todosApi.reducer 는 RTK Query 캐시를 관리합니다.
// middleware 에 todosApi.middleware 를 추가하여 RTK Query 의 기능을 활성화합니다.
export const store = configureStore({
    reducer: {
        // UI 상태(filter)를 담당하는 slice
        app: appReducer,
        // RTK Query 캐시 저장소. reducerPath('todosApi') 를 키로 사용합니다.
        [todosApi.reducerPath]: todosApi.reducer,
    },
    // RTK Query 의 캐시 수명 관리, 폴링, invalidation 등이
    // middleware 를 통해 동작하므로 반드시 등록해야 합니다.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(todosApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
