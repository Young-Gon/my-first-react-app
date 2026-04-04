import './FullScreenFallback.css';

interface Props {
    onRetry: () => void;
}

// ErrorBoundary fallback 으로 사용됩니다.
// TodoList 가 error 를 throw 하면 ErrorBoundary 가 이 컴포넌트를 전체 화면에 표시합니다.
// onRetry 는 ErrorBoundary 의 reset 함수로, 클릭 시 TodoList 를 다시 마운트합니다.
export default function FullScreenError({ onRetry }: Props) {
    return (
        <div className="fullscreen-fallback">
            <span className="fullscreen-error-icon">⚠️</span>
            <p className="fullscreen-message">데이터를 불러오지 못했습니다.</p>
            <button className="fullscreen-retry-button" onClick={onRetry}>
                다시 시도
            </button>
        </div>
    );
}
