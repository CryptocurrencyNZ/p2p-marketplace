CREATE TABLE "userProfiles" (
	"id" text,
	"string" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"bio" text,
	"avatar" text,
	CONSTRAINT "userProfiles_id_unique" UNIQUE("id"),
	CONSTRAINT "userProfiles_string_unique" UNIQUE("string")
);
