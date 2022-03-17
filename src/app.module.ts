import { Module } from '@nestjs/common';
import { Neo4jModule } from './neo4j/neo4j.module';
import { EducationModule } from './education/education.module';
// import { AuthModule } from './auth/auth.module';
import { Neo4jScheme } from './neo4j/neo4j.config';
import { AUTH_CONFIG } from './auth/auth.config';
import { CredentialAuthGuard } from './auth/credential.guard';
import { RefreshAuthGuard } from './auth/refresh.guard';
import { AccessAuthGuard } from './auth/access.guard';
import { AuthService } from './auth/auth.service';
import { UserService } from './auth/user.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { CurriculumController } from './education/curriculum/curriculum.controller';
import { ProgramController } from './education/nodes/program.controller';
import { UnitController } from './education/nodes/unit.controller';
import { ResultController } from './education/nodes/result.controller';
import { DegreeController } from './education/nodes/degree.controller';
import { YieldsController } from './education/relations/yields.controller';
import { UsedInController } from './education/relations/used-in.controller';
import { ConsistsOfController } from './education/relations/consists-of.controller';

@Module({
  imports: [
    Neo4jModule.forRoot({
      scheme: process.env.NEO_SCHEME as Neo4jScheme,
      host: process.env.NEO_HOST,
      port: process.env.NEO_PORT,
      username: process.env.NEO_USERNAME,
      password: process.env.NEO_PASSWORD,
    }), 
    // EducationModule,
    // AuthModule,
  ],
  // guards are weird in nest: https://github.com/nestjs/nest/issues/3856
  // I gave up on encapsulation for now... need to fix this though!
  controllers: [
    AuthController,
    CurriculumController,
    ProgramController,
    UnitController,
    ResultController,
    DegreeController,
    YieldsController,
    UsedInController,
    ConsistsOfController,
  ],
  providers:[
    {
      provide: AUTH_CONFIG,
      useValue: {
        jwtSecret: process.env.AUTH_JWT_SECRET,
        initialRefreshes: parseInt(process.env.AUTH_INITIAL_REFRESHES),
        refreshExpire: process.env.AUTH_REFRESH_EXPIRE,
        accessExpire: process.env.AUTH_ACCESS_EXPIRE,
        saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS),
      },
    },
    CredentialAuthGuard,
    RefreshAuthGuard,
    AccessAuthGuard,
    AuthService,
    UserService,
  ],
})
export class AppModule { }
