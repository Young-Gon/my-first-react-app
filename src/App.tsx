import { Suspense } from 'react';
import Controls from './components/Controls';
import Layout from './components/Layout';
import Title from './components/Title';
import TodoList from './components/TodoList';
import ErrorBoundary from './components/ErrorBoundary';
import FullScreenLoading from './components/FullScreenLoading';
import FullScreenError from './components/FullScreenError';
import { useGetTodosQuery } from './api/todosApi';

// ─── View ─────────────────────────────────────────────────────────────────────
// MVI 의 View 레이어입니다.
//
// ── RTK Query 구독을 Suspense 경계 밖에서 먼저 시작하는 이유 ──────────────────
// RTK Query 는 useEffect 안에서 initiate 액션을 dispatch 해 API 호출을 시작합니다.
// TodoList(Suspense 경계 안)가 suspend 되면 React 는 해당 컴포넌트의 effects 를
// 커밋하지 않아 API 호출 자체가 일어나지 않는 순환 문제가 생깁니다:
//   suspend → effect 미실행 → API 미호출 → isLoading 유지 → 무한 로딩
// App(Suspense 경계 밖)에서 동일한 훅을 호출하면 effect 가 정상 실행되어
// API 호출이 시작됩니다. RTK Query 는 같은 엔드포인트를 중복 요청하지 않습니다.
//
// ── 화면 전환 시나리오 ─────────────────────────────────────────────────────────

//   캐시 없음 + 로딩  → TodoList 가 promise throw → <Suspense> 가 FullScreenLoading 표시
//   캐시 없음 + 에러  → TodoList 가 Error throw  → <ErrorBoundary> 가 FullScreenError 표시
//   캐시 있음 + 로딩  → TodoList 내부 로딩바 표시 (throw 하지 않음)
//   캐시 있음 + 에러  → TodoList 내부 에러 메시지 표시 (throw 하지 않음)
function App() {
    // Suspense 경계 밖에서 구독을 먼저 시작해 API 호출을 보장합니다.
    useGetTodosQuery();

    return (
        <ErrorBoundary fallback={({ reset }) => <FullScreenError onRetry={reset} />}>
            <Suspense fallback={<FullScreenLoading />}>
                <Layout>
                    <Title />
                    <Controls />
                    <TodoList />
                </Layout>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
