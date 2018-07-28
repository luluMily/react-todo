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
  background: isDragging ? 'lightgreen' : 'grey',
  // styles we need to apply on draggbles
  ...draggableStyle
})

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250
})

const sortTodos = (todos) => {
  return todos.sort(function (todo1, todo2) {

    // Sort by votes
    // If the first item has a higher number, move it down
    // If the first item has a lower number, move it up
    if (todo1.index > todo2.index) return 1;
    if (todo1.index < todo2.index) return -1;

  });
}

class Dashboard extends React.Component {
  state = {
    todo: "",
    todos: []
  };
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  async componentDidMount() {
    // 1. When the dashboard loads, get the user's token
    const token = getToken()
    // 2. Send a GET request to /todo and pass the token to grab a list of ONLY this user's todos
    try {
      const res = await axios.get('todo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const todos = sortTodos(res.data.payload)

      this.setState({todos})
    } catch (e) {
      console.error(e)
    }
    // 3. If we get a successful response, store the todos in state.
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
    this.updateIndex(todos)
  }

  // const data = { 'bar': 123 };
  // const options = {
  //   method: 'POST',
  //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
  //   data: qs.stringify(data),
  //   url,
  // };
  // axios(options);

  updateIndex = async todos => {
    debugger;
    const token = getToken()

    const options = {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      data: todos,
      url: '/todo'
    };

    try {
      const res = axios(options);
      // const res = await axios.put('/todo', 
      // todos
      // , {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // })
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
        index: this.state.todos.length
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
    //  a - the body containing the TODO we wish to post
    //  b - the Authorization Header Bearer <token>
  };

  getTodos = async () => {
    const token = getToken()

    try {
      const res = await axios.get('/todo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res)
      const todos = res.data.payload
      this.setState({ todos })
    } catch (e) {
      console.error(e)
    }
  }
  render() {
    return (
      <div>
        <h1>Dashboard</h1>
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
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <form onSubmit={this.handleSubmit}>
          <input name="todo" type="text" onChange={this.handleChange} />
          <button>Add Todo</button>
        </form>
        {/* <ul>
          {this.state.todos.map(todo => {
            return <li>{JSON.stringify(todo, null, 3)}</li>;
          })}
        </ul> */}
        <Logout setUser={this.props.setUser} />
      </div>
    );
  }
}

export default Dashboard;
