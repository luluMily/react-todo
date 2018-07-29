import React from "react";
import axios from "axios";
import { getToken } from "../services/tokenService";
import Logout from './Logout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  const updatedResult = result.map((todo) => {
    let indexInArray = result.findIndex(i => i._id === todo._id)
    todo.index = indexInArray
    return todo
  })

  return updatedResult
}

const grid = 8

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? '#42b0f4' : '#fff',
  // styles we need to apply on draggbles
  ...draggableStyle
})

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 300
})

const sortTodos = (todos) => {
  return todos.sort(function (todo1, todo2) {

    if (todo1.index > todo2.index) return 1;
    if (todo1.index < todo2.index) return -1;

  });
}

class Dashboard extends React.Component {
  state = {
    todo: "",
    todos: [],
    completedTodos: []
  };
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  async componentDidMount() {
    this.getTodos()
  }

  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const todos = reorder(
      this.state.todos,
      result.source.index,
      result.destination.index
    )

    this.setState({
      todos
    })
    this.updateTodos(todos)
  }

  updateTodos = async todos => {
    const token = getToken()

    const options = {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      data: todos,
      url: '/todo'
    };

    try {
      const res = axios(options);
      this.getTodos()
    } catch (e) {
      console.error(e)
    }
  }

  handleSubmit = async e => {
    e.preventDefault();
    const { todo } = this.state;

    // 1. Get the user's token
    const token = getToken()
    // 2. Send a POST to /todo with
    try {
      const res = await axios.post('/todo', 
      { 
        description: todo,
        index: this.state.todos.length,
        completed: false
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.getTodos()
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  };

  getTodos = async () => {
    const token = getToken()
    try {
      const res = await axios.get('todo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      let uncompletedTodos = []
      let completedTodos = []
      
      res.data.payload.forEach((todo) => {
        if (todo.completed) {
          completedTodos.push(todo)
        } else {
          uncompletedTodos.push(todo)
        }
      })

      const sortedTodos = sortTodos(uncompletedTodos)

      this.setState({
        todos: sortedTodos,
        completedTodos: completedTodos
      })
    } catch (e) {
      console.error(e)
    }
  }

  completeTodo = async (todo) => {
    const token = getToken()
    const todos = Array.from(this.state.todos)

    const newTodo = {
      _id: todo._id,
      description: todo.description,
      index: -1,
      completed: true,
      user: todo._user
    }
    
    todos.splice(todo.index, 1)

    const orderedResult = todos.map((todo) => {
      let indexInArray = todos.findIndex(i => i._id === todo._id)
      todo.index = indexInArray
      return todo
    })

    orderedResult.push(newTodo)

    this.updateTodos(orderedResult)
  }

  render() {
    return (
      <div>
        <div>
          <h1 className="title">Todo List</h1>
          <Logout setUser={this.props.setUser} />
        </div>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {this.state.todos.map((todo, index) => (
                  <Draggable key={todo._id} draggableId={todo._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        {todo.description}
                        <div className="manage-todo">
                          <button className="complete-todo-button" onClick={() => this.completeTodo(todo)}>Done</button>
                          {/* <button className="delete-todo-button" onClick={() => this.deleteTodo(todo)}>Delete</button> */}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <form className="add-todo-form" onSubmit={this.handleSubmit}>
          <input name="todo" type="text" onChange={this.handleChange} />
          <button>Add Todo</button>
        </form>
        
        <ul>
          {this.state.completedTodos.map(todo => {
            return <li className="completed-todo" key={todo._id}>{todo.description}</li>;
          })}
        </ul>

      </div>
    );
  }
}

export default Dashboard;
