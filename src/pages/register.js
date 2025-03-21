import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from '@mui/material';

export default function Register() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/players', { nickname });
      setSuccess(true);
      setError('');
      setTimeout(() => {
        router.push('/bracket');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          التسجيل في بطولة Street Fighter
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
            تم التسجيل بنجاح! جاري تحويلك إلى صفحة المتنافسين...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nickname"
            label="اسم اللاعب"
            name="nickname"
            autoFocus
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            sx={{ direction: 'rtl' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={success}
          >
            تسجيل
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
