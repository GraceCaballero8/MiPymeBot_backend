import { Controller, Get, Injectable } from '@nestjs/common';
import { RoleFinderService } from '../application/services/role-finder.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleFinderService: RoleFinderService) {}

  @Get()
  async findAll() {
    return await this.roleFinderService.findAll();
  }
}
