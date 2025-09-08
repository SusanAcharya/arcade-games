import React from 'react';
// Custom modal (no modal_frame)
import { api } from '../../api/client';
import { IoClose } from 'react-icons/io5';

type Leader = { user_id: string; username: string; total_points: number };

type Props = { isOpen: boolean; onClose: () => void };

const PAGE_SIZE = 10;

const colorForRank = (rank: number) => {
  if (rank === 1) return '#ffd700'; // gold
  if (rank === 2) return '#c0c0c0'; // silver
  if (rank === 3) return '#cd7f32'; // bronze
  return '#e5e7eb'; // white
};

const LeaderboardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [leaders, setLeaders] = React.useState<Leader[]>([]);
  const [me, setMe] = React.useState<Leader | null>(null);
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(leaders.length / PAGE_SIZE));

  React.useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const [lb, mine] = await Promise.all([api.leaderboard(), api.myPoints()]);
      setLeaders(lb.data?.leaders || []);
      setMe(mine.data || null);
      setPage(1);
    })();
  }, [isOpen]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const pageItems = leaders.slice(startIdx, startIdx + PAGE_SIZE);

  // Current user's rank within the fetched list (or -1 if not present)
  const myIndex = me ? leaders.findIndex(l => l.user_id === me.user_id) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myColor = myRank ? colorForRank(myRank) : '#e5e7eb';

  if (!isOpen) return null;

  return (
    <div>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', zIndex: 5000 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', zIndex: 5001 }}>
        <div style={{ width: 'min(960px, 92vw)', maxHeight: '86vh', overflow: 'auto', borderRadius: 12, padding: 24, background: 'linear-gradient(180deg, rgba(24,20,36,0.96), rgba(16,14,24,0.96))', boxShadow: '0 12px 36px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.35)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Jersey 10', fontSize: 36, color: '#f59e0b', letterSpacing: 2, textAlign: 'center' }}>🏆 Leaderboard 🏆</div>
            <button onClick={onClose} aria-label="close"
              style={{ position: 'absolute', right: 0, top: 0, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <IoClose size={44} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: 12, color: '#22d3ee', fontFamily: 'Jersey 10', fontSize: 24 }}>
              <div>Rank</div>
              <div>Player</div>
              <div>Points</div>
            </div>
            {pageItems.map((l, idx) => {
              const absoluteRank = startIdx + idx + 1;
              const color = colorForRank(absoluteRank);
              return (
                <div key={l.user_id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: 12, alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div style={{ color }}>{absoluteRank}</div>
                  <div style={{ color }}>{l.username}</div>
                  <div style={{ color }}>{l.total_points}</div>
                </div>
              );
            })}

            {leaders.length > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                <button className='play-now-btn' style={{ padding: 6 }} disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                <div style={{ color: '#9b9b9b', fontFamily: 'Jersey 10' }}>{page} / {totalPages}</div>
                <button className='play-now-btn' style={{ padding: 6 }} disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div style={{ color: '#22d3ee', fontFamily: 'Jersey 10', fontSize: 24 }}>Your Score</div>
              <div style={{ width: '100%', border: '1px solid #22d3ee', borderRadius: 6, padding: 12, display: 'grid', gridTemplateColumns: '80px 1fr 120px', color: '#d1d5db' }}>
                <div style={{ color: myColor }}>{myRank ?? '-'}</div>
                <div style={{ textAlign: 'center', color: myColor }}>{me?.username ?? 'loading...'}</div>
                <div style={{ textAlign: 'right', color: myColor }}>{me?.total_points ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;


