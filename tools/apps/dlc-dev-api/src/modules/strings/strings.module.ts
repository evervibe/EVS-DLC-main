import { Module } from '@nestjs/common';
import { StringsController } from './strings.controller';
import { StringsService } from './strings.service';
import { StringsEditorService } from './strings-editor.service';

@Module({
  controllers: [StringsController],
  providers: [StringsService, StringsEditorService],
})
export class StringsModule {}
