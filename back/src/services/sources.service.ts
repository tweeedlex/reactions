import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../entities/source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find();
  }

  async findByName(name: string): Promise<Source | null> {
    return this.sourcesRepository.findOne({
      where: { name }
    });
  }

  async create(name: string, apiKey?: string): Promise<Source> {
    const source = this.sourcesRepository.create({
      name,
      apiKey
    });
    return this.sourcesRepository.save(source);
  }

  async updateApiKey(name: string, apiKey: string): Promise<Source | null> {
    const source = await this.findByName(name);
    if (!source) {
      return null;
    }

    source.apiKey = apiKey;
    return this.sourcesRepository.save(source);
  }
}
