/*
  Warnings:

  - You are about to drop the column `pertanyaan` on the `question` table. All the data in the column will be lost.
  - You are about to alter the column `createdAt` on the `user_score` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - A unique constraint covering the columns `[topic]` on the table `subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `e` to the `question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `question` DROP COLUMN `pertanyaan`,
    ADD COLUMN `e` VARCHAR(101) NOT NULL,
    ADD COLUMN `question` TEXT NOT NULL,
    MODIFY `answer` ENUM('a', 'b', 'c', 'd', 'e') NOT NULL;

-- AlterTable
ALTER TABLE `user_score` MODIFY `createdAt` TIMESTAMP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `subject_topic_key` ON `subject`(`topic`);
