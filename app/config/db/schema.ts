import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const UserSchema = pgTable("utilisateur", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom").notNull(),
  prenom: varchar("prenom").notNull(),
  telephone: varchar("telephone").notNull(),
  email: varchar("email").notNull(),
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
  addresse: varchar("addresse").notNull(),
  telephone: varchar("telephone").notNull(),
});

export const UniteSchema = pgTable("unite", {
  id: uuid("id").primaryKey(),
  nom: varchar("unite").notNull(),
  description: varchar("description"),
});

export const CategorySchema = pgTable("category", {
  id: uuid("id").primaryKey(),
  nom: varchar("category").notNull(),
  description: varchar("description"),
});

export const ProduitSchema = pgTable("produit", {
  id: uuid("id").primaryKey(),
  nom: varchar("nom_produit").notNull(),
  image: varchar("image"),
});

export const PromotionSchema = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Relation vers le produit
  produitId: uuid("produit_id")
    .references(() => ProduitSchema.id)
    .notNull(),

  reduction: integer("reduction").notNull(),

  typeReduction: varchar("type_reduction", { length: 50 }).notNull(),
  // "pourcentage" ou "montant"

  dateDebut: timestamp("date_debut").notNull(),

  dateFin: timestamp("date_fin").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const StockSchema = pgTable("stockage_produit", {
  id: uuid("id").primaryKey(),

  date_stock: timestamp("date_stock").notNull(),

  quantite_stock: integer("quantite_stock").notNull(),
  
  quantite_min_stock: integer("quantite_min_stock").notNull(),

  prix_unitaire_achat: numeric("prix_unitaire_achat").notNull(),

  autre_frais: numeric("autre_frais"),

  observation: varchar("observation"),

  date_expiration: timestamp("date_expiration").notNull(),

  produitId: uuid("produitId")
    .references(() => ProduitSchema.id)
    .notNull(),

  fournisseurId: uuid("fournisseurId")
    .references(() => FournisseurSchema.id)
    .notNull(),

  utilisateurId: uuid("utilisateurId")
    .references(() => UserSchema.id)
    .notNull(),

  uniteId: uuid("uniteId")
    .references(() => UniteSchema.id)
    .notNull(),

  categoryId: uuid("categoryId")
    .references(() => CategorySchema.id)
    .notNull(),
});
