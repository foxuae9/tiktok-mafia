import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

// التأكد من وجود مجلد البيانات وملف اللاعبين
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PLAYERS_FILE)) {
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players: [] }));
  }
}

export function getPlayers() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(PLAYERS_FILE, 'utf8');
    const { players } = JSON.parse(data);
    return players;
  } catch (error) {
    console.error('❌ خطأ في قراءة بيانات اللاعبين:', error);
    return [];
  }
}

export function addPlayer(player) {
  try {
    ensureDataFile();
    const players = getPlayers();
    // التحقق من وجود اللاعب
    const exists = players.some(p => p.nickname.toLowerCase() === player.nickname.toLowerCase());
    if (exists) {
      throw new Error('هذا الاسم مسجل مسبقاً');
    }

    // إضافة اللاعب
    const newPlayer = {
      id: Date.now().toString(),
      nickname: player.nickname,
      status: 'active',
      wins: 0,
      losses: 0,
      isEliminated: false,
      currentRound: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    players.push(newPlayer);
    
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    return newPlayer;
  } catch (error) {
    console.error('❌ خطأ في إضافة اللاعب:', error);
    throw error;
  }
}

export function updatePlayer(playerId, updates) {
  try {
    ensureDataFile();
    const players = getPlayers();
    
    const index = players.findIndex(p => p.id === playerId);
    if (index === -1) {
      throw new Error('اللاعب غير موجود');
    }

    players[index] = {
      ...players[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    
    return players[index];
  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات اللاعب:', error);
    throw error;
  }
}

export function resetTournament() {
  try {
    ensureDataFile();
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players: [] }, null, 2));
    console.log('✅ تم إعادة تعيين البطولة بنجاح');
  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين البطولة:', error);
    throw error;
  }
}
