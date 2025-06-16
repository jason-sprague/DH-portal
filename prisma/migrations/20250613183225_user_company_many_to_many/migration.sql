/*
  Warnings:

  - You are about to drop the `_CompanyToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CompanyToUser" DROP CONSTRAINT "_CompanyToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToUser" DROP CONSTRAINT "_CompanyToUser_B_fkey";

-- DropTable
DROP TABLE "_CompanyToUser";

-- CreateTable
CREATE TABLE "CompaniesOnUsers" (
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompaniesOnUsers_pkey" PRIMARY KEY ("userId","companyId")
);

-- AddForeignKey
ALTER TABLE "CompaniesOnUsers" ADD CONSTRAINT "CompaniesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompaniesOnUsers" ADD CONSTRAINT "CompaniesOnUsers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
