import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class Config {
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get<T>(propertyPath: string, defaultValue?: T) {
    return this.config.get(propertyPath, defaultValue);
  }

  public getDatabaseOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.get('DB_HOST'),
      port: this.get<number>('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
}

export const config = new Config();
