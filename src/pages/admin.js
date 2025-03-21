import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Confetti from 'react-confetti';
import axios from 'axios';

export default function Admin() {
  const [players, setPlayers] = useState([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    eliminatedPlayers: 0,
    currentRound: 1
  });
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    playerId: null,
    playerName: ''
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [winner, setWinner] = useState(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [matchDialog, setMatchDialog] = useState({
    open: false,
    player1: null,
    player2: null
  });
  const [endMatchDialog, setEndMatchDialog] = useState({
    open: false,
    matchId: null,
    players: [],
    winnerId: ''
  });
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
      
      // تحديث الإحصائيات
      const active = response.data.filter(p => !p.isEliminated).length;
      const maxRound = Math.max(...response.data.map(p => p.currentRound || 1));
      setStats({
        totalPlayers: response.data.length,
        activePlayers: active,
        eliminatedPlayers: response.data.length - active,
        currentRound: maxRound
      });
    } catch (error) {
      console.error('خطأ في جلب قائمة اللاعبين:', error);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRegistration = async () => {
    try {
      await axios.post('/api/admin/toggle-registration');
      setIsRegistrationOpen(!isRegistrationOpen);
    } catch (error) {
      console.error('خطأ في تغيير حالة التسجيل:', error);
    }
  };

  const handleEliminate = async (playerId) => {
    try {
      await axios.post('/api/players/eliminate', { playerId });
      setPlayers(players.map(p => 
        p.id === playerId ? { ...p, isEliminated: true, status: 'eliminated' } : p
      ));
      setConfirmDialog({ open: false, playerId: null, playerName: '' });
      fetchPlayers();
    } catch (error) {
      console.error('خطأ في إقصاء اللاعب:', error);
      alert('حدث خطأ أثناء إقصاء اللاعب');
    }
  };

  const handleStartMatch = async () => {
    try {
      const { player1, player2 } = matchDialog;
      await axios.post('/api/matches/start', {
        player1Id: player1.id,
        player2Id: player2.id
      });
      
      // تحديث حالة اللاعبين مباشرة في واجهة المستخدم
      setPlayers(prevPlayers => prevPlayers.map(p => 
        p.id === player1.id || p.id === player2.id
          ? { ...p, inMatch: true, matchId: `match_${Date.now()}` }
          : p
      ));
      
      setMatchDialog({ open: false, player1: null, player2: null });
      setSelectedPlayers([]);
      
      // جلب حالة اللاعبين المحدثة من الخادم
      fetchPlayers();
    } catch (error) {
      console.error('خطأ في بدء المباراة:', error);
      alert('حدث خطأ أثناء بدء المباراة');
    }
  };

  const handleEndMatch = async () => {
    try {
      const { matchId, players, winnerId } = endMatchDialog;
      const loserId = players.find(p => p.id !== winnerId).id;
      
      await axios.post('/api/matches/end', {
        matchId,
        winnerId,
        loserId
      });
      
      // تحديث حالة اللاعبين مباشرة في واجهة المستخدم
      setPlayers(prevPlayers => prevPlayers.map(p => {
        if (p.id === winnerId) {
          return { 
            ...p, 
            inMatch: false, 
            matchId: null,
            wins: (p.wins || 0) + 1,
            currentRound: p.currentRound + 1
          };
        } else if (p.id === loserId) {
          return { 
            ...p, 
            inMatch: false, 
            matchId: null,
            losses: (p.losses || 0) + 1,
            isEliminated: true,
            status: 'eliminated'
          };
        }
        return p;
      }));
      
      setEndMatchDialog({ open: false, matchId: null, players: [], winnerId: '' });
      
      // جلب حالة اللاعبين المحدثة من الخادم
      fetchPlayers();
    } catch (error) {
      console.error('خطأ في إنهاء المباراة:', error);
      alert('حدث خطأ أثناء إنهاء المباراة');
    }
  };

  const handlePlayerSelect = (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 2) {
      const newSelected = [...selectedPlayers, player];
      setSelectedPlayers(newSelected);
      
      if (newSelected.length === 2) {
        setMatchDialog({
          open: true,
          player1: newSelected[0],
          player2: newSelected[1]
        });
      }
    }
  };

  const getPlayersInGroup = () => {
    return players.filter(p => 
      !p.isEliminated && 
      (p.currentRound || 1) === selectedRound &&
      (!p.group || p.group === selectedGroup)
    );
  };

  const isPlayerSelected = (playerId) => {
    return selectedPlayers.some(p => p.id === playerId);
  };

  const handleResetTournament = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في بدء دوري جديد؟ سيتم حذف جميع البيانات الحالية.')) {
      try {
        const response = await axios.post('/api/admin/reset-tournament');
        
        if (response.data.success) {
          // تحديث الإحصائيات فوراً
          setStats({
            totalPlayers: 0,
            activePlayers: 0,
            eliminatedPlayers: 0,
            currentRound: 1
          });
          
          // تحديث قائمة اللاعبين
          setPlayers([]);
          
          // إظهار الاحتفال إذا كان هناك فائز
          if (response.data.winner) {
            setWinner(response.data.winner);
            setShowConfetti(true);
            setCelebrationOpen(true);
            
            // إيقاف الاحتفال بعد 10 ثواني
            setTimeout(() => {
              setShowConfetti(false);
              setCelebrationOpen(false);
            }, 10000);
          }
          
          // تحديث حالة التسجيل
          setIsRegistrationOpen(true);
          
          // إعادة تحميل البيانات
          await fetchPlayers();
        }
      } catch (error) {
        console.error('Error resetting tournament:', error);
        alert('حدث خطأ أثناء إعادة تعيين الدوري');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        {/* عنوان الصفحة وزر بداية دوري جديد */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          mb: 6
        }}>
          <Typography variant="h3" sx={{ 
            textAlign: 'center',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            بطولة Street Fighter
          </Typography>

          <Button
            variant="contained"
            onClick={handleResetTournament}
            startIcon={<RestartAltIcon />}
            sx={{
              background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)',
              color: '#fff',
              fontWeight: 'bold',
              padding: '15px 30px',
              fontSize: '18px',
              minWidth: '250px',
              borderRadius: '8px',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 75, 43, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            بداية دوري جديد 🏆
          </Button>
        </Box>

        {/* تأثير الكونفيتي */}
        {showConfetti && (
          <Confetti 
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={true}
            numberOfPieces={200}
            gravity={0.3}
            colors={['#FFD700', '#4a90e2', '#FF4B2B', '#50E3C2']}
          />
        )}

        {/* نافذة الاحتفال بالفائز */}
        <Dialog
          open={celebrationOpen}
          onClose={() => setCelebrationOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            color: '#fff',
            fontSize: '28px',
            fontWeight: 'bold',
            pt: 4,
            '& span': {
              display: 'block',
              fontSize: '48px',
              marginBottom: '10px'
            }
          }}>
            <span>🏆</span>
            تهانينا للفائز!
          </DialogTitle>
          <DialogContent sx={{
            textAlign: 'center',
            py: 4
          }}>
            {winner && (
              <Typography variant="h3" sx={{ 
                color: '#FFD700',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}>
                {winner.nickname}
              </Typography>
            )}
            <Typography variant="h5" sx={{ color: '#fff' }}>
              🎉 فاز بالمركز الأول في البطولة! 🎉
            </Typography>
          </DialogContent>
        </Dialog>

        {/* إحصائيات */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">إحصائيات البطولة</Typography>
            <List>
              <ListItem>
                <ListItemText primary={`إجمالي اللاعبين: ${stats.totalPlayers}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`اللاعبين النشطين: ${stats.activePlayers}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`اللاعبين المقصيين: ${stats.eliminatedPlayers}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`أعلى دور: ${stats.currentRound}`} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* المباريات الجارية */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              المباريات الجارية
            </Typography>
            {players.filter(p => p.inMatch).map((player, index) => {
              const opponent = players.find(p => 
                p.inMatch && p.matchId === player.matchId && p.id !== player.id
              );
              if (!opponent || index % 2 !== 0) return null;
              
              return (
                <Box key={player.matchId} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    مباراة: {player.nickname} ضد {opponent.nickname}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EmojiEventsIcon />}
                    onClick={() => setEndMatchDialog({
                      open: true,
                      matchId: player.matchId,
                      players: [player, opponent],
                      winnerId: ''
                    })}
                  >
                    إنهاء المباراة
                  </Button>
                </Box>
              );
            })}
            {!players.some(p => p.inMatch) && (
              <Typography variant="body2" color="text.secondary">
                لا توجد مباريات جارية
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* التحكم */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Typography>حالة التسجيل:</Typography>
              <Switch
                checked={isRegistrationOpen}
                onChange={handleToggleRegistration}
                sx={{ mx: 1 }}
              />
              <Typography>
                {isRegistrationOpen ? 'مفتوح' : 'مغلق'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* اختيار الدور والمجموعة */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={selectedRound}
              onChange={(e, newValue) => setSelectedRound(newValue)}
              aria-label="الأدوار"
            >
              <Tab label="الدور الأول" value={1} />
              <Tab label="الدور الثاني" value={2} />
              <Tab label="الدور الثالث" value={3} />
              <Tab label="النهائيات" value={4} />
            </Tabs>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Tabs
              value={selectedGroup}
              onChange={(e, newValue) => setSelectedGroup(newValue)}
              aria-label="المجموعات"
            >
              <Tab label="مجموعة A" value="A" />
              <Tab label="مجموعة B" value="B" />
              <Tab label="مجموعة C" value="C" />
              <Tab label="مجموعة D" value="D" />
            </Tabs>
          </Box>
        </Paper>

        {/* اللاعبين المختارين للمباراة */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              اللاعبين المختارين للمباراة:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedPlayers.map((player, index) => (
                <Chip
                  key={player.id}
                  label={`${index + 1}. ${player.nickname}`}
                  onDelete={() => handlePlayerSelect(player)}
                  color="primary"
                />
              ))}
              {selectedPlayers.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  اختر لاعبين للمباراة
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* جدول اللاعبين في المجموعة المحددة */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم اللاعب</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>عدد مرات الفوز</TableCell>
                <TableCell>عدد مرات الخسارة</TableCell>
                <TableCell>الدور الحالي</TableCell>
                <TableCell>المجموعة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getPlayersInGroup().map((player) => (
                <TableRow 
                  key={player.id}
                  sx={{ 
                    bgcolor: isPlayerSelected(player.id) ? '#e3f2fd' :
                            player.inMatch ? '#e8f5e9' : 'inherit',
                    cursor: !player.inMatch ? 'pointer' : 'default'
                  }}
                  onClick={() => !player.inMatch && handlePlayerSelect(player)}
                >
                  <TableCell>{player.nickname}</TableCell>
                  <TableCell>
                    <Chip 
                      label={player.inMatch ? 'في مباراة' : 'نشط'}
                      color={player.inMatch ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{player.wins || 0}</TableCell>
                  <TableCell>{player.losses || 0}</TableCell>
                  <TableCell>الدور {player.currentRound || 1}</TableCell>
                  <TableCell>مجموعة {player.group || selectedGroup}</TableCell>
                  <TableCell>
                    {!player.inMatch && (
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerSelect(player);
                        }}
                      >
                        <SportsEsportsIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* مربع حوار بدء المباراة */}
        <Dialog
          open={matchDialog.open}
          onClose={() => {
            setMatchDialog({ open: false, player1: null, player2: null });
            setSelectedPlayers([]);
          }}
        >
          <DialogTitle>بدء مباراة جديدة</DialogTitle>
          <DialogContent>
            <Typography>
              هل تريد بدء مباراة بين:
              <br />
              {matchDialog.player1?.nickname} و {matchDialog.player2?.nickname}؟
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setMatchDialog({ open: false, player1: null, player2: null });
                setSelectedPlayers([]);
              }}
            >
              إلغاء
            </Button>
            <Button 
              color="primary" 
              variant="contained"
              onClick={handleStartMatch}
            >
              بدء المباراة
            </Button>
          </DialogActions>
        </Dialog>

        {/* مربع حوار إنهاء المباراة */}
        <Dialog
          open={endMatchDialog.open}
          onClose={() => setEndMatchDialog({ open: false, matchId: null, players: [], winnerId: '' })}
        >
          <DialogTitle>إنهاء المباراة</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              اختر الفائز في المباراة:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>الفائز</InputLabel>
              <Select
                value={endMatchDialog.winnerId}
                onChange={(e) => setEndMatchDialog({ ...endMatchDialog, winnerId: e.target.value })}
                label="الفائز"
              >
                {endMatchDialog.players.map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.nickname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEndMatchDialog({ open: false, matchId: null, players: [], winnerId: '' })}
            >
              إلغاء
            </Button>
            <Button 
              color="primary" 
              variant="contained"
              onClick={handleEndMatch}
              disabled={!endMatchDialog.winnerId}
            >
              إنهاء المباراة
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
