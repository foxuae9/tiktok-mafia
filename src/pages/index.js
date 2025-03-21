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

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'خطأ في التسجيل');
      }

      setSuccess('تم التسجيل بنجاح! جاري التحويل إلى صفحة المتسابقين...');
      
      // انتظر ثانيتين قبل التحويل
      setTimeout(() => {
        router.push('/bracket');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
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
        py: 4
      }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            خريطة الأبطال
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
            منصة المنافسة الأولى
          </Typography>

          <Box sx={{ mb: 4 }}>
            <img
              src="/images/championship-logo.png"
              alt="شعار خريطة الأبطال"
              style={{ width: '100px', height: '100px', margin: '0 auto' }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
            >
              <source src="/videos/FOX_Street_Fighter.mp4" type="video/mp4" />
            </video>
          </Box>

          {/* عداد اللاعبين */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              عدد اللاعبين المسجلين: {playerCount} / {maxPlayers}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: '#e3f2fd',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progress >= 100 ? '#f44336' : '#2196f3'
                }
              }}
            />
            {progress >= 100 && (
              <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
                تم اكتمال العدد المسموح به من اللاعبين
              </Typography>
            )}
          </Box>

          {!isRegistrationOpen && (
            <Alert severity="warning" sx={{ mb: 4 }}>
              عذراً، التسجيل مغلق حالياً
            </Alert>
          )}

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12}>
              <TextField
                label="أدخل نكنيم التيك توك الخاص بك"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                variant="outlined"
                fullWidth
                required
                disabled={loading || progress >= 100 || !isRegistrationOpen}
                error={!!error}
                helperText={error}
                sx={{ direction: 'rtl' }}
              />
            </Grid>
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={loading || progress >= 100 || !isRegistrationOpen}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'تسجيل'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                onClick={() => router.push('/bracket')}
              >
                مشاهدة خريطة اللاعبين
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
