CREATE TYPE "Gender" AS ENUM ('WOMAN', 'MAN', 'NONBINARY', 'PREFER_NOT_TO_SAY', 'UNSPECIFIED');

ALTER TABLE "User" ADD COLUMN "industry" TEXT;
ALTER TABLE "User" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED';

ALTER TABLE "Subject" ADD COLUMN "industry" TEXT;
ALTER TABLE "Subject" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Subject" ALTER COLUMN "relationship" SET DEFAULT 'OTHER';

ALTER TABLE "Scorecard" ADD COLUMN "selectedDimensionIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FeedbackLink" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "revealSender" BOOLEAN NOT NULL DEFAULT false,
    "senderLabel" TEXT,
    "codeHash" TEXT,
    "codeExpiresAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "viewTokenHash" TEXT,
    "viewExpiresAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeedbackLink_tokenHash_key" ON "FeedbackLink"("tokenHash");
CREATE UNIQUE INDEX "FeedbackLink_viewTokenHash_key" ON "FeedbackLink"("viewTokenHash");
CREATE INDEX "FeedbackLink_scorecardId_idx" ON "FeedbackLink"("scorecardId");

ALTER TABLE "FeedbackLink" ADD CONSTRAINT "FeedbackLink_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
