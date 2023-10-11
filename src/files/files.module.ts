import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterConfigService } from './multer.config';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
