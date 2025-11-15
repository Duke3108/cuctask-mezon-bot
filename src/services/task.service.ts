import { TaskEntity } from '@app/entities/task.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly repo: Repository<TaskEntity>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<TaskEntity>) {
    const task = this.repo.create(data);
    return this.repo.save(task);
  }

  async update(id: number, data: Partial<TaskEntity>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
