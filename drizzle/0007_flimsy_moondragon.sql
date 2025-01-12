ALTER TABLE "orderItems" RENAME COLUMN "restaurant_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_restaurant_id_restaurants_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
