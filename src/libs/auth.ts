import { prisma } from "@/libs/prismaDb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-key" : undefined),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        console.log('🔐 NextAuth authorize attempt:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        // check to see if eamil and password is there
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ Missing email or password');
          throw new Error("Please enter an email or password");
        }

        // check to see if user already exist
        const user = await prisma.telesklad_users.findUnique({
          where: {
            email: credentials.email,
          },
        });

        console.log('👤 User found:', { found: !!user, hasPassword: !!user?.password, role: user?.role });

        // if user was not found
        if (!user || !user?.password) {
          console.error('❌ No user found or no password');
          throw new Error("No user found");
        }

        // check to see if passwords match
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        console.log('🔑 Password match:', passwordMatch);

        if (!passwordMatch) {
          console.error('❌ Incorrect password');
          throw new Error("Incorrect password");
        }

        console.log('✅ User authenticated successfully:', user.email);
        return user;
      },
    }),

    // Временно отключен Email Provider из-за проблем с fs модулем
    // ...(process.env.EMAIL_SERVER_HOST ? [EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: Number(process.env.EMAIL_SERVER_PORT),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // })] : []),

    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })] : []),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // После успешного входа перенаправляем на главную страницу
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    jwt: async (payload: any) => {
      const { token, trigger, session } = payload;
      const user = payload.user;

      if (trigger === "update") {
        return {
          ...token,
          ...session.user,
          picture: session.user.image,
          image: session.user.image,
          phone: session.user.phone,
        };
      }

      if (user) {
        return {
          ...token,
          uid: user.id,
          role: user.role,
          picture: user.image,
          image: user.image,
          phone: user.phone,
        };
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: token.role,
            image: token.picture,
            phone: token.phone,
          },
        };
      }
      return session;
    },
  },

  // debug: process.env.NODE_ENV === "developement",
};

export const getAuthSession = async () => {
  return getServerSession(authOptions);
};
