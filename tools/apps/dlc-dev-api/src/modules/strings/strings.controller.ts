import { Controller, Get, Query, Param, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { StringsService } from './strings.service';

@Controller('data/strings')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class StringsController {
  constructor(private readonly svc: StringsService) {}

  @Get()
  search(
    @Query('q') q?: string,
    @Query('lang') lang?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.svc.search({
      q,
      lang,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  byId(@Param('id', ParseIntPipe) id: number, @Query('lang') lang?: string) {
    return this.svc.byId(id, lang);
  }
}
