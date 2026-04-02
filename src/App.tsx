import { useReducer } from "react"
import Controls from "./components/Controls"
import Layout from "./components/Layout"
import Title from "./components/Title"
import TodoList from "./components/TodoList"
import { Filter } from "./model/Filter"
import { reducer, initialState, useIntent } from "./model/appReducer"

// ─── View ─────────────────────────────────────────────────────────────────────
// MVI 의 View 레이어입니다.
//  - Model(State)을 읽어 현재 UI 상태를 렌더링합니다.
//  - 사용자 이벤트를 Intent(Action)으로 변환해 dispatch 합니다.
//  - 비즈니스 로직은 reducer 에 전적으로 위임하여 View 를 순수하게 유지합니다.
function App() {
    // useReducer 로 Model 을 구독합니다.
    // state 변경은 dispatch(action) 을 통해서만 이루어집니다.
    const [state, dispatch] = useReducer(reducer, initialState);
    const intent = useIntent(dispatch);

    // 현재 필터 조건에 맞는 할일 목록을 계산합니다 (파생 상태).
    // 원본 todos 는 그대로 유지하고, 렌더링용으로만 필터링합니다.
    const filteredTodos = state.todos.filter(todo => {
        switch (state.filter) {
            case Filter.ACTIVE:    return !todo.completed;
            case Filter.COMPLETED: return todo.completed;
            default:               return true;
        }
    });

    // ── Intent 핸들러 ─────────────────────────────────────────────────────────
    // DOM 이벤트를 Action 으로 변환(Intent)하여 reducer 에 전달합니다.
    // 각 핸들러는 "어떤 일이 일어났는가"를 Action 타입으로 표현할 뿐,
    // 상태를 직접 조작하지 않습니다.

    return (
        <>
            <Layout>
                <Title />
                {/* Controls: 할일 추가 / 필터 변경 Intent */}
                <Controls
                    addTodo={intent.addTodo}
                    changeFilter={intent.changeFilter}
                />
                {/* TodoList: 개별·전체 토글, 수정, 삭제 Intent */}
                <TodoList
                    todos={filteredTodos}
                    onToggleTodoAll={intent.toggleTodoAll}
                    onDeleteTodoCompleted={intent.deleteTodoCompleted}
                    onToggleTodo={intent.toggleTodo}
                    onEditTodo={intent.editTodo}
                    onDeleteTodo={intent.deleteTodo}
                />
            </Layout>
        </>
    )
}

export default App
