import { Test, TestingModule } from '@nestjs/testing';
import { PipedriveController } from './pipedrive.controller';

describe('PipedriveController', () => {
  let controller: PipedriveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipedriveController],
    }).compile();

    controller = module.get<PipedriveController>(PipedriveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
