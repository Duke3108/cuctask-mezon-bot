import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';

@Command('about', {
  description: 'Information about the Mezon bot',
  usage: '!about',
  category: 'General',
  aliases: ['info'],
})
export class AboutCommand extends CommandMessage {
  execute(args: string[], message: ChannelMessage) {
    const messageContent = [
      '🤖 **Mezon Bot**',
      '',
      '**Version:** 1.0.0',
      '**Framework:** NestJS with TypeScript',
      '**Platform:** Mezon Chat',
      '',
      '**Features:**',
      '',
      '**Author:** Khuu Tien Tuoc',
      '**Repository:** https://github.com/Duke3108/cuctask-mezon-bot.git',
    ].join('\n');

    return this.replyMessageGenerate(
      {
        messageContent,
        mk: [{ type: 'pre', s: 0, e: messageContent.length }],
      },
      message,
    );
  }
}
