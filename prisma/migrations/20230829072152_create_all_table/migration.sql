-- CreateTable
CREATE TABLE `user` (
    `id_user` VARCHAR(191) NOT NULL,
    `username` VARCHAR(21) NOT NULL,
    `age` TINYINT NOT NULL,
    `email` VARCHAR(51) NOT NULL,
    `name` VARCHAR(201) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'user') NOT NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `id_subject` CHAR(6) NOT NULL,
    `name` VARCHAR(101) NOT NULL,
    `topic` VARCHAR(101) NOT NULL,

    UNIQUE INDEX `subject_topic_key`(`topic`),
    PRIMARY KEY (`id_subject`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id_question` INTEGER NOT NULL AUTO_INCREMENT,
    `id_subject` CHAR(6) NOT NULL,
    `question` TEXT NOT NULL,
    `a` VARCHAR(101) NOT NULL,
    `b` VARCHAR(101) NOT NULL,
    `c` VARCHAR(101) NOT NULL,
    `d` VARCHAR(101) NOT NULL,
    `e` VARCHAR(101) NOT NULL,
    `answer` ENUM('a', 'b', 'c', 'd', 'e') NOT NULL,

    PRIMARY KEY (`id_question`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_score` (
    `id_score` INTEGER NOT NULL AUTO_INCREMENT,
    `id_subject` CHAR(6) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `score` INTEGER NOT NULL,
    `createdAt` TIMESTAMP NOT NULL,

    PRIMARY KEY (`id_score`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_id_subject_fkey` FOREIGN KEY (`id_subject`) REFERENCES `subject`(`id_subject`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_score` ADD CONSTRAINT `user_score_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_score` ADD CONSTRAINT `user_score_id_subject_fkey` FOREIGN KEY (`id_subject`) REFERENCES `subject`(`id_subject`) ON DELETE RESTRICT ON UPDATE CASCADE;
