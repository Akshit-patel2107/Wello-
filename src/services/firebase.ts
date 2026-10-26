import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged, type FirebaseUser };
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import { FinancialProfile, UserAuth } from '../types/financial';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection at boot as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client may be offline or initializing.');
    }
  }
}
testConnection();

// Structured Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Auth Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Professional Google Sign-In with popup
export async function signInWithGoogle(): Promise<UserAuth> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const userAuth: UserAuth = {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Wello Member',
      avatarUrl:
        fbUser.photoURL ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          fbUser.displayName || 'User'
        )}&backgroundColor=4f46e5&textColor=ffffff`,
      loginMethod: 'google',
      createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    };

    // Upsert user doc in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      await setDoc(
        userDocRef,
        {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || '',
          photoURL: fbUser.photoURL || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not update user doc:', err);
    }

    return userAuth;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

// Sign out from Firebase
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

// Convert Firebase User to App UserAuth
export function formatFirebaseUser(fbUser: FirebaseUser): UserAuth {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Wello Member',
    avatarUrl:
      fbUser.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        fbUser.displayName || 'User'
      )}&backgroundColor=4f46e5&textColor=ffffff`,
    loginMethod: 'google',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
}

// Load Financial Profile from Firestore by user UID
export async function loadUserProfileFromFirestore(
  userId: string
): Promise<FinancialProfile | null> {
  const path = `users/${userId}/financialData/profile`;
  try {
    const docRef = doc(db, 'users', userId, 'financialData', 'profile');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as FinancialProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Save Financial Profile to Firestore by user UID and user email
export async function saveUserProfileToFirestore(
  userId: string,
  userEmail: string,
  profile: FinancialProfile
): Promise<boolean> {
  const path = `users/${userId}/financialData/profile`;
  try {
    const docRef = doc(db, 'users', userId, 'financialData', 'profile');
    const payload = {
      ...profile,
      userId,
      email: userEmail,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
