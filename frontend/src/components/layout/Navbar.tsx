import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">BrandDefender</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Можливості
                </a>
                <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Ціни
                </a>
                <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Контакти
                </a>
              </>
            )}
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Дашборд
                </Link>
                <Link
                  to="/support"
                  className="text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Сапорт
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Вийти
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Увійти
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-purple-500/20">
          <div className="px-4 py-4 space-y-3">
            {!user ? (
              <>
                <a href="#features" className="block text-gray-300 hover:text-purple-400">
                  Можливості
                </a>
                <a href="#pricing" className="block text-gray-300 hover:text-purple-400">
                  Ціни
                </a>
                <a href="#contact" className="block text-gray-300 hover:text-purple-400">
                  Контакти
                </a>
                <Link
                  to="/auth"
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg text-center"
                >
                  Увійти
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-purple-400"
                >
                  Дашборд
                </Link>
                <Link
                  to="/support"
                  className="block text-gray-300 hover:text-purple-400"
                >
                  Сапорт
                </Link>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex items-center gap-2 text-gray-300 mb-3">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-center flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Вийти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
