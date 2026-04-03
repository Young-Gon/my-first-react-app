import Controls from "./components/Controls"
import Layout from "./components/Layout"
import Title from "./components/Title"
import TodoList from "./components/TodoList"

// ─── View ─────────────────────────────────────────────────────────────────────
// MVI 의 View 레이어입니다.
//  - Redux store(Model)을 구독해 현재 UI 상태를 렌더링합니다.
//  - 사용자 이벤트를 Intent(Action)으로 변환해 dispatch 합니다.
//  - 비즈니스 로직은 reducer 에 전적으로 위임하여 View 를 순수하게 유지합니다.
function App() {
    return (
        <>
            <Layout>
                <Title />
                {/* Controls: 할일 추가 / 필터 변경 Intent */}
                <Controls />
                {/* TodoList: 개별·전체 토글, 수정, 삭제 Intent */}
                <TodoList />
            </Layout>
        </>
    )
}

export default App
