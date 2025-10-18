import { 
  Controller, Get, Post, Patch, Query, Param, ParseIntPipe, 
  Body, UsePipes, ValidationPipe, UseGuards, Request 
} from '@nestjs/common';
import { StringsService } from './strings.service';
import { StringsEditorService } from './strings-editor.service';
import { EditStringDto, UpdateStateDto } from './dto/edit-string.dto';
import { JwtAuthGuard } from '../../common/middleware/auth.guard';
import { Roles } from '../../common/rbac/roles.decorator';
import { RolesGuard } from '../../common/rbac/roles.guard';
import { UserRole } from '../../common/rbac/roles';

@Controller('data/strings')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class StringsController {
  constructor(
    private readonly svc: StringsService,
    private readonly editorSvc: StringsEditorService,
  ) {}

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

  /**
   * Edit a string (requires translator role)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRANSLATOR)
  async editString(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditStringDto,
    @Request() req: any,
  ) {
    const actor = req.user?.username || 'unknown';
    return this.editorSvc.editString(id, dto, actor);
  }

  /**
   * Get edit history for a string
   */
  @Get(':id/history')
  async getHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.editorSvc.getHistory(id, lang);
  }

  /**
   * Update workflow state (requires reviewer role)
   */
  @Post(':id/state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.REVIEWER)
  async updateState(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStateDto,
    @Request() req: any,
  ) {
    const actor = req.user?.username || 'unknown';
    return this.editorSvc.updateState(id, dto, actor);
  }

  /**
   * Get workflow state for a string
   */
  @Get(':id/state')
  async getState(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    if (lang) {
      return this.editorSvc.getState(id, lang);
    } else {
      return this.editorSvc.getAllStates(id);
    }
  }
}
