import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ConsistsOfController } from 'src/education/relations/consists-of.controller';
import { UsedInController } from 'src/education/relations/used-in.controller';
import { YieldsController } from 'src/education/relations/yields.controller';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [
    YieldsController,
    ConsistsOfController,
    UsedInController,
  ],
})
export class RelationsModule {}
