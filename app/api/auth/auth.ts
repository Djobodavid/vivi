import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { drizzleDb } from "@/app/config/db"; // ton instance Drizzle
import { UserSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import ''

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email",placeholder:"" },
        password: { label: "Mot de passe", type: "password",placeholder:"" },
      },
      async authorize(credentials) {
        try{
        if (!credentials?.email || !credentials?.password) return null;

        const user = await drizzleDb.query.UserSchema.findFirst({
          where: eq(UserSchema.email, credentials.email as any),
        });
          /* .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1); */

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password as any, user.motDePasse);
        if (!isValid) return null;

        /* // Récupérer le rôle
        const role = await drizzleDb.query.roles.findFirst({
          where: eq(roles.id, user.roleId!),
        }); */
         
        return {
          id: user.id,
          email: user.email,
          role: UserSchema.role || "etudiant",
        };
      }catch(error:any){
        console.log("Erreur lors de l'authentification:", error.message);
        return null
      }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  
};

export const {handlers,auth,signIn,signOut} = NextAuth(authOptions);