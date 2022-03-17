import { Module } from '@nestjs/common';
import { CurriculumController } from 'src/education/curriculum/curriculum.controller';

@Module({
  controllers: [
    CurriculumController,
  ],
})
export class CurriculumModule {}
