ALTER TABLE "userProfiles" DROP CONSTRAINT "userProfiles_id_unique";--> statement-breakpoint
ALTER TABLE "userProfiles" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "userProfiles" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN "auth_id" text;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_auth_id_unique" UNIQUE("auth_id");