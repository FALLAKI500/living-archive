import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bzrirbebbqoqysgmmuzd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cmlyYmViYnFvcXlzZ21tdXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNTgxMDAsImV4cCI6MjA1MzkzNDEwMH0.xff_llEz7c3QbyHXa-oS44ROHOtDx1Z4FtZBzxIx07U";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error("Sign-Up Error:", error.message);
    throw new Error(error.message || "An error occurred during sign-up.");
  }
  
  return data;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Login Error:", error.message);
    throw new Error("Invalid email or password. Please try again.");
  }
  
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout Error:", error.message);
    throw new Error("An error occurred during sign-out.");
  }
};