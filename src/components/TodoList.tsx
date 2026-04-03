import { useSelector } from 'react-redux';
import { useIntent } from '../model/appSlice';
import TodoItem from './TodoItem';
import './TodoList.css';
import type { RootState } from '../store/store';
import { Filter } from '../model/Filter';

    
export default function TodoList() {
    // useSelector 로 Redux store(Model)을 구독합니다.
    // state 변경은 dispatch(action) 을 통해서만 이루어집니다.
    const state = useSelector((state: RootState) => state.app);
    // ── Intent 핸들러 ─────────────────────────────────────────────────────────
    // DOM 이벤트를 Action 으로 변환(Intent)하여 reducer 에 전달합니다.
    // 각 핸들러는 "어떤 일이 일어났는가"를 Action 타입으로 표현할 뿐,
    // 상태를 직접 조작하지 않습니다.
    const intent = useIntent();
    const isAllCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);
    const completedTodoCount = state.todos.filter(todo => todo.completed).length;
    

    // 현재 필터 조건에 맞는 할일 목록을 계산합니다 (파생 상태).
    // 원본 todos 는 그대로 유지하고, 렌더링용으로만 필터링합니다.
    const filteredTodos = state.todos.filter(todo => {
        switch (state.filter) {
            case Filter.ACTIVE:    return !todo.completed;
            case Filter.COMPLETED: return todo.completed;
            default:               return true;
        }
    });
    
    return (
        <div className="todo-list">
            <div className="todo-header">
                <input type="checkbox" className="todo-checkbox" checked={isAllCompleted} onChange={(e) => intent.toggleTodoAll(e.target.checked)} />
                <p className="todo-header-text">할일 ({state.todos.length})</p>
                <button className="todo-header-button" onClick={intent.deleteTodoCompleted}>
                    {
                        completedTodoCount > 0 ? `${completedTodoCount}개 ` : ""
                    }삭제
                </button>
            </div>
            <div>
                {filteredTodos.map((todo) => (
                    <TodoItem 
                        key={todo.id}
                        todo={todo} 
                    />
                ))}
            </div>
        </div>
    )
}
