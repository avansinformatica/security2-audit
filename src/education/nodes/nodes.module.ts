import { Module } from '@nestjs/common';
import { AccessAuthGuard } from 'src/auth/access.guard';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DegreeController } from 'src/education/nodes/degree.controller';
import { ProgramController } from 'src/education/nodes/program.controller';
import { ResultController } from 'src/education/nodes/result.controller';
import { UnitController } from 'src/education/nodes/unit.controller';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    ProgramController,
    DegreeController,
    UnitController,
    ResultController,
  ],
})
export class NodesModule {}
