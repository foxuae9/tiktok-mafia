import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export async function getDatabase() {
    if (db) {
        return db;
    }

    db = await open({
        filename: './data/tournament.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            isEliminated BOOLEAN DEFAULT 0,
            inMatch BOOLEAN DEFAULT 0,
            position INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player1_id INTEGER,
            player2_id INTEGER,
            winner_id INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player1_id) REFERENCES players(id),
            FOREIGN KEY (player2_id) REFERENCES players(id),
            FOREIGN KEY (winner_id) REFERENCES players(id)
        );

        CREATE TABLE IF NOT EXISTS tournament_status (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            registration_open BOOLEAN DEFAULT 1
        );
    `);

    return db;
}
