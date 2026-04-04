import { useState } from 'react';
import { useIntent } from '../model/appSlice';
import type { Todo } from '../model/Todo';
import './TodoItem.css';

export default function TodoItem({ todo }: { todo: Todo }) {
    const intent = useIntent();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const handleEdit = async () => {
        if (isEditing) {
            const result = await intent.editTodo(todo.id, editText);
            // 이전 코드의 editTodo.fulfilled.match(result) 대신 'data' in result 로 성공 판별합니다.
            if ('data' in result) {
                setIsEditing(false);
            }
            return;
        }
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    return (
        <div className="todo-item">
            <input
                type="checkbox"
                className="todo-item-checkbox"
                checked={todo.completed}
                // 이전 thunk 는 내부에서 getState() 로 현재값을 읽었으나,
                // RTK Query 에서는 이미 갖고 있는 todo.completed 를 반전해 전달합니다.
                onChange={() => intent.toggleTodo(todo.id, !todo.completed)}
            />
            {isEditing ? (
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="todo-item-text"
                />
            ) : (
                <p className={`todo-item-text ${todo.completed ? "completed" : ""}`}>
                    {todo.text}
                </p>
            )}
            <button className="todo-item-button" onClick={handleEdit}>
                {isEditing ? '저장' : '수정'}
            </button>
            {isEditing ? (
                <button className="todo-item-button" onClick={handleCancel}>취소</button>
            ) : (
                <button className="todo-item-button" onClick={() => intent.deleteTodo(todo.id)}>삭제</button>
            )}
        </div>
    )
}
