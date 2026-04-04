import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
    // fallback 에 reset 함수를 전달해 "다시 시도" 버튼 구현을 지원합니다.
    fallback: (props: { reset: () => void }) => ReactNode;
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

// React Suspense 가 Promise 를 잡는 것처럼, ErrorBoundary 는 throw 된 Error 를 잡습니다.
// - 캐시 없음 + fetch 실패 → TodoList 가 error 를 throw → 이 컴포넌트가 catch
// - 캐시 있음 + refetch 실패 → throw 하지 않고 isError 로 인라인 처리
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    // 에러 상태를 초기화해 children 을 다시 렌더링합니다.
    // FullScreenError 의 "다시 시도" 버튼이 이 함수를 호출합니다.
    reset = () => this.setState({ hasError: false });

    render() {
        if (this.state.hasError) {
            return this.props.fallback({ reset: this.reset });
        }
        return this.props.children;
    }
}
