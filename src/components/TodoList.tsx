import type { Todo } from '../model/Todo';
import TodoItem from './TodoItem';
import './TodoList.css';

interface TodoListProps {
    todos: Todo[];
    onToggleTodoAll: (completed: boolean) => void;
    onDeleteTodoCompleted: () => void;
    onToggleTodo: (id: number) => void;
    onEditTodo: (id: number, newText: string) => void;
    onDeleteTodo: (id: number) => void;
}

export default function TodoList({ todos, onToggleTodoAll, onDeleteTodoCompleted, onToggleTodo, onEditTodo, onDeleteTodo }: TodoListProps) {
    const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);
    const completedTodoCount = todos.filter(todo => todo.completed).length;

    return (
        <div className="todo-list">
            <div className="todo-header">
                <input type="checkbox" className="todo-checkbox" checked={isAllCompleted} onChange={(e) => onToggleTodoAll(e.target.checked)} />
                <p className="todo-header-text">할일 ({todos.length})</p>
                <button className="todo-header-button" onClick={onDeleteTodoCompleted}>
                    {
                        completedTodoCount > 0 ? `${completedTodoCount}개 ` : ""
                    }삭제
                </button>
            </div>
            <div>
                {todos.map((todo) => (
                    <TodoItem 
                        key={todo.id}
                        todo={todo} 
                        onToggle={onToggleTodo}
                        onEdit={onEditTodo} 
                        onDelete={onDeleteTodo} 
                    />
                ))}
            </div>
        </div>
    )
}
