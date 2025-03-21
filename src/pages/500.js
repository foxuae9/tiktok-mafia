import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export default function Custom500() {
  const router = useRouter();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          500
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          عذراً، حدث خطأ في الخادم
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/')}
          sx={{ mt: 4 }}
        >
          العودة للصفحة الرئيسية
        </Button>
      </Box>
    </Container>
  );
}
