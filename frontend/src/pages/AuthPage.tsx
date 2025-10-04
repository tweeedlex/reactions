import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, User, ArrowRight, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn, initialized, loading, userRole } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        const { error, hasCompany: userHasCompany } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          // Перенаправляємо на основі наявності компанії та ролі
          if (userHasCompany) {
            navigate(userRole === 'admin' ? '/dashboard' : '/support');
          } else {
            navigate('/setup');
          }
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          setError(error.message);
        } else {
          setError('Перевірте вашу пошту для підтвердження акаунта');
        }
      }
    } catch (err) {
      setError('Сталася неочікувана помилка');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Показуємо завантаження поки не завершиться ініціалізація
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Завантаження...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex justify-center mb-6">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Увійти
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Реєстрація
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Увійти в акаунт' : 'Створити акаунт'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
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
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-700 text-white pl-12 pr-12 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
                  disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                  {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Увійти' : 'Створити акаунт'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            {isLogin ? (
              <>
                Немає акаунта?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Зареєструватися
                </button>
              </>
            ) : (
              <>
                Вже маєте акаунт?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Увійти
                </button>
              </>
            )}
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
