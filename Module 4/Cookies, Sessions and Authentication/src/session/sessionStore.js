'use strict';

const crypto = require('crypto');

const sessions = new Map();

function pruneExpired(now = Date.now()) {
  for (const [sessionId, session] of sessions.entries()) {
    if (!session || session.expiresAt <= now) {
      sessions.delete(sessionId);
    }
  }
}

function createSession(userId, ttlMs = 30 * 60 * 1000) {
  const sessionId = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + ttlMs;

  sessions.set(sessionId, { userId, expiresAt });
  return sessionId;
}

function getSession(sessionId) {
  if (!sessionId) return null;

  pruneExpired();

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return { userId: session.userId, expiresAt: session.expiresAt };
}

function destroySession(sessionId) {
  if (!sessionId) return false;
  return sessions.delete(sessionId);
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  create: createSession,
  get: getSession,
  destroy: destroySession,
  _store: sessions,
};
