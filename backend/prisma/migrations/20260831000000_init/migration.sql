-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('BOSS', 'SKIP_LEVEL', 'PEER', 'REPORT', 'STAKEHOLDER', 'OTHER');

-- CreateEnum
CREATE TYPE "ScorecardStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "roleTitle" TEXT,
    "company" TEXT,
    "relationship" "Relationship" NOT NULL DEFAULT 'BOSS',
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorecard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "status" "ScorecardStatus" NOT NULL DEFAULT 'DRAFT',
    "overall" DOUBLE PRECISION,
    "archetype" TEXT,
    "blurb" TEXT,
    "strongestDimension" TEXT,
    "weakestDimension" TEXT,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardAnswer" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardDimensionScore" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "filled" INTEGER NOT NULL,

    CONSTRAINT "ScorecardDimensionScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Subject_userId_archivedAt_idx" ON "Subject"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Subject_userId_updatedAt_idx" ON "Subject"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Scorecard_userId_createdAt_idx" ON "Scorecard"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Scorecard_subjectId_createdAt_idx" ON "Scorecard"("subjectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Scorecard_userId_status_idx" ON "Scorecard"("userId", "status");

-- CreateIndex
CREATE INDEX "ScorecardAnswer_scorecardId_idx" ON "ScorecardAnswer"("scorecardId");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardAnswer_scorecardId_parameterId_key" ON "ScorecardAnswer"("scorecardId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardDimensionScore_scorecardId_dimensionId_key" ON "ScorecardDimensionScore"("scorecardId", "dimensionId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardAnswer" ADD CONSTRAINT "ScorecardAnswer_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardDimensionScore" ADD CONSTRAINT "ScorecardDimensionScore_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
