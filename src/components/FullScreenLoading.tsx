import './FullScreenFallback.css';

// Suspense fallback 으로 사용됩니다.
// TodoList 가 promise 를 throw 하면 React 가 이 컴포넌트를 전체 화면에 표시합니다.
export default function FullScreenLoading() {
    return (
        <div className="fullscreen-fallback">
            <div className="fullscreen-spinner" />
            <p className="fullscreen-message">불러오는 중...</p>
        </div>
    );
}
