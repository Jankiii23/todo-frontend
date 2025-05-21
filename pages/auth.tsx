import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import client from '../utils/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { useRouter } from 'next/router';

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

function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [signup, { loading: signupLoading, error: signupError }] = useMutation(SIGNUP);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login({ variables: { username, password } });
    } else {
      await signup({ variables: { username, password } });
    }
    setUsername('');
    setPassword('');
    router.push('/');
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 80 }}>
      <h1>{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={{ marginRight: 8, marginBottom: 8, width: '100%' }}
        />
        <button type="submit" disabled={loginLoading || signupLoading} style={{ width: '100%', marginBottom: 8 }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ width: '100%' }}>
          {mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}
        </button>
        <div style={{ color: 'red', marginTop: 8 }}>
          {loginError && loginError.message}
          {signupError && signupError.message}
        </div>
      </form>
    </div>
  );
}

export default function Auth() {
  return (
    <ApolloProvider client={client}>
      <AuthPage />
    </ApolloProvider>
  );
}
