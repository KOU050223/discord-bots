import type { Logger } from '../logger/index.js';

type ShutdownHandler = () => Promise<void> | void;

export class ShutdownManager {
  private logger: Logger;
  private handlers: ShutdownHandler[];
  private signals: NodeJS.Signals[];

  constructor(logger: Logger) {
    this.logger = logger;
    this.handlers = [];
    this.signals = ['SIGINT', 'SIGTERM'];
  }

  onShutdown(handler: ShutdownHandler): void {
    this.handlers.push(handler);
  }

  register(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`\nシャットダウンシグナルを受信: ${signal}`);
      try {
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

export function createShutdownManager(logger: Logger): ShutdownManager {
  return new ShutdownManager(logger);
}
