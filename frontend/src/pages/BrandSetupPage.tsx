import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Tag, Globe, Check, ArrowRight, ArrowLeft, Link, ExternalLink } from 'lucide-react';
import { getUserData, saveUserData, updateSourceLink, getSourceLink, saveCompanyStatus } from '@/utils/localStorage';
import SetupSourceModal from '@/components/SetupSourceModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyCreation } from '@/hooks/useCompanyCreation';
import type { SourceLink } from '@/types';

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
  const { user, refreshCompanyStatus } = useAuth();
  const { createCompanyWithUser } = useCompanyCreation();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourceLinks, setSourceLinks] = useState<SourceLink[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

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
      // Видаляємо посилання при відключенні джерела
      setSourceLinks(sourceLinks.filter(link => link.name !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
      // Відкриваємо модальне вікно для введення посилання
      setCurrentSource(source);
      setIsSourceModalOpen(true);
    }
  };

  const handleSourceLinkSave = (sourceLink: SourceLink) => {
    updateSourceLink(sourceLink.name, sourceLink.url);
    setSourceLinks(prev => {
      const existingIndex = prev.findIndex(link => link.name === sourceLink.name);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = sourceLink;
        return updated;
      }
      return [...prev, sourceLink];
    });
  };

  const handleEditSourceLink = (sourceName: string) => {
    setCurrentSource(sourceName);
    setIsSourceModalOpen(true);
  };

  const handleComplete = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCreating(true);

    try {
      // Створюємо компанію в Supabase
      const { error } = await createCompanyWithUser(user, {
        title: brandName,
        site_url: siteUrl.trim() || '', // Використовуємо введене посилання або порожній рядок
      });

      if (error) {
        console.error('Error creating company:', error);
        // Продовжуємо з локальним збереженням навіть якщо є помилка
      }

      // Зберігаємо дані локально
      const userData = getUserData();
      if (userData) {
        const updatedData = {
          ...userData,
          brand: {
            brandName,
            keywords,
            sources: selectedSources,
            sourceLinks,
            saasPoints: 1000,
          },
          isOnboarded: true,
        };

        saveUserData(updatedData);
      }

      // Оновлюємо стан в AuthContext та перенаправляємо
      await refreshCompanyStatus();
      saveCompanyStatus(true); // Зберігаємо в localStorage
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during setup completion:', error);
      // Продовжуємо з локальним збереженням
      const userData = getUserData();
      if (userData) {
        const updatedData = {
          ...userData,
          brand: {
            brandName,
            keywords,
            sources: selectedSources,
            sourceLinks,
            saasPoints: 1000,
          },
          isOnboarded: true,
        };

        saveUserData(updatedData);
        await refreshCompanyStatus();
        saveCompanyStatus(true); // Зберігаємо в localStorage
        navigate('/dashboard');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedStep1 = brandName.trim().length > 0;
  const canProceedStep2 = keywords.length > 0;
  // Джерело вважається підключеним тільки якщо є посилання
  const connectedSources = selectedSources.filter(source => 
    sourceLinks.some(link => link.name === source && link.url.trim())
  );
  const canComplete = connectedSources.length > 0;

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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Назва бренду *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors text-lg"
                    placeholder="Наприклад: TechStartup"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Посилання на сайт (опціонально)</label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors text-lg"
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">Додайте посилання на офіційний сайт вашого бренду</p>
                </div>
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
                  Доступні джерела ({connectedSources.length} підключено з {selectedSources.length} обрано)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_SOURCES.map((source) => {
                    const isSelected = selectedSources.includes(source);
                    const hasLink = sourceLinks.some(link => link.name === source && link.url.trim());
                    const isConnected = isSelected && hasLink;
                    
                    return (
                      <div key={source} className="relative">
                        <button
                          onClick={() => toggleSource(source)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            isConnected
                              ? 'bg-green-500/20 border-green-500 text-white'
                              : isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-white'
                              : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-purple-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{source}</span>
                            {isConnected && <Check className="w-5 h-5 text-green-400" />}
                            {isSelected && !hasLink && <Link className="w-5 h-5 text-orange-400" />}
                          </div>
                          {isSelected && !hasLink && (
                            <p className="text-xs text-orange-300 mt-1">
                              Потрібно ввести посилання
                            </p>
                          )}
                        </button>
                        
                        {isConnected && (
                          <button
                            onClick={() => handleEditSourceLink(source)}
                            className="absolute top-2 right-2 p-1 bg-slate-700/80 hover:bg-slate-600 rounded text-gray-300 hover:text-white transition-colors"
                            title="Редагувати посилання"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {selectedSources.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-purple-500/20">
                    <div className="flex items-start gap-3">
                      <Link className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Статус підключення</h4>
                        <p className="text-xs text-gray-400">
                          Зелені джерела повністю підключені. Оранжеві потребують введення посилання. 
                          Натисніть на джерело, щоб налаштувати посилання.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  disabled={!canComplete || isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Створення...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Завершити
                    </>
                  )}
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

      {/* Source Setup Modal */}
      <SetupSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSave={handleSourceLinkSave}
        sourceName={currentSource}
        existingUrl={getSourceLink(currentSource) || undefined}
      />
    </div>
  );
}

export default BrandSetupPage;
