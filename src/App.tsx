import Controls from "./components/Controls"
import Layout from "./components/Layout"
import Title from "./components/Title"
import TodoList from "./components/TodoList"

// ─── View ─────────────────────────────────────────────────────────────────────
// MVI 의 View 레이어입니다.
// 초기 데이터 fetch 는 TodoList 내 useGetTodosQuery 가 자동으로 처리합니다.
function App() {
    return (
        <>
            <Layout>
                <Title />
                <Controls />
                <TodoList />
            </Layout>
        </>
    )
}

export default App
