import { useSelector } from 'react-redux';
import { useIntent } from '../model/appSlice';
import TodoItem from './TodoItem';
import './TodoList.css';
import type { RootState } from '../store/store';
import { Filter } from '../model/Filter';
import { useGetTodosQuery } from '../api/todosApi';

export default function TodoList() {
    // Model: todos 는 RTK Query 캐시, filter 는 appSlice 에서 각각 구독합니다.
    // useGetTodosQuery 는 컴포넌트 마운트 시 자동으로 fetch 를 시작합니다.
    // (App.tsx 의 useEffect + fetchTodos 가 제거된 이유)
    const { data: todos = [], isLoading, error } = useGetTodosQuery();
    const filter = useSelector((state: RootState) => state.app.filter);

    // ── Intent 핸들러 ─────────────────────────────────────────────────────────
    const intent = useIntent();

    const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    // 현재 필터 조건에 맞는 할일 목록 (파생 상태)
    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case Filter.ACTIVE:    return !todo.completed;
            case Filter.COMPLETED: return todo.completed;
            default:               return true;
        }
    });

    if (isLoading) return <div>로딩 중...</div>;
    if (error)     return <div>오류가 발생했습니다.</div>;

    return (
        <div className="todo-list">
            <div className="todo-header">
                <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={isAllCompleted}
                    // todos 배열을 직접 전달합니다. mutation 내부에서 getState() 대신
                    // View 가 이미 갖고 있는 데이터를 그대로 사용합니다.
                    onChange={(e) => intent.toggleTodoAll(todos, e.target.checked)}
                />
                <p className="todo-header-text">할일 ({todos.length})</p>
                <button
                    className="todo-header-button"
                    // 완료된 항목의 id 배열을 전달합니다.
                    onClick={() => intent.deleteCompletedTodos(completedTodos.map(t => t.id))}
                >
                    {completedTodos.length > 0 ? `${completedTodos.length}개 ` : ""}삭제
                </button>
            </div>
            <div>
                {filteredTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </div>
        </div>
    )
}
