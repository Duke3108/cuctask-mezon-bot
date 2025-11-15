import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MezonClientService } from '@app/services/mezon-client.service';
import {
  MezonClientConfig,
  MezonModuleAsyncOptions,
} from '@app/types/mezon.types';

@Global()
@Module({})
export class MezonModule {
  static forRootAsync(options: MezonModuleAsyncOptions): DynamicModule {
    return {
      module: MezonModule,
      imports: options.imports,
      providers: [
        {
          provide: MezonClientService,
          useFactory: async (configService: ConfigService) => {
            const clientConfig: MezonClientConfig = {
              token: configService.get<string>('MEZON_TOKEN'),
              botId: configService.get<string>('MEZON_BOT_ID'),
              host: configService.get<string>('MEZON_HOST') || 'gw.mezon.ai',
              port: configService.get<string>('MEZON_PORT') || '443',
              useSSL: configService.get<boolean>('MEZON_USE_SSL') ?? true,
              timeout: configService.get<number>('MEZON_TIMEOUT') || 7000,
            };

            const client = new MezonClientService(clientConfig);

            await client.initializeClient();

            return client;
          },
          inject: [ConfigService],
        },
      ],
      exports: [MezonClientService],
    };
  }
}
