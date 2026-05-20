CREATE TABLE "category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"category" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom" varchar NOT NULL,
	"adresse" varchar NOT NULL,
	"telephone" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fournisseur" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom" varchar NOT NULL,
	"addresse" varchar NOT NULL,
	"telephone" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parametre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cle" varchar NOT NULL,
	"valeur" varchar NOT NULL,
	"description" varchar,
	CONSTRAINT "parametre_cle_unique" UNIQUE("cle")
);
--> statement-breakpoint
CREATE TABLE "produit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom_produit" varchar NOT NULL,
	"image" varchar
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produit_id" uuid NOT NULL,
	"reduction" integer NOT NULL,
	"type_reduction" varchar(50) NOT NULL,
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stockage_produit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"date_stock" timestamp NOT NULL,
	"quantite_stock" integer NOT NULL,
	"quantite_restante" integer NOT NULL,
	"quantite_min_stock" integer NOT NULL,
	"prix_unitaire_achat" numeric,
	"prix_unitaire_vente" numeric,
	"statut" varchar DEFAULT 'en_attente' NOT NULL,
	"autre_frais" numeric,
	"observation" varchar,
	"date_expiration" timestamp NOT NULL,
	"produitId" uuid NOT NULL,
	"fournisseurId" uuid NOT NULL,
	"utilisateurId" uuid NOT NULL,
	"uniteId" uuid NOT NULL,
	"categoryId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unite" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unite" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "utilisateur" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom" varchar NOT NULL,
	"prenom" varchar NOT NULL,
	"telephone" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar NOT NULL,
	"mot_pass" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vente_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venteId" uuid NOT NULL,
	"produitId" uuid NOT NULL,
	"stockId" uuid NOT NULL,
	"uniteId" uuid,
	"quantite" integer NOT NULL,
	"prix_unitaire" numeric NOT NULL,
	"total" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_vente" timestamp DEFAULT now(),
	"total" numeric NOT NULL,
	"autre_frais" numeric,
	"observation" varchar,
	"mode_paiement" varchar DEFAULT 'cash',
	"montant_recu" numeric,
	"monnaie_rendue" numeric,
	"clientId" uuid,
	"utilisateurId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_produit_id_produit_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stockage_produit" ADD CONSTRAINT "stockage_produit_produitId_produit_id_fk" FOREIGN KEY ("produitId") REFERENCES "public"."produit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stockage_produit" ADD CONSTRAINT "stockage_produit_fournisseurId_fournisseur_id_fk" FOREIGN KEY ("fournisseurId") REFERENCES "public"."fournisseur"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stockage_produit" ADD CONSTRAINT "stockage_produit_utilisateurId_utilisateur_id_fk" FOREIGN KEY ("utilisateurId") REFERENCES "public"."utilisateur"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stockage_produit" ADD CONSTRAINT "stockage_produit_uniteId_unite_id_fk" FOREIGN KEY ("uniteId") REFERENCES "public"."unite"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stockage_produit" ADD CONSTRAINT "stockage_produit_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente_item" ADD CONSTRAINT "vente_item_venteId_vente_id_fk" FOREIGN KEY ("venteId") REFERENCES "public"."vente"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente_item" ADD CONSTRAINT "vente_item_produitId_produit_id_fk" FOREIGN KEY ("produitId") REFERENCES "public"."produit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente_item" ADD CONSTRAINT "vente_item_stockId_stockage_produit_id_fk" FOREIGN KEY ("stockId") REFERENCES "public"."stockage_produit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente_item" ADD CONSTRAINT "vente_item_uniteId_unite_id_fk" FOREIGN KEY ("uniteId") REFERENCES "public"."unite"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente" ADD CONSTRAINT "vente_clientId_client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vente" ADD CONSTRAINT "vente_utilisateurId_utilisateur_id_fk" FOREIGN KEY ("utilisateurId") REFERENCES "public"."utilisateur"("id") ON DELETE no action ON UPDATE no action;