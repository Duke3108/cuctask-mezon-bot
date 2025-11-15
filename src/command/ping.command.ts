import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';

@Command('ping', {
  description: 'Check bot latency and responsiveness',
  usage: '!ping',
  category: 'Utility',
  aliases: ['p'],
})
export class PingCommand extends CommandMessage {
  execute(args: string[], message: ChannelMessage) {
    const now = Date.now();
    const msgTime = message.create_time_seconds * 1000;

    const latency = now - msgTime;

    const messageContent = `🏓 Pong! Response time: ${latency}ms`;
    return this.replyMessageGenerate({ messageContent }, message);
  }
}
