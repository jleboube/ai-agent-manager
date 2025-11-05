-- AlterTable
ALTER TABLE "AgentGeneration"
ADD COLUMN "agentName" TEXT NOT NULL DEFAULT 'Unnamed Agent',
ADD COLUMN "fileContent" TEXT NOT NULL DEFAULT '',
ADD COLUMN "fileSizeBytes" INTEGER NOT NULL DEFAULT 0;

-- Update existing rows with placeholder data
UPDATE "AgentGeneration" SET "agentName" = 'Legacy Agent' WHERE "agentName" = 'Unnamed Agent';
