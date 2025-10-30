import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../infrastucture/prisma/company.repository';

@Injectable()
export class CompanyFinderService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async findAll() {
    return this.companyRepository.findAll();
  }

  async findByAdminId(adminId: number) {
    return this.companyRepository.findByAdminId(adminId); // ← ya lo tienes hecho
  }
}