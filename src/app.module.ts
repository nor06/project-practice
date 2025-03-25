import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables globally
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Necessary for Supabase connections
      },
      autoLoadEntities: true,
      synchronize: true, // Turn off in production to prevent schema overwrites
      logging: true, // Debugging queries and connection issues
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
