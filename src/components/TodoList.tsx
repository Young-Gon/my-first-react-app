import { useSelector } from 'react-redux';
import { useIntent } from '../model/appSlice';
import TodoItem from './TodoItem';
import './TodoList.css';
import type { RootState } from '../store/store';
import { Filter } from '../model/Filter';
import { useSuspenseTodosQuery } from '../api/useSuspenseTodosQuery';

export default function TodoList() {
    // RTK Query 의 Suspense 어댑터 훅입니다.
    // - 캐시 없음 + 로딩 → promise throw → <Suspense> 발동 (FullScreenLoading)
    // - 캐시 없음 + 에러 → Error throw  → <ErrorBoundary> 발동 (FullScreenError)
    // - 캐시 있음       → todos 반환, isFetching/isError 로 인라인 표시
    const { todos, isFetching, isError } = useSuspenseTodosQuery();
    const filter = useSelector((state: RootState) => state.app.filter);
    const intent = useIntent();

    const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case Filter.ACTIVE:    return !todo.completed;
            case Filter.COMPLETED: return todo.completed;
            default:               return true;
        }
    });

    return (
        <div className="todo-list">
            {/* ── 케이스 3: 캐시 있음 + refetch 중 → 리스트 상단 로딩바 ── */}
            {isFetching && <div className="todo-loading-bar" />}

            {/* ── 케이스 4: 캐시 있음 + refetch 실패 → 상단 에러 메시지 ── */}
            {isError && <div className="todo-error-bar">⚠️ 갱신에 실패했습니다. 잠시 후 다시 시도됩니다.</div>}

            <div className="todo-header">
                <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={isAllCompleted}
                    onChange={(e) => intent.toggleTodoAll(todos, e.target.checked)}
                />
                <p className="todo-header-text">할일 ({todos.length})</p>
                <button
                    className="todo-header-button"
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
    );
}
