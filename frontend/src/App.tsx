import { useState } from 'react';
import { Shield, MessageSquare, BarChart3, Zap, Star, Check, Menu, X } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">BrandDefender</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">Можливості</a>
              <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Ціни</a>
              <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">Контакти</a>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                Спробувати
              </button>
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
              <a href="#features" className="block text-gray-300 hover:text-purple-400">Можливості</a>
              <a href="#pricing" className="block text-gray-300 hover:text-purple-400">Ціни</a>
              <a href="#contact" className="block text-gray-300 hover:text-purple-400">Контакти</a>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg">
                Спробувати
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
            <span className="text-purple-300 text-sm font-semibold">🚀 Революція в управлінні фідбеком</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Захистіть свій бренд<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              з розумним фідбеком
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            BrandDefender автоматично парсить соціальні мережі, збирає відгуки користувачів та допомагає вашому саппорту працювати швидше та ефективніше
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl shadow-purple-500/50">
              Почати безкоштовно
            </button>
            <button className="bg-slate-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors border border-purple-500/30">
              Подивитися демо
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300">Активних користувачів</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-pink-400 mb-2">500K+</div>
              <div className="text-gray-300">Оброблених відгуків</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-gray-300">Задоволених клієнтів</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Можливості, які змінюють гру
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Всі інструменти для ефективного управління репутацією в одному місці
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Парсинг соцмереж</h3>
              <p className="text-gray-300">
                Автоматичний збір відгуків з Instagram, Facebook, Twitter та інших платформ в реальному часі
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="bg-pink-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Оптимізація саппорту</h3>
              <p className="text-gray-300">
                Розумна система пріоритизації звернень та автоматичне розподілення задач між операторами
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Аналітика та звіти</h3>
              <p className="text-gray-300">
                Детальна статистика фідбеку за будь-який період з візуалізацією трендів та інсайтами
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="bg-pink-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Моніторинг репутації</h3>
              <p className="text-gray-300">
                Миттєві сповіщення про негативні відгуки та швидке реагування на загрози репутації
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Сентимент-аналіз</h3>
              <p className="text-gray-300">
                AI-алгоритми для визначення емоційного забарвлення відгуків та загальної думки про бренд
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="bg-pink-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Централізація фідбеку</h3>
              <p className="text-gray-300">
                Єдина панель для всіх каналів комунікації - зручно керуйте відгуками з одного місця
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Прозорі ціни для бізнесу будь-якого розміру
            </h2>
            <p className="text-xl text-gray-300">Оберіть план, який підходить саме вам</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="text-4xl font-bold text-purple-400 mb-6">
                $29<span className="text-xl text-gray-400">/міс</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  До 1,000 відгуків/міс
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  3 соц. мережі
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Базова аналітика
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Email підтримка
                </li>
              </ul>
              <button className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors">
                Обрати план
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 border-2 border-purple-400 transform scale-105 shadow-2xl shadow-purple-500/50">
              <div className="bg-white text-purple-600 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                ПОПУЛЯРНИЙ
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <div className="text-4xl font-bold text-white mb-6">
                $99<span className="text-xl text-purple-200">/міс</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  До 10,000 відгуків/міс
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  Необмежені соц. мережі
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  Розширена аналітика
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  Пріоритетна підтримка
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  API доступ
                </li>
              </ul>
              <button className="w-full bg-white text-purple-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Обрати план
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-purple-400 mb-6">
                Custom
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Необмежені відгуки
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Всі функції
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Кастомна інтеграція
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Персональний менеджер
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  SLA гарантії
                </li>
              </ul>
              <button className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors">
                Зв'язатися з нами
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готові захистити свій бренд?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Приєднуйтесь до тисяч компаній, які довіряють BrandDefender
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
            Почати безкоштовний період
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-white">BrandDefender</span>
          </div>
          <p>&copy; 2025 BrandDefender. Всі права захищені.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;