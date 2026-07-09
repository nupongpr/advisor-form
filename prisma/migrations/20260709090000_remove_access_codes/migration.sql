-- Remove the admin-issued access-code gating feature.
-- The survey is now open to anyone with the link.

-- Drop the access-code table (and its unique index).
DROP TABLE "AccessCode";

-- Drop the now-unused respondent code from Response.
ALTER TABLE "Response" DROP COLUMN "code";
