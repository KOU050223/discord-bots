import type { StorageAdapter } from './types.js';

export interface ActionLogEntry {
  ts: string;
  feature: 'kawaii' | 'eyes-lips' | 'gacha';
  action: string;
  user?: string;
  extra?: Record<string, string>;
}

function dateKeyForTs(botName: string, ts: string): string {
  return `logs:${botName}:${ts.slice(0, 10)}`; // YYYY-MM-DD
}

function parseLogArray(raw: string | null): ActionLogEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActionLogEntry[]) : [];
  } catch {
    return [];
  }
}

export class KVLogSink {
  private static readonly MAX_BUFFER_SIZE = 10_000;

  private storage: StorageAdapter;
  private botName: string;
  private buffer: ActionLogEntry[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing: Promise<void> | null = null;

  constructor(storage: StorageAdapter, botName: string, flushIntervalMs = 60_000) {
    this.storage = storage;
    this.botName = botName;
    this.timer = setInterval(() => void this.flush(), flushIntervalMs);
    // Node.js がタイマーだけのためにプロセスを維持しないようにする
    if (this.timer.unref) this.timer.unref();
  }

  record(entry: Omit<ActionLogEntry, 'ts'>): void {
    if (this.buffer.length >= KVLogSink.MAX_BUFFER_SIZE) {
      this.buffer.shift(); // 古いデータを破棄
    }
    this.buffer.push({ ts: new Date().toISOString(), ...entry });
  }

  flush(): Promise<void> {
    // 同時実行を防ぐ: 進行中のフラッシュが終わってから次を実行する
    this.flushing = (this.flushing ?? Promise.resolve()).then(() => this._doFlush());
    return this.flushing;
  }

  private async _doFlush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const toWrite = this.buffer.splice(0);

    // ts 基準で日付ごとにバケットに分割する（日跨ぎ対応）
    const buckets = new Map<string, ActionLogEntry[]>();
    for (const entry of toWrite) {
      const key = dateKeyForTs(this.botName, entry.ts);
      const arr = buckets.get(key) ?? [];
      arr.push(entry);
      buckets.set(key, arr);
    }

    try {
      for (const [key, batch] of buckets) {
        const existing = await this.storage.get(key);
        const prev = parseLogArray(existing);
        await this.storage.put(key, JSON.stringify([...prev, ...batch]));
      }
    } catch {
      // フラッシュ失敗時はバッファに戻して次回リトライ
      this.buffer.unshift(...toWrite);
    }
  }

  async destroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.flush();
  }
}
