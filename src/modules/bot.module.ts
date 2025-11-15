import { HelpCommand } from '@app/command/help.command';
import { PingCommand } from '@app/command/ping.command';
import { AboutCommand } from '@app/command/about.command';
import { ClientConfigService } from '@app/config/client.config';
import { BotGateway } from '@app/gateway/bot.gateway';
import { EventListenerChannelMessage } from '@app/listeners';
import { CommandService } from '@app/services/command.service';
import { MessageCommand } from '@app/services/message-command.service';
import { MessageQueue } from '@app/services/message-queue.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskCommand } from '@app/command/task.command';
import { TaskService } from '@app/services/task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '@app/entities/task.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TaskEntity]),
  ],
  providers: [
    BotGateway,
    ClientConfigService,
    ConfigService,
    CommandService,
    MessageQueue,
    MessageCommand,
    TaskService,

    // Listeners
    EventListenerChannelMessage,

    // Commands
    HelpCommand,
    PingCommand,
    AboutCommand,
    TaskCommand,
  ],
  controllers: [],
})
export class BotModule {}
