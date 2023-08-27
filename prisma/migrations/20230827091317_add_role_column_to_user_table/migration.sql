/*
  Warnings:

  - You are about to alter the column `createdAt` on the `user_score` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('admin', 'user') NOT NULL;

-- AlterTable
ALTER TABLE `user_score` MODIFY `createdAt` TIMESTAMP NOT NULL;
