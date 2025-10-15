import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760503749626 implements MigrationInterface {
  name = 'InitialSchema1760503749626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tenant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_56211336b5ff35fd944f2259173" UNIQUE ("name"), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'recruiter', 'manager')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, "organizationId" character varying NOT NULL, "tenantId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_status_enum" AS ENUM('open', 'closed', 'paused')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sequence_id" SERIAL NOT NULL, "title" character varying NOT NULL, "status" "public"."job_status_enum" NOT NULL DEFAULT 'open', "organizationId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_74b7c6029f35b04f10658dbf778" UNIQUE ("sequence_id"), CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bac37f13b06c08534012dc3607" ON "job" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4d9a1a72f4cfd52e7a07f30e6" ON "job" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37498992adf9167c001e3dce2c" ON "job" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."candidate_status_enum" AS ENUM('applied', 'screening', 'interview_scheduled', 'offer', 'hired', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "candidate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sequence_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "status" "public"."candidate_status_enum" NOT NULL DEFAULT 'applied', "jobId" uuid NOT NULL, "organizationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e4ab8e866292e0bbcd788324ea7" UNIQUE ("sequence_id"), CONSTRAINT "PK_b0ddec158a9a60fbc785281581b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_80e766f22573be71b86b2f0537" ON "candidate" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_606492cf389854c0380fdf07f2" ON "candidate" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16fb27ffd1a99c6506c92ad57a" ON "candidate" ("organizationId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46e6f08a0b17810008e6177ba2" ON "candidate" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interview_status_enum" AS ENUM('scheduled', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sequence_id" SERIAL NOT NULL, "candidateId" uuid NOT NULL, "scheduledAt" TIMESTAMP NOT NULL, "status" "public"."interview_status_enum" NOT NULL DEFAULT 'scheduled', "calendarLink" character varying NOT NULL, "organizationId" character varying NOT NULL, CONSTRAINT "UQ_8df1b22758035a051df3c4722cb" UNIQUE ("sequence_id"), CONSTRAINT "PK_44c49a4feadefa5c6fa78bfb7d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8df1b22758035a051df3c4722c" ON "interview" ("sequence_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18cc27524dc11b3ef4ba4001a4" ON "interview" ("candidateId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_84f257ba7ab70ff620f21bf03e" ON "interview" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f95724a85c45e62ab642a0a13" ON "interview" ("organizationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_685bf353c85f23b6f848e4dcded" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate" ADD CONSTRAINT "FK_4d23bc785fd690002636a899cf0" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate" ADD CONSTRAINT "FK_16fb27ffd1a99c6506c92ad57a7" FOREIGN KEY ("organizationId") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interview" ADD CONSTRAINT "FK_18cc27524dc11b3ef4ba4001a42" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interview" DROP CONSTRAINT "FK_18cc27524dc11b3ef4ba4001a42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate" DROP CONSTRAINT "FK_16fb27ffd1a99c6506c92ad57a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate" DROP CONSTRAINT "FK_4d23bc785fd690002636a899cf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_685bf353c85f23b6f848e4dcded"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f95724a85c45e62ab642a0a13"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_84f257ba7ab70ff620f21bf03e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18cc27524dc11b3ef4ba4001a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8df1b22758035a051df3c4722c"`,
    );
    await queryRunner.query(`DROP TABLE "interview"`);
    await queryRunner.query(`DROP TYPE "public"."interview_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46e6f08a0b17810008e6177ba2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16fb27ffd1a99c6506c92ad57a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_606492cf389854c0380fdf07f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_80e766f22573be71b86b2f0537"`,
    );
    await queryRunner.query(`DROP TABLE "candidate"`);
    await queryRunner.query(`DROP TYPE "public"."candidate_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37498992adf9167c001e3dce2c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4d9a1a72f4cfd52e7a07f30e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bac37f13b06c08534012dc3607"`,
    );
    await queryRunner.query(`DROP TABLE "job"`);
    await queryRunner.query(`DROP TYPE "public"."job_status_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(`DROP TABLE "tenant"`);
  }
}
