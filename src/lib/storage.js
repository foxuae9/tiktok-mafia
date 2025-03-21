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
    players.push(player);
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    return player;
  } catch (error) {
    console.error('❌ خطأ في إضافة اللاعب:', error);
    throw error;
  }
}

export function updatePlayers(players) {
  try {
    ensureDataFile();
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify({ players }, null, 2));
    return players;
  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات اللاعبين:', error);
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
