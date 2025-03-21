import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import styles from '@/styles/Bracket.module.css';

export default function Bracket() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('جاري جلب بيانات اللاعبين...');
        const response = await axios.get('/api/players');
        console.log('تم استلام البيانات:', response.data);
        setPlayers(response.data);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('خطأ في جلب بيانات اللاعبين:', error);
        setError('حدث خطأ في جلب بيانات اللاعبين');
        setLoading(false);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const groupPlayers = () => {
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.currentRound === b.currentRound) {
        return b.wins - a.wins;
      }
      return b.currentRound - a.currentRound;
    });

    const winner = sortedPlayers.find(p => p.currentRound === 5 && !p.isEliminated);
    const remainingPlayers = sortedPlayers.filter(p => p !== winner);
    const halfPoint = Math.ceil(remainingPlayers.length / 2);

    return {
      leftSide: remainingPlayers.slice(0, halfPoint),
      rightSide: remainingPlayers.slice(halfPoint),
      winner
    };
  };

  const { leftSide, rightSide, winner } = groupPlayers();

  const renderBracket = () => {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image 
              src="/images/LO.png" 
              alt="FOXUAE35" 
              width={100}
              height={100}
              priority
            />
            <h1>خريطة الأبطال</h1>
          </div>
        </div>
        
        <div className={styles.bracket}>
          {/* الجانب الأيسر */}
          <div className={styles.side}>
            {leftSide.map((player) => (
              <div key={player.id} className={styles.match}>
                <div className={`${styles.player} ${player.isEliminated ? styles.eliminated : ''}`}>
                  <div className={styles.playerInfo}>
                    <span>{player.nickname}</span>
                    <small>الجولة: {player.currentRound} | فوز: {player.wins}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* الفائز */}
          <div className={styles.center}>
            <div className={styles.winner}>
              <div className={styles.trophy}>🏆</div>
              {winner && (
                <div className={styles.playerInfo}>
                  <div className={styles.player}>
                    <span>{winner.nickname}</span>
                    <small>انتصارات: {winner.wins}</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن */}
          <div className={styles.side}>
            {rightSide.map((player) => (
              <div key={player.id} className={styles.match}>
                <div className={`${styles.player} ${player.isEliminated ? styles.eliminated : ''}`}>
                  <div className={styles.playerInfo}>
                    <span>{player.nickname}</span>
                    <small>الجولة: {player.currentRound} | فوز: {player.wins}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>جاري تحميل خريطة المتسابقين...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ 
          textAlign: 'center', 
          mt: 4, 
          color: 'error.main',
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      </Container>
    );
  }

  if (players.length === 0) {
    return (
      <Container>
        <Box sx={{ 
          textAlign: 'center', 
          mt: 4,
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="h6">لا يوجد متسابقين حالياً</Typography>
        </Box>
      </Container>
    );
  }

  return renderBracket();
}
