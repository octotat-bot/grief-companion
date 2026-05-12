import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Password strength helper
const calculateStrength = (pass) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return Math.min(score, 4);
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const strength = calculateStrength(password);
  const strengthColors = ['bg-border', 'bg-red-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.user, data.token);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset fields when toggling
  useEffect(() => {
    setError('');
    setPassword('');
    setConfirmPassword('');
  }, [isLogin]);

  return (
    <div className="flex justify-center items-center py-12 px-4 fade-in">
      <div className="relative bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl overflow-hidden group">
        {/* Animated background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-purple-600/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-warm mb-2 tracking-wide">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="text-sm text-muted">
              {isLogin ? 'Sign in to access your saved drafts' : 'Create an account to save your progress'}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl flex items-center gap-3 fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required 
                  className="w-full bg-deep/50 border border-border rounded-xl px-4 py-3 text-warm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-border" 
                  placeholder="John Doe" />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required 
                className="w-full bg-deep/50 border border-border rounded-xl px-4 py-3 text-warm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-border" 
                placeholder="you@example.com" />
            </div>

            <div className="space-y-1 relative">
              <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Password</label>
              <div className="relative group/input">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                  className="w-full bg-deep/50 border border-border rounded-xl px-4 py-3 pr-12 text-warm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-border" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-warm transition-colors p-1"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {!isLogin && password.length > 0 && (
                <div className="pt-2 fade-in">
                  <div className="flex gap-1.5 h-1.5 w-full bg-deep rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 transition-all duration-500 rounded-full ${strength >= level ? strengthColors[strength] : 'bg-transparent'}`}
                      ></div>
                    ))}
                  </div>
                  <p className={`text-xs mt-1.5 text-right font-medium transition-colors duration-500 ${strengthColors[strength].replace('bg-', 'text-')}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1 fade-in">
                <label className="text-xs font-medium text-muted uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    className={`w-full bg-deep/50 border rounded-xl px-4 py-3 text-warm focus:outline-none focus:ring-2 transition-all placeholder:text-border ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-500/50 focus:ring-red-500/30' 
                        : 'border-border focus:ring-accent/50 focus:border-accent'
                    }`} 
                    placeholder="••••••••" 
                  />
                  {confirmPassword && password === confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (!isLogin && password !== confirmPassword)} 
              className="w-full py-3 mt-6 bg-gradient-to-r from-accent to-purple-500 hover:from-accent-light hover:to-purple-400 text-white rounded-xl font-medium shadow-lg shadow-accent/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                type="button" 
                className="text-accent font-medium hover:text-accent-light transition-colors ml-1 focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
