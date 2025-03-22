CREATE TABLE "starred_chats" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	CONSTRAINT "starred_chats_user_id_conversation_id_unique" UNIQUE("user_id","conversation_id")
);
--> statement-breakpoint
ALTER TABLE "userProfiles" DROP CONSTRAINT "userProfiles_id_unique";--> statement-breakpoint
ALTER TABLE "userProfiles" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "userProfiles" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD COLUMN "auth_id" text;--> statement-breakpoint
ALTER TABLE "starred_chats" ADD CONSTRAINT "starred_chats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_auth_id_unique" UNIQUE("auth_id");