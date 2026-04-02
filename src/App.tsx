import { useState } from "react"
import Controls from "./components/Controls"
import Layout from "./components/Layout"
import Title from "./components/Title"
import TodoList from "./components/TodoList"
import { Filter } from "./model/Filter"
import type { Todo } from "./model/Todo"

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '할일 1', completed: false },
    { id: 2, text: '할일 2', completed: true },
    { id: 3, text: '할일 3', completed: false }
  ]);

  const [filter, setFilter] = useState<Filter>(Filter.ALL);

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case Filter.ACTIVE:
        return !todo.completed;
      case Filter.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  function handleAddTodo(text: string) {
    setTodos((prevTodos) => [
      ...prevTodos,
      { id: (prevTodos.length > 0 ? (prevTodos[prevTodos.length - 1].id + 1) : 1), text, completed: false },
    ]);
  }

  function handleDeleteTodoCompleted() {
    setTodos((prevTodos) => prevTodos.filter(todo => !todo.completed));
  }

  function handleToggleTodoAll(completedAll: boolean) {
    setTodos((prevTodos) => prevTodos.map(todo => ({ ...todo, completed: completedAll })));
  }

  function handleToggleTodo(id: number) {
    setTodos((prevTodos) => prevTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }

  function handleEditTodo(id: number, newText: string) {
    setTodos((prevTodos) => prevTodos.map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  }

  function handleDeleteTodo(id: number) {
    setTodos((prevTodos) => prevTodos.filter(todo => todo.id !== id));
  }

  function handleFilterChange(filter: Filter) {
    setFilter(filter);
  }

  return (
    <>
      <Layout>
        <Title />
        <Controls addTodo={handleAddTodo} changeFilter={handleFilterChange} />
        <TodoList 
          todos={filteredTodos} 
          onToggleTodoAll={handleToggleTodoAll}
          onDeleteTodoCompleted={handleDeleteTodoCompleted}
          onToggleTodo={handleToggleTodo}
          onEditTodo={handleEditTodo}
          onDeleteTodo={handleDeleteTodo}
         />
      </Layout>
    </>
  )
}

export default App
