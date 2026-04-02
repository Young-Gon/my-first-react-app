import { useState } from 'react';
import type { Todo } from '../model/Todo';
import './TodoItem.css';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: number) => void;
    onEdit: (id: number, newText: string) => void;
    onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const handleEdit = () => {
        if (isEditing) {
            onEdit(todo.id, editText);
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    return (
        <div className="todo-item">
            <input type="checkbox" className="todo-item-checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
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
                <button className="todo-item-button" onClick={() => onDelete(todo.id)}>삭제</button>
            )}
        </div>
    )
}
