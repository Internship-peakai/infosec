import React, { useState } from 'react';
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react';
import { Building2, Mail, User } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signInEmailPassword, isLoading: isSigningIn, error: signInError } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: isSigningUp, error: signUpError } = useSignUpEmailPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    
    if (isLogin) {
      await signInEmailPassword(email, password);
    } else {
      await signUpEmailPassword(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient relative overflow-hidden flex items-center justify-center">
      {/* Geometric Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Square */}
        <div className="animate-float-slow absolute top-[20%] left-[10%] w-16 h-16 border-2 border-purple-400/30 rotate-45"></div>
        {/* Triangle */}
        <div className="animate-float-medium absolute top-[30%] right-[15%]">
          <div className="w-0 h-0 border-l-[25px] border-l-transparent border-b-[40px] border-b-pink-400/30 border-r-[25px] border-r-transparent"></div>
        </div>
        {/* Circle */}
        <div className="animate-float-fast absolute bottom-[25%] left-[20%] w-20 h-20 border-2 border-purple-500/30 rounded-full"></div>
        {/* Rectangle */}
        <div className="animate-float-medium absolute top-[50%] right-[20%] w-24 h-12 border-2 border-pink-400/30 rotate-12"></div>
        {/* Diamond */}
        <div className="animate-float-slow absolute bottom-[20%] right-[15%] w-16 h-16 border-2 border-purple-400/30 rotate-45"></div>
        {/* Small Circle */}
        <div className="animate-float-fast absolute top-[15%] left-[30%] w-8 h-8 border-2 border-pink-500/30 rounded-full"></div>
      </div>

      {/* Your existing auth content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to access your account' : 'Sign up to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-4 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-12 pr-4 py-4 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {passwordError}
              </div>
            )}

            {(signInError || signUpError) && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {signInError?.message || signUpError?.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn || isSigningUp}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {isSigningIn || isSigningUp ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <User size={20} />
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}