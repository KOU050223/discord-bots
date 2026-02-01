// Error Handler - Discord Client のエラーハンドリング統一

export function setupErrorHandlers(client, logger) {
  // Discord クライアントのエラー
  client.on('error', (error) => {
    logger.error('Discord クライアントエラー:', error);
  });

  // Discord 警告
  client.on('warn', (warning) => {
    logger.warn('Discord 警告:', warning);
  });

  // 未処理の Promise rejection
  process.on('unhandledRejection', (error) => {
    logger.error('未処理の Promise rejection:', error);
  });

  // 未処理の例外
  process.on('uncaughtException', (error) => {
    logger.error('未処理の例外:', error);
    process.exit(1);
  });
}
