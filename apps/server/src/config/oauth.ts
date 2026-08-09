import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { memoryStore } from '../store/memory.js';

export function configureGoogleOAuth() {
  const clientID = process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback';

  console.log(`🔐 Initializing Google OAuth with Client ID: ${clientID.slice(0, 15)}...`);

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          let user = memoryStore.getUserByGoogleId(profile.id);
          if (!user) {
            user = memoryStore.getUserByEmail(email);
            if (user) {
              user.googleId = profile.id;
              if (profile.photos?.[0]?.value) user.avatar = profile.photos[0].value;
            } else {
              user = memoryStore.createUser({
                username: profile.displayName || email.split('@')[0],
                email,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
              });
            }
          }
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = memoryStore.getUserById(id);
    done(null, user);
  });
}
