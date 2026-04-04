import { use } from 'react';
import { useGetTodosQuery } from './todosApi';
import type { Todo } from '../model/Todo';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// RTK Query 2.11.x 에는 useSuspenseQuery 가 내장되어 있지 않습니다.
// 이 훅은 useGetTodosQuery 를 래핑하여 React 19 의 use() + Suspense/ErrorBoundary 와
// 통합하는 어댑터 역할을 합니다.

// ── 로딩 전용 Promise ──────────────────────────────────────────────────────────
// 컴포넌트 외부에 선언해 렌더링마다 새 Promise 가 생성되는 것을 막습니다.
// React 19 의 use() 는 Promise 참조를 기준으로 캐싱하므로, 동일한 참조를 유지해야
// "이미 suspended 된 같은 Promise" 로 인식해 중복 suspend 를 방지합니다.
// (throw promise 와 달리, use() 는 조건부 호출이 가능합니다)
const loadingPromise = new Promise<void>(() => {});

interface SuspenseTodosResult {
    todos: Todo[];
    isFetching: boolean;
    isError: boolean;
    error: FetchBaseQueryError | undefined;
}

export function useSuspenseTodosQuery(): SuspenseTodosResult {
    const { data, isLoading, isFetching, isError, error } = useGetTodosQuery();

    // 캐시 없음 + 로딩 중
    // use(pendingPromise) → React 가 Suspense 를 자동 발동합니다.
    // throw promise 와 동일한 효과지만 React 19 의 공식 API 입니다.
    if (isLoading) use(loadingPromise);

    // 캐시 없음 + 에러
    // use(rejectedPromise) 도 가능하지만, 매 렌더마다 새 Promise 를 만들어야 해서
    // throw 를 그대로 사용합니다. ErrorBoundary 는 throw 된 Error 를 catch 합니다.
    if (isError && !data) {
        const message = (error as FetchBaseQueryError & { error?: string })?.error
            ?? '데이터를 불러오지 못했습니다.';
        throw new Error(message);
    }

    // 여기 이후로는 data 가 항상 존재합니다 (캐시 있는 상태).
    // isFetching / isError 는 인라인 표시용으로 그대로 반환합니다.
    return {
        todos: data ?? [],
        isFetching,
        isError,
        error: error as FetchBaseQueryError | undefined,
    };
}
