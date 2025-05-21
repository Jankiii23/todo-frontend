import { ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';
import client from '../utils/apolloClient';
import { useState } from 'react';

const TODOS_QUERY = gql`
  query Todos {
    todos {
      id
      title
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      completed
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

function AuthForm({ onAuth }: { onAuth: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        id
        username
      }
    }
  `;
  const SIGNUP = gql`
    mutation Signup($username: String!, $password: String!) {
      signup(username: $username, password: $password) {
        id
        username
      }
    }
  `;
  const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [signup, { loading: signupLoading, error: signupError }] = useMutation(SIGNUP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login({ variables: { username, password } });
    } else {
      await signup({ variables: { username, password } });
    }
    setUsername('');
    setPassword('');
    onAuth();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        style={{ marginRight: 8, marginBottom: 8 }}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        style={{ marginRight: 8, marginBottom: 8 }}
      />
      <button type="submit" disabled={loginLoading || signupLoading}>
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginLeft: 8 }}>
        {mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
      </button>
      <div style={{ color: 'red', marginTop: 8 }}>
        {loginError && loginError.message}
        {signupError && signupError.message}
      </div>
    </form>
  );
}

function TodoApp() {
  const { data, loading, error, refetch } = useQuery(TODOS_QUERY);
  const [addTodo] = useMutation(ADD_TODO);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [newTitle, setNewTitle] = useState('');
  const [authed, setAuthed] = useState(false);

  if (!authed && (!data || (data && data.todos.length === 0))) {
    return <AuthForm onAuth={() => { setAuthed(true); refetch(); }} />;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTodo({ variables: { title: newTitle } });
    setNewTitle('');
    refetch();
  };

  const handleToggle = async (id: string) => {
    await toggleTodo({ variables: { id } });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteTodo({ variables: { id } });
    refetch();
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>Todos</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: 16 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New todo"
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {data.todos.map((todo: any) => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
              style={{ marginRight: 8 }}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>{todo.title}</span>
            <button onClick={() => handleDelete(todo.id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <TodoApp />
    </ApolloProvider>
  );
}
