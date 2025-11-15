import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskEntity1762917408957 implements MigrationInterface {
    name = 'AddTaskEntity1762917408957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tasks" ("id" SERIAL NOT NULL, "content" text NOT NULL, "done" boolean NOT NULL DEFAULT false, "deadline" TIMESTAMP WITH TIME ZONE, "remindAt" TIMESTAMP WITH TIME ZONE, "channelId" character varying, "reminded" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tasks"`);
    }

}
