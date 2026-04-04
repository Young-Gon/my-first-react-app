import { useRef } from 'react';
import type { Filter } from '../model/Filter';
import './Controls.css';
import { useIntent } from '../model/appSlice';

function Controls() {
    const intent = useIntent();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        intent.changeFilter(e.target.value as Filter);
    };

    const onClickAddButton = async () => {
        const value = inputRef.current?.value;
        if (value !== undefined && value.trim() !== '') {
            const result = await intent.addTodo(value);
            // RTK Query mutation 은 { data } 또는 { error } 를 반환합니다.
            // 이전 코드의 addTodo.fulfilled.match(result) 대신 'data' in result 로 성공 판별합니다.
            if ('data' in result && inputRef.current) {
                inputRef.current.value = '';
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
