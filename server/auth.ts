/**
 * Authentication Module
 * 
 * This file configures Passport.js for user authentication and session management.
 * It implements secure password hashing, login/logout routes, and session handling.
 */
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { IUser } from "@shared/models";

/**
 * Extend Express.User interface to include our application's User type
 * This ensures proper typing for req.user in Express
 */
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Promisify scrypt function for async/await usage
const scryptAsync = promisify(scrypt);

/**
 * Hash a password with a random salt using scrypt
 * 
 * @param password - The plaintext password to hash
 * @returns A string in the format "{hash}.{salt}"
 */
async function hashPassword(password: string) {
  // Generate a random salt
  const salt = randomBytes(16).toString("hex");
  // Hash the password with the salt
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  // Return the hash and salt together
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hashed password
 * 
 * @param supplied - The plaintext password to check
 * @param stored - The stored password hash in the format "{hash}.{salt}"
 * @returns Boolean indicating whether the passwords match
 */
async function comparePasswords(supplied: string, stored: string) {
  // Split the stored password into hash and salt
  const [hashed, salt] = stored.split(".");
  // Convert stored hash to buffer
  const hashedBuf = Buffer.from(hashed, "hex");
  // Hash the supplied password with the same salt
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  // Compare hashes using timing-safe comparison to prevent timing attacks
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Setup authentication for the Express application
 * Configures Passport.js for user authentication and session management
 * Sets up authentication-related API routes
 * 
 * @param app - The Express application instance
 */
export function setupAuth(app: Express) {
  // Configure session settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'taskflow-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore, // Use storage implementation's session store
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  // Trust first proxy for session cookies in production
  app.set("trust proxy", 1);
  
  // Set up session middleware
  app.use(session(sessionSettings));
  
  // Initialize Passport.js authentication
  app.use(passport.initialize());
  app.use(passport.session());

  /**
   * Configure local authentication strategy
   * Uses username and password with our database
   */
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);
        
        // Validate user exists and password is correct
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  /**
   * Define how to serialize user to the session
   * Only store the user ID in the session for security
   */
  passport.serializeUser((user, done) => {
    // With MongoDB, we use the string _id instead of a number id
    done(null, user._id.toString());
  });
  
  /**
   * Define how to deserialize user from the session
   * Look up the user by ID when needed
   */
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  /**
   * API route for user registration
   * Creates a new user account and automatically logs them in
   */
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      // Create new user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Log in the newly created user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return the user without sensitive information
        const safeUser = {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        };
        
        res.status(201).json(safeUser);
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).send("Error during registration");
      next(err);
    }
  });

  /**
   * API route for user login
   * Uses passport.authenticate middleware to validate credentials
   */
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // If authentication is successful, return the user data without sensitive info
    const user = req.user as IUser;
    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };
    
    res.status(200).json(safeUser);
  });

  /**
   * API route for user logout
   * Ends the user session
   */
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  /**
   * API route to get the current user's data
   * Returns 401 if not authenticated
   */
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Return the user without sensitive information
    const user = req.user as IUser;
    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };
    
    res.json(safeUser);
  });
}
