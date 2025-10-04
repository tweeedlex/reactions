import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">BrandDefender</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
              Можливості
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
              Ціни
            </a>
            <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">
              Контакти
            </a>
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Дашборд
            </Link>
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
              to="/dashboard"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg text-center"
            >
              Дашборд
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
