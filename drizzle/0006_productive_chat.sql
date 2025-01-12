ALTER TABLE "products" DROP CONSTRAINT "products_id_restaurants_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "restaurant_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
