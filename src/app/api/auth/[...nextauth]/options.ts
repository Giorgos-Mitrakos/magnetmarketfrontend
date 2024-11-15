import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials, req) {
        // console.log("credentials:", credentials)
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/local`, {
          method: 'POST',
          body: JSON.stringify({
            identifier: credentials?.email,
            password: credentials?.password,
          }),
          headers: { "Content-Type": "application/json" }
        })
        const user = await res.json()

        // console.log("user1111:::::::", user)
        // If no error and we have user data, return it
        if (res.ok && user) {
          return { id: user.user.id, name: user.user.username, email: user.user.email, jwt: user.jwt }
        }
        // Return null if user data could not be retrieved
        return null
      }
    }),
  ],
  // database: process.env.NEXT_PUBLIC_DATABASE_URL,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // encryption: true,
  },
  callbacks: {
    async jwt({ token, user, account, profile, session }) {

      // console.log("account:", account, "session:", session, "token:", token, "user:", user, "profile:", profile)
      const isSignIn = user ? true : false;
      // if (user) {
      //   try {
      //     token.jwt = user.jwt;
      //     token.id = user.user.id;
      //   } catch (error) {

      //   }
      // }
      if (isSignIn && account && account.provider !== "credentials") {
        try {
          // console.log("Google Account >>>>>>>>>>>>>> ", account);
          const public_url = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(
            `${public_url}/api/auth/${account.provider}/callback?access_token=${account?.access_token}`
          );
          const data = await response.json();
          // console.log("Strapi Callback Data >>>>>>>>>>>>>> ", data);
          token.jwt = data.jwt;
          token.id = data.user.id;
        } catch (error) {
          console.error('Fetch failed:', error);
        }
      }
      // else {
      //   console.log("Useerrrrr >>>>>>>>>>>>>> ", user,"Token >>>>>>>>>>>>>> ", token,
      //   "account >>>>>>>>>>>>>> ",account,"profile >>>>>>>>>>>>>> ", profile);
      //   token.jwt = user?.jwt;
      //   token.id = user?.user.id;
      //   token.name = user?.user.username;
      //   token.email = user?.user.email
      // }
      // console.log("token:", token)
      return Promise.resolve(token);
    },
    async session({ session, token, user }) {

      // Send properties to the client, like an access_token from a provider.
      session.user = token as any;
      // console.log("session:", session, "token:", token, "user:", user)
      // session.user.id = user ? user.id : null;
      return Promise.resolve(session);
    }
  },
  pages: {
    signIn: '/login'
  },
}