import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto text-center text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold text-white">BrandDefender</span>
        </div>
        <p>&copy; 2025 BrandDefender. Всі права захищені.</p>
      </div>
    </footer>
  );
}
