// Logger クラス - 統一されたログ出力

export class Logger {
  constructor(name, options = {}) {
    this.name = name;
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.timestamp = options.timestamp !== false;
  }

  _formatMessage(emoji, ...args) {
    const time = this.timestamp ? `[${new Date().toISOString()}]` : '';
    const prefix = `${time} ${emoji} [${this.name}]`;
    return [prefix, ...args];
  }

  _shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.level);
    const requestedIndex = levels.indexOf(level);
    return requestedIndex >= currentIndex;
  }

  debug(...args) {
    if (this._shouldLog('debug')) {
      console.debug(...this._formatMessage('🐛', ...args));
    }
  }

  info(...args) {
    if (this._shouldLog('info')) {
      console.info(...this._formatMessage('ℹ️', ...args));
    }
  }

  warn(...args) {
    if (this._shouldLog('warn')) {
      console.warn(...this._formatMessage('⚠️', ...args));
    }
  }

  error(...args) {
    if (this._shouldLog('error')) {
      console.error(...this._formatMessage('❌', ...args));
    }
  }

  success(...args) {
    if (this._shouldLog('info')) {
      console.log(...this._formatMessage('✅', ...args));
    }
  }
}

export function createLogger(name, options) {
  return new Logger(name, options);
}
