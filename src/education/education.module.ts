import { Module } from '@nestjs/common';
import { CurriculumModule } from 'src/education/curriculum/curriculum.module';
import { NodesModule } from 'src/education/nodes/nodes.module';
import { RelationsModule } from 'src/education/relations/relations.module';

@Module({
  imports: [
    CurriculumModule,
    NodesModule,
    RelationsModule,
  ],
})
export class EducationModule {}
