/*
  Warnings:

  - The primary key for the `email_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "email_accounts" DROP CONSTRAINT "email_accounts_user_id_fkey";

-- AlterTable
ALTER TABLE "email_accounts" DROP CONSTRAINT "email_accounts_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "email_accounts_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
