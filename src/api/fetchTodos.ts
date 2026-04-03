import { createAsyncThunk } from "@reduxjs/toolkit";
import api from ".";
import type { Todo } from "../model/Todo";

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
    try {
        const response = await api.get('/todos');
        const data = await response.data as Todo[];
        return data;
    } catch (error) {
        console.error('할일 목록을 가져오는 중 오류가 발생했습니다:', error);
        // error 시 추가적 데이터 전달이 필요하다면 rejectWithValue 사용
        // return rejectWithValue
        throw error;
    }
});

export const addTodo = createAsyncThunk('todos/addTodo', async (text: string) => {
    try {
        const response = await api.post('/todos', { text, completed: false });
        const data = await response.data as Todo;
        return data;
    } catch (error) {
        console.error('할일을 추가하는 중 오류가 발생했습니다:', error);
        throw error;
    }
});

export const deleteTodo = createAsyncThunk('todos/deleteTodo', async (id: number) => {
    try {
        await api.delete(`/todos/${id}`);
        return id;
    } catch (error) {
        console.error('할일을 삭제하는 중 오류가 발생했습니다:', error);
        throw error;
    }
});

export const editTodo = createAsyncThunk('todos/editTodo', async ({ id, newText }: { id: number; newText: string }) => {
    try {
        const response = await api.put(`/todos/${id}`, { text: newText });
        const data = await response.data as Todo;
        return data;
    } catch (error) {
        console.error('할일을 수정하는 중 오류가 발생했습니다:', error);
        throw error;
    }
});

export const toggleTodo = createAsyncThunk('todos/toggleTodo', async (id: number, thunkAPI) => {
    try {
        const state = thunkAPI.getState() as { app: { todos: Todo[] } };
        const todo = state.app.todos.find(t => t.id === id);
        if (!todo) throw new Error(`Todo ${id} not found in state`);
        const response = await api.patch(`/todos/${id}`, { completed: !todo.completed });
        const data = await response.data as Todo;
        return data;
    } catch (error) {
        console.error('할일을 토글하는 중 오류가 발생했습니다:', error);
        throw error;
    }
});

export const toggleTodoAll = createAsyncThunk('todos/toggleTodoAll', async (completed: boolean, thunkAPI) => {
    try {
        const state = thunkAPI.getState() as { app: { todos: Todo[] } };
        const updated = await Promise.all(
            state.app.todos.map(todo => api.patch(`/todos/${todo.id}`, { completed }).then(r => r.data as Todo))
        );
        return updated;
    } catch (error) {
        console.error('전체 토글 중 오류가 발생했습니다:', error);
        throw error;
    }
});

export const deleteCompletedTodos = createAsyncThunk('todos/deleteCompletedTodos', async (_, thunkAPI) => {
    try {
        const state = thunkAPI.getState() as { app: { todos: Todo[] } };
        const completedIds = state.app.todos.filter(t => t.completed).map(t => t.id);
        await Promise.all(completedIds.map(id => api.delete(`/todos/${id}`)));
        return completedIds;
    } catch (error) {
        console.error('완료된 할일을 삭제하는 중 오류가 발생했습니다:', error);
        throw error;
    }
});