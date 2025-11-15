import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { ChannelMessage } from 'mezon-sdk';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MezonClientService } from '@app/services/mezon-client.service';
import { TaskService } from '@app/services/task.service';

function parseTime(input?: string): Date | undefined {
  if (!input) return undefined;
  const now = new Date();
  if (/^\d{1,2}:\d{2}$/.test(input.trim())) {
    const [h, m] = input.split(':').map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  }
  const parsed = new Date(input);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

const text = `
          **📘 Hướng dẫn sử dụng lệnh \`!task\`**

          **1️⃣ Thêm task mới:**
          \`!task add <nội dung> /deadline [hh:mm] /remind [hh:mm]\`
          → Ví dụ: \`!task add Viết báo cáo /deadline 17:00 /remind 16:45\`

          **2️⃣ Xem danh sách task:**
          \`!task list\`

          **3️⃣ Đánh dấu hoàn thành:**
          \`!task done <id>\`
          → Ví dụ: \`!task done 3\`

          **4️⃣ Chỉnh sửa deadline hoặc thời gian nhắc:**
          \`!task edit <id> /deadline [hh:mm] /remind [hh:mm]\`
          → Ví dụ: \`!task edit 2 /deadline 09:00 /remind 08:30\`

          **5️⃣ Xoá task:**
          \`!task remove <id>\`
          → Ví dụ: \`!task remove 5\`

          ---

          **💡 Gợi ý:**   
          - Bot sẽ tự nhắc nhở khi đến giờ trong \`/remind\`.
        `;

@Command('task', {
  description: 'Quản lý task có deadline & nhắc nhở (dùng DB)',
  usage:
    '!task add <nội dung> /deadline [hh:mm|yyyy-mm-dd hh:mm] /remind [hh:mm|yyyy-mm-dd hh:mm]',
  category: 'Utility',
  aliases: ['tasks', 'todo'],
})
export class TaskCommand extends CommandMessage {
  private static replyFn: ((msg: string, channelId: string) => void) | null =
    null;

  constructor(
    private readonly mezonClient: MezonClientService,
    private readonly taskService: TaskService,
  ) {
    super();
    if (!TaskCommand.replyFn) {
      TaskCommand.replyFn = async (msg, channelId) => {
        try {
          await this.mezonClient
            .getClient()
            .channels.get(channelId)
            .send({ t: msg });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      };
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleRemindCheck() {
    const tasks = await this.taskService.findAll();
    const nowMin = Math.floor(Date.now() / 60_000);

    for (const task of tasks) {
      if (!task.done && task.remindAt && !task.reminded) {
        const remindMin = Math.floor(task.remindAt.getTime() / 60_000);
        if (nowMin === remindMin && task.channelId && TaskCommand.replyFn) {
          TaskCommand.replyFn(
            `🔔 Nhắc nhở task #${task.id}: ${task.content}\n📅 Deadline: ${task.deadline
              ? task.deadline.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
              : 'Không có'
            }`,
            task.channelId,
          );
          await this.taskService.update(task.id, { reminded: true });
        }
      }
    }
  }

  async execute(args: string[], message: ChannelMessage) {
    const channelId = message.channel_id;
    if (!args.length) {
      return this.replyMessageGenerate(
        { messageContent: text },
        message,
      );
    }

    const [action, ...rest] = args;
    let response = '';

    switch (action.toLowerCase()) {
      case 'add': {
        const fullText = rest.join(' ').trim();
        if (!fullText) {
          response = '⚠️ Hãy nhập nội dung task: `!task add <nội dung>`';
          break;
        }

        const deadlineMatch = fullText.match(/\/deadline\s+([\d-:\s]+)/i);
        const remindMatch = fullText.match(/\/remind\s+([\d-:\s]+)/i);

        const content = fullText
          .replace(/\/deadline\s+[\d-:\s]+/i, '')
          .replace(/\/remind\s+[\d-:\s]+/i, '')
          .trim();

        const newTask = await this.taskService.create({
          content,
          done: false,
          channelId,
          deadline: parseTime(deadlineMatch?.[1]?.trim()),
          remindAt: parseTime(remindMatch?.[1]?.trim()),
          reminded: false,
        });

        response =
          `✅ Đã thêm task #${newTask.id}: ${newTask.content}\n` +
          (newTask.deadline
            ? `⏰ Deadline: ${newTask.deadline.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}\n`
            : '') +
          (newTask.remindAt
            ? `🔔 Nhắc vào: ${newTask.remindAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
            : '');
        break;
      }

      case 'list': {
        const tasks = await this.taskService.findAll();
        if (!tasks.length) {
          response = '📭 Chưa có task nào.';
          break;
        }
        response = tasks
          .map(
            (t) =>
              `${t.done ? '✅' : '🕒'} [${t.id}] ${t.content}` +
              (t.deadline
                ? `\n   ⏰ Deadline: ${t.deadline.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
                : '') +
              (t.remindAt
                ? `\n   🔔 Nhắc: ${t.remindAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
                : ''),
          )
          .join('\n\n');
        break;
      }

      case 'done': {
        const id = parseInt(rest[0]);
        const task = await this.taskService.findById(id);
        if (!task) {
          response = `❌ Không tìm thấy task #${id}.`;
          break;
        }
        await this.taskService.update(id, { done: true });
        response = `✅ Đã hoàn thành task #${id}: ${task.content}`;
        break;
      }

      case 'remove': {
        const id = parseInt(rest[0]);
        const task = await this.taskService.findById(id);
        if (!task) {
          response = `❌ Không tìm thấy task #${id}.`;
          break;
        }
        await this.taskService.remove(id);
        response = `🗑️ Đã xoá task #${task.id}: ${task.content}`;
        break;
      }

      case 'edit': {
        const id = parseInt(rest[0]);
        const fullText = rest.slice(1).join(' ');
        const newDeadline = fullText
          .match(/\/deadline\s+([\d-:\s]+)/i)?.[1]
          ?.trim();
        const newRemind = fullText
          .match(/\/remind\s+([\d-:\s]+)/i)?.[1]
          ?.trim();

        const task = await this.taskService.findById(id);
        if (!task) {
          response = `❌ Không tìm thấy task #${id}.`;
          break;
        }

        const updated = await this.taskService.update(id, {
          deadline: newDeadline ? parseTime(newDeadline) : task.deadline,
          remindAt: newRemind ? parseTime(newRemind) : task.remindAt,
          reminded: false,
        });

        response =
          `✏️ Đã cập nhật task #${updated.id}\n` +
          (updated.deadline
            ? `⏰ Deadline: ${updated.deadline.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}\n`
            : '') +
          (updated.remindAt
            ? `🔔 Nhắc: ${updated.remindAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`
            : '');
        break;
      }

      default:
        response = text;
    }

    const messageContent = `**📋 TASK PANEL**\n${response}`;
    return this.replyMessageGenerate({ messageContent }, message);
  }
}
