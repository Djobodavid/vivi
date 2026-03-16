
import { integer, pgTable, timestamp, uuid, varchar,  } from "drizzle-orm/pg-core";

export const UserSchema = pgTable("utilisateur", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom").notNull(),
  prenom: varchar("prenom").notNull(),
  telephone: varchar("telephone").notNull(),
  email: varchar("email").notNull(),
  image: varchar("image"),
  role: varchar("role").notNull(),
  motDePasse: varchar("mot_pass").notNull(),   
});

export const ClientSchema = pgTable("client", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom").notNull(),
  adresse: varchar("adresse").notNull(),
  telephone: varchar("telephone").notNull(),
});

export const FournisseurSchema = pgTable("fournisseur", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom").notNull(),
  adresse: varchar("adresse").notNull(),
  telephone: varchar("telephone").notNull(),
});

export const UniteSchema = pgTable("unite", {
  id: uuid("id").primaryKey(),
  nom: varchar("unite").notNull(),
});

export const CategorySchema = pgTable("category", {
  id: uuid("id").primaryKey(),
  nom: varchar("category").notNull(),
});

export const ProduitSchema = pgTable("produit", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom_produit").notNull(),
  image: varchar("image"),
  prix_achat: varchar("prix_achat").notNull(),
  prix_vente: varchar("prix_vente").notNull(),
});

export const PromotionSchema = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),

  reduction: integer ("reduction").notNull(),

  typeReduction: varchar("type_reduction", { length: 50 }).notNull(), 
  // "pourcentage" ou "montant"

  dateDebut: timestamp("date_debut").notNull(),

  dateFin: timestamp("date_fin").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
