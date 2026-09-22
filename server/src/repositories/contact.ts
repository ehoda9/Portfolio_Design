import { getPool } from '../db/pool.js';
import type { ContactInput } from '../lib/validate-contact.js';

export interface StoredContactMessage {
  id: number;
  createdAt: string;
}

interface ContactMessageRow {
  id: number;
  created_at: string;
}

export async function createContactMessage(input: ContactInput): Promise<StoredContactMessage> {
  const { rows } = await getPool().query<ContactMessageRow>(
    `INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING id, created_at`,
    [input.name, input.email, input.message]
  );
  return { id: rows[0].id, createdAt: rows[0].created_at };
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

/** All contact messages, newest first — admin use only. */
export async function listContactMessages(): Promise<ContactMessage[]> {
  const { rows } = await getPool().query<{ id: number; name: string; email: string; message: string; created_at: string }>(
    `SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC`
  );
  return rows.map(row => ({ id: row.id, name: row.name, email: row.email, message: row.message, createdAt: row.created_at }));
}
