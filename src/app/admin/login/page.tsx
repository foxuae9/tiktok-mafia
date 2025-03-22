'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      // تخزين حالة تسجيل الدخول في localStorage
      localStorage.setItem('adminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">تسجيل دخول المشرف</h1>
        
        {error && (
          <div className="bg-red-500/50 text-white p-4 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-white mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
