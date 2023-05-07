import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [ 
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', },
        password: { label: 'Password', type: 'password', }
      },
      async authorize(credentials, req) {
        // THIS WHERE YOU DO THE USER LOOKUP
        console.log('IN NEXT AUTH VALIDATOR THING')
        console.log(credentials)
        console.log(req)
        const user = { id: '1', name: 'Its Me', }
        if (user) {
          return user;
        } else {
          return null;
        }
      }
    }) 
  ],
  session: {
    strategy: 'jwt',
  },
  secret: 'idkSOmeStringofSOmeCharsCuzItSREquired',
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  }
});

export { handler as GET, handler as POST }
