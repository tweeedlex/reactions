import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Tag, Globe, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { getUserData, saveUserData } from '@/utils/localStorage';

const AVAILABLE_SOURCES = [
  'Google SERP',
  'App Store',
  'Google Play',
  'TrustPilot',
  'Facebook',
  'Instagram',
  'Twitter',
  'Reddit',
  'Quora',
  'Форуми',
];

function BrandSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleComplete = () => {
    const userData = getUserData();
    if (!userData) {
      navigate('/auth');
      return;
    }

    const updatedData = {
      ...userData,
      brand: {
        brandName,
        keywords,
        sources: selectedSources,
        saasPoints: 1000,
      },
      isOnboarded: true,
    };

    saveUserData(updatedData);
    navigate('/dashboard');
  };

  const canProceedStep1 = brandName.trim().length > 0;
  const canProceedStep2 = keywords.length > 0;
  const canComplete = selectedSources.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Налаштування бренду</h1>
          </div>
          <p className="text-gray-300">Крок {step} з 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
          {/* Step 1: Brand Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Назва вашого бренду</h2>
                  <p className="text-gray-400">Як називається ваша компанія або продукт?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Назва бренду</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors text-lg"
                  placeholder="Наприклад: TechStartup"
                  autoFocus
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Далі
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Keywords */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Ключові слова</h2>
                  <p className="text-gray-400">За якими словами можна знайти ваш бренд?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Додати ключове слово</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Наприклад: techstartup, tech startup"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Додати
                  </button>
                </div>
              </div>

              {keywords.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Додані ключові слова ({keywords.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-purple-500/20 text-purple-300 px-3 py-2 rounded-lg flex items-center gap-2 border border-purple-500/30"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-purple-400 hover:text-purple-200 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Далі
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Sources */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Джерела моніторингу</h2>
                  <p className="text-gray-400">Оберіть платформи для відстеження відгуків</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Доступні джерела ({selectedSources.length} обрано)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_SOURCES.map((source) => {
                    const isSelected = selectedSources.includes(source);
                    return (
                      <button
                        key={source}
                        onClick={() => toggleSource(source)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500 text-white'
                            : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{source}</span>
                          {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!canComplete}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Check className="w-5 h-5" />
                  Завершити
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            💎 Ви отримаєте <span className="text-purple-400 font-semibold">1000 SaaS поінтів</span> для початку
          </p>
        </div>
      </div>
    </div>
  );
}

export default BrandSetupPage;
