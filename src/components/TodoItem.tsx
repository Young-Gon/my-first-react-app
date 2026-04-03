import { useState } from 'react';
import { useIntent } from '../model/appSlice';
import type { Todo } from '../model/Todo';
import './TodoItem.css';
import { editTodo } from '../api/fetchTodos';


export default function TodoItem({todo}: {todo: Todo}) {
    const intent = useIntent();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const handleEdit = async () => {
        if (isEditing) {
            const result = await intent.editTodoAsync(todo.id, editText);
            if(editTodo.fulfilled.match(result)) {
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
            <input type="checkbox" className="todo-item-checkbox" checked={todo.completed} onChange={() => intent.toggleTodoAsync(todo.id)} />
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
                <button className="todo-item-button" onClick={() => intent.deleteTodoAsync(todo.id)}>삭제</button>
            )}
        </div>
    )
}
