-- Record which UI language each respondent used (th | en). Existing rows default to 'th'.
ALTER TABLE "Response" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'th';
