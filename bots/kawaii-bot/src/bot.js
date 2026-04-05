import { EmbedBuilder } from 'discord.js';
import { createLogger } from '@discord-bots/shared';
import { createDiscordClient, IntentPresets, setupErrorHandlers } from '@discord-bots/utils';
import { config } from './config.js';

const logger = createLogger('kawaii-bot');

// Discord Client の作成
export const client = createDiscordClient({
  intents: IntentPresets.REACTION_MONITOR
});

// エラーハンドラーの設定
setupErrorHandlers(client, logger);

// Bot準備完了
client.once('ready', () => {
  logger.success(`${client.user.tag} としてログインしました`);
  logger.info(`リアクション監視: ${config.emoji.name}`);
  logger.info(`転送先チャンネルID: ${config.FORWARD_CHANNEL_ID}`);
});

// リアクション追加イベント
client.on('messageReactionAdd', async (reaction, user) => {
  try {
    // Botのリアクションは無視
    if (user.bot) return;

    // partial判定と補完（リアクション）
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        logger.error('リアクション情報補完失敗:', error.message);
        return;
      }
    }

    // 対象リアクションかチェック
    if (reaction.emoji.name !== config.emoji.name) return;

    // partial判定と補完（メッセージ）
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (error) {
        logger.error('メッセージ情報補完失敗:', error.message);
        return;
      }
    }

    // 転送先チャンネルを取得
    const forwardChannel = client.channels.cache.get(config.FORWARD_CHANNEL_ID);
    if (!forwardChannel) {
      logger.error('転送先チャンネルが見つかりません');
      return;
    }

    if (!forwardChannel.isTextBased()) {
      logger.error('転送先チャンネルはテキストチャンネルではありません');
      return;
    }

    // 権限チェック
    const permissions = forwardChannel.permissionsFor(client.user);
    if (!permissions || !permissions.has(['SendMessages', 'EmbedLinks'])) {
      logger.error('転送先チャンネルへの送信権限がありません');
      return;
    }

    // Embedを構築して送信
    const embed = createMessageEmbed(reaction.message, user);
    await forwardChannel.send({ embeds: [embed] });

    logger.info(
      `メッセージを転送しました`,
      `リアクション: ${reaction.emoji.name}`,
      `元メッセージID: ${reaction.message.id}`,
      `送信者: ${user.tag}`
    );

  } catch (error) {
    logger.error('メッセージ転送エラー:', error.message);
  }
});

// ログイン関数
export function login() {
  return client.login(config.DISCORD_TOKEN);
}

// Embedを構築
function createMessageEmbed(message, reactor) {
  const embed = new EmbedBuilder()
    .setTitle('リアクションで共有されました')
    .setDescription(message.content || '（内容なし）')
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL()
    })
    .addFields(
      {
        name: 'チャンネル',
        value: `#${message.channel.name || 'DM'}`,
        inline: true
      },
      {
        name: '反応したユーザー',
        value: reactor.tag,
        inline: true
      },
      {
        name: '送信日時',
        value: message.createdAt.toLocaleString('ja-JP'),
        inline: false
      }
    )
    .setURL(message.url)
    .setColor(0x9c27b0)  // 紫系
    .setTimestamp();

  // 添付ファイル情報
  if (message.attachments.size > 0) {
    const attachmentList = message.attachments
      .map((att, idx) => `[${idx + 1}] ${att.name} (${(att.size / 1024).toFixed(2)} KB)`)
      .join('\n');

    embed.addFields({
      name: '添付ファイル',
      value: attachmentList,
      inline: false
    });
  }

  return embed;
}
