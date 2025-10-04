import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Play, Pause, Check, X, Crown, Zap, Building } from 'lucide-react';
import { getSubscriptionStatus, updateSubscription, toggleParsing } from '@/utils/localStorage';
import type { Subscription } from '@/types';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Shield,
    features: [
      'До 2 джерел моніторингу',
      'Базовий парсинг',
      'Email підтримка',
      '1 ключове слово'
    ],
    limitations: [
      'Обмежена кількість згадок',
      'Без пріоритетної підтримки'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    icon: Zap,
    features: [
      'До 5 джерел моніторингу',
      'Розширений парсинг',
      'Пріоритетна підтримка',
      'До 10 ключових слів',
      'Експорт звітів'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    icon: Crown,
    features: [
      'До 15 джерел моніторингу',
      'Повний парсинг',
      '24/7 підтримка',
      'Необмежена кількість ключових слів',
      'API доступ',
      'Кастомні алерти',
      'Команда до 5 користувачів'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    icon: Building,
    features: [
      'Необмежена кількість джерел',
      'Персональний менеджер',
      'Кастомна інтеграція',
      'Білий лейбл',
      'Необмежена команда',
      'SLA гарантії'
    ]
  }
];

function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subData = getSubscriptionStatus();
    if (subData) {
      setSubscription(subData);
    } else {
      // Якщо даних немає, створюємо базову підписку
      const defaultSub: Subscription = {
        isActive: true,
        plan: 'basic',
        parsingEnabled: true,
        maxSources: 5,
        usedSources: 0,
        autoRenew: true,
      };
      setSubscription(defaultSub);
    }
    setLoading(false);
  }, []);

  const handleToggleParsing = () => {
    const newState = toggleParsing();
    setSubscription(prev => prev ? { ...prev, parsingEnabled: newState } : null);
  };

  const handlePlanChange = (planId: string) => {
    const selectedPlan = PLANS.find(plan => plan.id === planId);
    if (selectedPlan) {
      updateSubscription({
        plan: planId as 'free' | 'basic' | 'pro' | 'enterprise',
        maxSources: planId === 'free' ? 2 : planId === 'basic' ? 5 : planId === 'pro' ? 15 : 999,
        isActive: true,
        autoRenew: true,
      });
      setSubscription(prev => prev ? { 
        ...prev, 
        plan: planId as 'free' | 'basic' | 'pro' | 'enterprise',
        maxSources: planId === 'free' ? 2 : planId === 'basic' ? 5 : planId === 'pro' ? 15 : 999,
        isActive: true,
        autoRenew: true,
      } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Завантаження підписки...</p>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS.find(plan => plan.id === subscription.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад до дашборду
              </Link>
              <div className="flex items-center gap-3 ml-8">
                <Shield className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Підписка та налаштування</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Поточний статус</h2>
                <p className="text-gray-400">Управління вашою підпискою та парсингом</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-medium ${
                subscription.isActive 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {subscription.isActive ? 'Активна' : 'Неактивна'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {currentPlan && <currentPlan.icon className="w-6 h-6 text-purple-400" />}
                  <h3 className="font-semibold text-white">План</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{currentPlan?.name}</p>
                <p className="text-gray-400 text-sm">
                  {subscription.maxSources === 999 ? 'Необмежено' : `До ${subscription.maxSources}`} джерел
                </p>
              </div>

              {/* Parsing Status */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {subscription.parsingEnabled ? (
                    <Play className="w-6 h-6 text-green-400" />
                  ) : (
                    <Pause className="w-6 h-6 text-red-400" />
                  )}
                  <h3 className="font-semibold text-white">Парсинг</h3>
                </div>
                <p className={`text-2xl font-bold mb-1 ${
                  subscription.parsingEnabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {subscription.parsingEnabled ? 'Активний' : 'Зупинений'}
                </p>
                <button
                  onClick={handleToggleParsing}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    subscription.parsingEnabled
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                  }`}
                >
                  {subscription.parsingEnabled ? 'Зупинити' : 'Запустити'}
                </button>
              </div>

              {/* Usage */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold text-white">Використання</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {subscription.usedSources} / {subscription.maxSources === 999 ? '∞' : subscription.maxSources}
                </p>
                <p className="text-gray-400 text-sm">Джерел підключено</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Тарифні плани</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === subscription.plan;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border transition-all ${
                    isCurrentPlan
                      ? 'border-purple-500 ring-2 ring-purple-500/20'
                      : 'border-slate-600 hover:border-purple-500/50'
                  } ${plan.popular ? 'ring-2 ring-orange-500/20 border-orange-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Популярний
                      </span>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Поточний
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-1">
                      ${plan.price}
                      <span className="text-sm text-gray-400 font-normal">/міс</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations?.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isCurrentPlan
                        ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transform hover:scale-105'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                    }`}
                  >
                    {isCurrentPlan ? 'Поточний план' : 'Обрати план'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Інформація про парсинг</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Що таке парсинг?</h4>
              <p className="text-sm text-gray-400">
                Парсинг - це автоматичне відстеження згадок вашого бренду в соціальних мережах, 
                форумах та інших джерелах. Коли парсинг активний, ми постійно шукаємо нові згадки 
                та надсилаємо вам алерти.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Коли зупиняти парсинг?</h4>
              <p className="text-sm text-gray-400">
                Можете зупинити парсинг тимчасово, якщо не хочете отримувати алерти або 
                економите ресурси. Після зупинки ви не будете отримувати нові згадки, 
                але всі попередні дані залишаться доступними.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;
