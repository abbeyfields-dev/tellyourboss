CREATE TABLE "RatingRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "feedbackLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RatingRequest_tokenHash_key" ON "RatingRequest"("tokenHash");
CREATE UNIQUE INDEX "RatingRequest_feedbackLinkId_key" ON "RatingRequest"("feedbackLinkId");
CREATE INDEX "RatingRequest_requesterId_createdAt_idx" ON "RatingRequest"("requesterId", "createdAt" DESC);

ALTER TABLE "RatingRequest" ADD CONSTRAINT "RatingRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RatingRequest" ADD CONSTRAINT "RatingRequest_feedbackLinkId_fkey" FOREIGN KEY ("feedbackLinkId") REFERENCES "FeedbackLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Scorecard" ADD COLUMN "ratingRequestId" TEXT;
CREATE UNIQUE INDEX "Scorecard_ratingRequestId_key" ON "Scorecard"("ratingRequestId");
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_ratingRequestId_fkey" FOREIGN KEY ("ratingRequestId") REFERENCES "RatingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
