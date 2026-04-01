import { useState, useEffect, useCallback } from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
  type SignInInput,
} from 'aws-amplify/auth';

export type AuthStep =
  | 'idle'
  | 'loading'
  | 'signed_in'
  | 'signed_out'
  | 'confirm_signup'; // waiting for email verification code

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

export function useAuth() {
  const [step, setStep] = useState<AuthStep>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Store email temporarily for confirm step
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // ── Check session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const current = await getCurrentUser();
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken;
        const email = (idToken?.payload?.email as string) ?? current.username;
        setUser({ userId: current.userId, username: current.username, email });
        setStep('signed_in');
      } catch {
        setStep('signed_out');
      }
    })();
  }, []);

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setStep('loading');
    try {
      const result = await signIn({ username: email, password } as SignInInput);
      if (result.isSignedIn) {
        const current = await getCurrentUser();
        setUser({ userId: current.userId, username: current.username, email });
        setStep('signed_in');
      } else {
        // Handle next step (e.g. CONFIRM_SIGN_UP)
        if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          setPendingEmail(email);
          setStep('confirm_signup');
        } else {
          setError(`Unexpected sign-in step: ${result.nextStep.signInStep}`);
          setStep('signed_out');
        }
      }
    } catch (e: any) {
      setError(friendlyError(e));
      setStep('signed_out');
    }
  }, []);

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    setStep('loading');
    try {
      const result = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setPendingEmail(email);
        setStep('confirm_signup');
      } else if (result.isSignUpComplete) {
        // Auto sign in if no confirmation needed
        await login(email, password);
      }
    } catch (e: any) {
      setError(friendlyError(e));
      setStep('signed_out');
    }
  }, [login]);

  // ── Confirm Sign Up (email code) ────────────────────────────────────────────
  const confirmCode = useCallback(async (code: string, password: string) => {
    if (!pendingEmail) return;
    setError(null);
    setStep('loading');
    try {
      await confirmSignUp({ username: pendingEmail, confirmationCode: code });
      // Auto sign in after confirmation
      await login(pendingEmail, password);
    } catch (e: any) {
      setError(friendlyError(e));
      setStep('confirm_signup');
    }
  }, [pendingEmail, login]);

  // ── Resend Code ─────────────────────────────────────────────────────────────
  const resendCode = useCallback(async () => {
    if (!pendingEmail) return;
    setError(null);
    try {
      await resendSignUpCode({ username: pendingEmail });
    } catch (e: any) {
      setError(friendlyError(e));
    }
  }, [pendingEmail]);

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
      setStep('signed_out');
    } catch (e: any) {
      setError(friendlyError(e));
    }
  }, []);

  return {
    step,
    user,
    error,
    pendingEmail,
    login,
    register,
    confirmCode,
    resendCode,
    logout,
    isSignedIn: step === 'signed_in',
    isLoading: step === 'loading',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function friendlyError(e: any): string {
  const msg: string = e?.message ?? String(e);
  if (msg.includes('UserNotFoundException') || msg.includes('Incorrect username or password'))
    return 'Incorrect email or password.';
  if (msg.includes('UserNotConfirmedException'))
    return 'Please verify your email first.';
  if (msg.includes('UsernameExistsException'))
    return 'An account with this email already exists.';
  if (msg.includes('InvalidPasswordException'))
    return 'Password must be 8+ characters with uppercase, lowercase, numbers, and symbols.';
  if (msg.includes('CodeMismatchException'))
    return 'Incorrect verification code.';
  if (msg.includes('ExpiredCodeException'))
    return 'Code expired. Please request a new one.';
  if (msg.includes('LimitExceededException'))
    return 'Too many attempts. Please wait and try again.';
  return msg;
}
