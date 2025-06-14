"use client";

import { signIn } from 'next-auth/react';
import React from 'react';

// This is a dedicated, custom page for signing in.
// NextAuth.js will automatically redirect unauthenticated users here.
export default function SignInPage() {
  return (
    <main className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold mb-2">LaunchPad</h1>
        <p className="text-gray-400 mb-8">Sign in to manage your launches</p>
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl">
          <p className="text-gray-300 mb-6">Please sign in to continue</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-white text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </main>
  );
}
