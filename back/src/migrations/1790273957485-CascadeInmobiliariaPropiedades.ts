import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeInmobiliariaPropiedades1790273957485 implements MigrationInterface {
    name = 'CascadeInmobiliariaPropiedades1790273957485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propiedades" DROP CONSTRAINT "FK_424983c23f8fa62f30b7fac9dfc"`);
        await queryRunner.query(`ALTER TABLE "propiedades" ADD CONSTRAINT "FK_424983c23f8fa62f30b7fac9dfc" FOREIGN KEY ("inmobiliaria_id") REFERENCES "inmobiliarias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propiedades" DROP CONSTRAINT "FK_424983c23f8fa62f30b7fac9dfc"`);
        await queryRunner.query(`ALTER TABLE "propiedades" ADD CONSTRAINT "FK_424983c23f8fa62f30b7fac9dfc" FOREIGN KEY ("inmobiliaria_id") REFERENCES "inmobiliarias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
