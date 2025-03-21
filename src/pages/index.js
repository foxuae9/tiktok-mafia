import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, statusRes] = await Promise.all([
          axios.get('/api/players'),
          axios.get('/api/admin/registration-status')
        ]);
        
        const activePlayers = playersRes.data.filter(p => !p.isEliminated);
        setPlayerCount(activePlayers.length);
        setIsRegistrationOpen(statusRes.data.isOpen);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistrationOpen) {
      setError('عذراً، التسجيل مغلق حالياً');
      return;
    }

    if (!nickname || nickname.trim() === '') {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/players', { 
        nickname: nickname.trim() 
      });

      setSuccess('تم التسجيل بنجاح! جاري التحويل إلى صفحة المتسابقين...');
      
      // انتظر ثانيتين قبل التحويل
      setTimeout(() => {
        router.push('/bracket');
      }, 2000);
      
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      setError(error.response?.data?.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const maxPlayers = 32;
  const progress = (playerCount / maxPlayers) * 100;

  return (
    <Container maxWidth="lg">
      <Head>
        <title>خريطة الأبطال</title>
        <meta name="description" content="خريطة الأبطال - منصة المنافسة الأولى" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
        textAlign: 'center'
      }}>
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 600,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
            خريطة الأبطال
          </Typography>

          <Typography variant="h6" gutterBottom color="text.secondary">
            سجل الآن للمشاركة في المنافسة
          </Typography>

          {!isRegistrationOpen && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              التسجيل مغلق حالياً
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              عدد المشاركين: {playerCount} / {maxPlayers}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 100 ? 'error.main' : 'primary.main'
                }
              }}
            />
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نكنيم التيك توك"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={loading || !isRegistrationOpen}
                  required
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !isRegistrationOpen}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    position: 'relative'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'تسجيل'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
