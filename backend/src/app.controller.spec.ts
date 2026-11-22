import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: DataSource, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-api-key') } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('Google Maps config', () => {
    it('should return the API key from the environment config', () => {
      expect(appController.getGoogleMapsConfig()).toEqual({ apiKey: 'test-api-key' });
    });
  });
});
