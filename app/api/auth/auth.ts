import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { drizzleDb } from "@/app/config/db"; // ton instance Drizzle
import { UserSchema } from "@/app/config/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";


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
          console.log("credentials",credentials)
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

        const userInfo= {
          id: user?.id,
          email: user?.email,
          role: user?.role ,
          nom:user?.nom,
          prenom:user?.prenom
        };
      //   console.log("user connected",userInfo)
        return userInfo
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
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (token) {
        session.user = token.user;
      }
      return session;
    },
  }, 
  /* pages: {
    signIn: "/login",
  }, */
  secret: process.env.NEXTAUTH_SECRET,

};

export const {handlers,auth,signIn,signOut} = NextAuth({
  ...authOptions,
session:{
  strategy:"jwt",
  maxAge:60,
  //updateAge:
}
});