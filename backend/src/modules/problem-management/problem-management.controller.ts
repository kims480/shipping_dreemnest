import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProblemManagementService } from './problem-management.service';
import { ProblemSource, ProblemStatus } from './entities/problem-record.entity';

interface RaiseProblemDto {
  workOrderId: string;
  source: ProblemSource;
  category: string;
  description: string;
}

@ApiTags('problem-management')
@Controller('problems')
export class ProblemManagementController {
  constructor(private readonly problemService: ProblemManagementService) {}

  @Get()
  findAll(@Query('status') status?: ProblemStatus) {
    return this.problemService.findAll(status);
  }

  @Post()
  raise(@Body() dto: RaiseProblemDto) {
    return this.problemService.raise(dto);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body('userId') userId: string) {
    return this.problemService.assign(id, userId);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Body('resolutionNotes') resolutionNotes: string) {
    return this.problemService.resolve(id, resolutionNotes);
  }
}
