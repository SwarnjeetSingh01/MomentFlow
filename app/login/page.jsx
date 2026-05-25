"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import styles from './Login.module.css';
import Link from 'next/link';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email': return 'Invalid email address format.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/email-already-in-use': return 'An account already exists with this email.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/invalid-credential': return 'Invalid email or password.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to home page on success
      router.push('/');
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to continue to MomentFlows
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 5 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={styles.errorBox}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField} 
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField} 
                placeholder="••••••••"
                required
              />
            </div>
            <Link href="#" className={styles.forgotPassword}>Forgot password?</Link>
          </div>

          <button type="submit" className={`${styles.loginBtn} ${isLoading ? styles.loading : ''}`} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 size={18} className={styles.animateSpin} /> Processing...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
