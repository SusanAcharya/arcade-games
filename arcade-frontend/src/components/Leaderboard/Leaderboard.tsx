import React from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = React.useState<Array<{ user_id: string; username: string; total_points: number }>>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    (async () => {
      const { data } = await api.leaderboard();
      if (data?.leaders) setLeaders(data.leaders);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ color: '#9b9b9b' }}>Loading leaderboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'Jersey 10', fontSize: 28, color: '#9b9b9b' }}>Leaderboard</div>
      {leaders.length === 0 && <div style={{ color: '#9b9b9b' }}>No scores yet</div>}
      {leaders.map((l, i) => {
        const isCurrentUser = user && user.id === l.user_id;
        return (
          <div key={l.user_id} style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db' }}>
            <div>
              #{i + 1}{' '}
              <span style={{ color: isCurrentUser ? '#22c55e' : undefined, fontWeight: isCurrentUser ? 700 : 400 }}>
                {l.username}
              </span>
            </div>
            <div>{l.total_points} pts</div>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;


