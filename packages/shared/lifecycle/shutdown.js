// Shutdown Manager - グレースフルシャットダウン

export class ShutdownManager {
  constructor(logger) {
    this.logger = logger;
    this.handlers = [];
    this.signals = ['SIGINT', 'SIGTERM'];
  }

  // クリーンアップハンドラーを登録
  onShutdown(handler) {
    this.handlers.push(handler);
  }

  // Signal リスナーを設定
  register() {
    const shutdown = async (signal) => {
      this.logger.info(`\nシャットダウンシグナルを受信: ${signal}`);

      try {
        // 登録されたハンドラーを順次実行
        for (const handler of this.handlers) {
          await handler();
        }
        this.logger.success('シャットダウン完了');
        process.exit(0);
      } catch (error) {
        this.logger.error('シャットダウン中にエラー:', error);
        process.exit(1);
      }
    };

    for (const signal of this.signals) {
      process.on(signal, () => shutdown(signal));
    }
  }
}

export function createShutdownManager(logger) {
  return new ShutdownManager(logger);
}
