import React from 'react';
import Modal from '../Modal/Modal';
import { useAuth } from '../../context/AuthContext';

type Props = { isOpen: boolean; onClose: () => void };

const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fn = mode === 'login' ? login : register;
    const err = await fn(username.trim(), password);
    if (err) {
      setError(typeof err === 'string' ? err : 'Unable to sign in');
    }
    else onClose();
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Sign In' : 'Create Account'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8, borderRadius: 8 }}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8, borderRadius: 8 }}
          required
        />
        {error && <div style={{ color: '#f87171', fontSize: 12 }}>{String(error)}</div>}
        <button type="submit" disabled={submitting} style={{ padding: 10, borderRadius: 8 }}>
          {submitting ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ padding: 8, borderRadius: 8 }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;


