/**
 * The desk may be staffed from several Tavus accounts: free minutes run out,
 * so /api/reception walks this pool in order until one account opens a room.
 * Env: TAVUS_ACCOUNTS = JSON array [{key, personaId, replicaId}, ...];
 * falls back to the legacy single-account triple so an existing .env.local
 * keeps working untouched.
 */

export type TavusAccount = {
  key: string;
  personaId: string;
  replicaId: string;
};

export function tavusAccounts(): TavusAccount[] {
  const raw = process.env.TAVUS_ACCOUNTS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const pool = parsed.filter(
          (a): a is TavusAccount =>
            !!a &&
            typeof a.key === "string" &&
            a.key.length > 0 &&
            typeof a.personaId === "string" &&
            a.personaId.length > 0 &&
            typeof a.replicaId === "string" &&
            a.replicaId.length > 0,
        );
        if (pool.length) return pool;
      }
    } catch {
      // malformed JSON reads as "no pool configured" — the legacy triple below
    }
  }
  const key = process.env.TAVUS_API_KEY;
  const personaId = process.env.TAVUS_PERSONA_ID;
  const replicaId = process.env.TAVUS_REPLICA_ID;
  return key && personaId && replicaId ? [{ key, personaId, replicaId }] : [];
}
