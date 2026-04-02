import { useRef } from 'react';
import type { Filter } from '../model/Filter';
import './Controls.css';

interface ControlsProps {
    addTodo: (text: string) => void;
    changeFilter: (filter: Filter) => void;
}

function Controls({ addTodo, changeFilter }: ControlsProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(`선택된 필터(${e.target.name}):`, e.target.value);
        changeFilter(e.target.value as Filter);
    };

    const onClickAddButton = () => {
        const value = inputRef.current?.value;
        console.log('추가 버튼이 클릭되었습니다. 입력값:', value);
        if (value !== undefined && value.trim() !== '') {
            addTodo(value);
            if (inputRef.current) {
                inputRef.current.value = ''; // 입력 후 비워주기
            }
        }
    }

    return (
        <div className="controls-container">
            <input 
                type="text" 
                className="input" 
                placeholder="What needs to be done?" 
                ref={inputRef}
            />
            <button className="button" onClick={onClickAddButton}>
                추가
            </button>
            <select name="filter" id="filter" className="select" onChange={handleChange}>
                <option value="all">전체</option>
                <option value="active">할일</option>
                <option value="completed">완료</option>
            </select>
        </div>
    )
}

export default Controls;