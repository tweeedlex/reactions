import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, User, ArrowRight } from 'lucide-react';
import { saveUserData } from '@/utils/localStorage';

function AuthPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Зберігаємо базову інформацію користувача
    const userData = {
      user: {
        name: formData.name,
        email: formData.email,
      },
      brand: {
        brandName: '',
        keywords: [],
        sources: [],
        saasPoints: 1000,
      },
      isOnboarded: false,
    };
    
    saveUserData(userData);
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">BrandDefender</h1>
          </div>
          <p className="text-gray-300 text-lg">Почніть захищати свій бренд сьогодні</p>
        </div>

        {/* Auth Form */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">Створити акаунт</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ваше ім'я
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Іван Петренко"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="ivan@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Продовжити
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Натискаючи "Продовжити", ви погоджуєтесь з нашими умовами використання
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
            <div className="text-2xl font-bold text-purple-400 mb-1">10K+</div>
            <div className="text-xs text-gray-400">Користувачів</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
            <div className="text-2xl font-bold text-pink-400 mb-1">500K+</div>
            <div className="text-xs text-gray-400">Відгуків</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
            <div className="text-2xl font-bold text-purple-400 mb-1">95%</div>
            <div className="text-xs text-gray-400">Задоволених</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
