import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function Admin() {
  const [players, setPlayers] = useState([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, statusRes] = await Promise.all([
        axios.get('/api/players'),
        axios.get('/api/admin/registration-status')
      ]);
      
      setPlayers(playersRes.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setIsRegistrationOpen(statusRes.data.isOpen);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setError('حدث خطأ في جلب البيانات');
      setLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/registration-status', {
        isOpen: !isRegistrationOpen
      });
      setIsRegistrationOpen(!isRegistrationOpen);
      setSuccess('تم تحديث حالة التسجيل بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('خطأ في تحديث حالة التسجيل:', error);
      setError('حدث خطأ في تحديث حالة التسجيل');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminatePlayer = async (playerId) => {
    try {
      setLoading(true);
      await axios.post(`/api/players/${playerId}/eliminate`);
      await fetchData();
      setSuccess('تم إقصاء اللاعب بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('خطأ في إقصاء اللاعب:', error);
      setError('حدث خطأ في إقصاء اللاعب');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && players.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          لوحة التحكم
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography>حالة التسجيل:</Typography>
          <Switch
            checked={isRegistrationOpen}
            onChange={handleToggleRegistration}
            disabled={loading}
          />
          <Typography color={isRegistrationOpen ? 'primary' : 'error'}>
            {isRegistrationOpen ? 'مفتوح' : 'مغلق'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الترتيب</TableCell>
                <TableCell>اسم اللاعب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>وقت التسجيل</TableCell>
                <TableCell>إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player, index) => (
                <TableRow key={player._id} sx={{
                  backgroundColor: player.isEliminated ? 'rgba(244, 67, 54, 0.1)' : 'inherit'
                }}>
                  <TableCell>{player.position || index + 1}</TableCell>
                  <TableCell>{player.nickname}</TableCell>
                  <TableCell>
                    <Typography color={player.isEliminated ? 'error' : 'success'}>
                      {player.isEliminated ? 'مقصى' : 'مشارك'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(player.createdAt).toLocaleString('ar-AE')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      disabled={player.isEliminated || loading}
                      onClick={() => handleEliminatePlayer(player._id)}
                    >
                      إقصاء
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
