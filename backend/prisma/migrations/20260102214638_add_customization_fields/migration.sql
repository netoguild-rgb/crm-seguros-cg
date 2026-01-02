-- AlterTable
ALTER TABLE "Config" ADD COLUMN     "broker_name" TEXT DEFAULT 'CRM Seguros',
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "primary_color" TEXT DEFAULT '#0f172a';
