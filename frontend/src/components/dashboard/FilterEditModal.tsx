import { useState, useEffect } from 'react';
import { X, Building2, Tag, Globe, Check, Save, Link, ExternalLink } from 'lucide-react';
import { getBrandFilters, updateBrandFilters, updateSourceLink, removeSourceLink } from '@/utils/localStorage';
import SetupSourceModal from '@/components/SetupSourceModal';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useCompanyKeywords } from '@/hooks/useCompanyKeywords';
import { updateCompany } from '@/store/slices/companySlice';
import type { SourceLink } from '@/types';

const AVAILABLE_SOURCES = [
  'App Store',
  'Google Play',
  'Google Maps',
  'Google SERP',
  'TrustPilot',
  'Facebook',
  'Instagram',
  'Twitter',
  'Reddit',
  'Quora',
  'Форуми',
];

const ACTIVE_SOURCES = [
  'App Store',
  'Google Play',
  'Google Maps',
  'Instagram',
];

interface FilterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

function FilterEditModal({ isOpen, onClose, onSave }: FilterEditModalProps) {
  const [brandName, setBrandName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourceLinks, setSourceLinks] = useState<SourceLink[]>([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [currentSource, setCurrentSource] = useState<string>('');
  const [existingLinks, setExistingLinks] = useState<Array<{ id: number | string; url: string; title?: string }>>([]);
  
  const dispatch = useAppDispatch();
  
  // Redux state для джерел даних з Supabase
  const { dataSources, currentCompany } = useAppSelector(state => state.company);
  
  // Використовуємо хук для роботи з ключовими словами
  const { 
    keywords: apiKeywords, 
    createKeyword, 
    deleteKeyword,
    getKeywordsAsStrings 
  } = useCompanyKeywords(currentCompany?.id);

  useEffect(() => {
    if (isOpen) {
      // Завантажуємо дані з API замість localStorage
      if (currentCompany) {
        setBrandName(currentCompany.title);
        setKeywords(getKeywordsAsStrings());
      }
      
      // Залишаємо джерела з localStorage для сумісності
      const filters = getBrandFilters();
      if (filters) {
        setSelectedSources(filters.sources);
        setSourceLinks(filters.sourceLinks || []);
      }
    }
  }, [isOpen, currentCompany, apiKeywords]);

  const handleAddKeyword = async () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      try {
        await createKeyword(keywordInput.trim());
        setKeywords([...keywords, keywordInput.trim()]);
        setKeywordInput('');
      } catch (error) {
        console.error('Error creating keyword:', error);
      }
    }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    try {
      // Знаходимо ID ключового слова в API
      const apiKeyword = apiKeywords.find(k => k.keyword === keyword);
      if (apiKeyword) {
        await deleteKeyword(apiKeyword.id);
      }
      setKeywords(keywords.filter((k) => k !== keyword));
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  const toggleSource = (source: string) => {
    // Перевіряємо чи джерело активне
    if (!ACTIVE_SOURCES.includes(source)) {
      return;
    }

    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
      // Видаляємо посилання при відключенні джерела
      setSourceLinks(sourceLinks.filter(link => link.source !== source));
      removeSourceLink(source);
    } else {
      setSelectedSources([...selectedSources, source]);
      // Відкриваємо модальне вікно для введення посилання
      setCurrentSource(source);
      setIsSourceModalOpen(true);
    }
  };

  const handleSourceClick = (source: string) => {
    // Перевіряємо чи джерело активне
    if (!ACTIVE_SOURCES.includes(source)) {
      return;
    }

    // Знаходимо існуючі посилання для цього джерела
    const existingLinks = dataSources.find(ds => ds.title === source)?.links || [];
    const localLinks = sourceLinks.filter(link => link.source === source);
    
    // Об'єднуємо локальні та Supabase посилання
    const allLinks = [
      ...existingLinks.map(link => ({ id: link.id, url: link.url, title: `${source} - Посилання ${link.id}` })),
      ...localLinks.map((link, index) => ({ id: `local_${index}`, url: link.url, title: link.title || `${source} - Локальне` }))
    ];

    setCurrentSource(source);
    setExistingLinks(allLinks);
    setIsSourceModalOpen(true);
  };

  const handleSourceLinkSave = (sourceLink: SourceLink) => {
    updateSourceLink(sourceLink.source, sourceLink.url, sourceLink.title);
    setSourceLinks(prev => {
      const existingIndex = prev.findIndex(link => link.source === sourceLink.source);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = sourceLink;
        return updated;
      }
      return [...prev, sourceLink];
    });
    setIsSourceModalOpen(false);
    setExistingLinks([]);
  };

  const handleEditSourceLink = (sourceName: string) => {
    // Перевіряємо чи джерело активне
    if (!ACTIVE_SOURCES.includes(sourceName)) {
      return;
    }

    setCurrentSource(sourceName);
    setIsSourceModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Джерело вважається підключеним тільки якщо є посилання і воно активне
      const connectedSources = selectedSources.filter(source => 
        ACTIVE_SOURCES.includes(source) && sourceLinks.some(link => link.source === source && link.url.trim())
      );
      
      if (brandName.trim() && keywords.length > 0 && connectedSources.length > 0) {
        // Оновлюємо назву компанії через API
        if (currentCompany && currentCompany.title !== brandName.trim()) {
          await dispatch(updateCompany({ 
            id: currentCompany.id, 
            updates: { title: brandName.trim() } 
          }) as any);
        }
        
        // Оновлюємо localStorage для джерел (для сумісності)
        updateBrandFilters(brandName, keywords, selectedSources, sourceLinks);
        
        onSave?.();
        onClose();
      }
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const connectedSources = selectedSources.filter(source => 
    ACTIVE_SOURCES.includes(source) && sourceLinks.some(link => link.source === source && link.url.trim())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-purple-500/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Редагувати фільтри</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Brand Name */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Назва бренду</h3>
                <p className="text-sm text-gray-400">Основна назва вашого бренду</p>
              </div>
            </div>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Наприклад: TechStartup"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ключові слова</h3>
                <p className="text-sm text-gray-400">Слова для пошуку згадок вашого бренду</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Додати ключове слово"
              />
              <button
                onClick={handleAddKeyword}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Додати
              </button>
            </div>

            {keywords.length > 0 && (
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
            )}
          </div>

          {/* Sources */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Джерела моніторингу</h3>
                <p className="text-sm text-gray-400">
                  Платформи для відстеження відгуків ({connectedSources.length} підключено з {selectedSources.length} обрано)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_SOURCES.map((source) => {
                const isActive = ACTIVE_SOURCES.includes(source);
                const isSelected = selectedSources.includes(source);
                const hasLink = sourceLinks.some(link => link.source === source && link.url.trim());
                // Перевіряємо чи є джерело в Supabase
                const hasSupabaseData = dataSources.some(ds => ds.title === source);
                const isConnected = isSelected && (hasLink || hasSupabaseData);
                
                return (
                  <div key={source} className="relative">
                    {!isActive && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                          Soon
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => isActive ? (isConnected ? handleSourceClick(source) : toggleSource(source)) : undefined}
                      disabled={!isActive}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        !isActive
                          ? 'bg-slate-800/50 border-slate-700 text-gray-500 cursor-not-allowed opacity-60'
                          : isConnected
                          ? 'bg-green-500/20 border-green-500 text-white hover:bg-green-500/30'
                          : isSelected
                          ? 'bg-orange-500/20 border-orange-500 text-white hover:bg-orange-500/30'
                          : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{source}</span>
                        {isActive && isConnected && <Check className="w-4 h-4 text-green-400" />}
                        {isActive && isSelected && !hasLink && <Link className="w-4 h-4 text-orange-400" />}
                      </div>
                      {isActive && isSelected && !hasLink && (
                        <p className="text-xs text-orange-300 mt-1">
                          Потрібно ввести посилання
                        </p>
                      )}
                    </button>
                    
                    {isActive && isConnected && (
                      <button
                        onClick={() => handleEditSourceLink(source)}
                        className="absolute top-1 right-1 p-1 bg-slate-700/80 hover:bg-slate-600 rounded text-gray-300 hover:text-white transition-colors"
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-purple-500/20 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            disabled={!brandName.trim() || keywords.length === 0 || connectedSources.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Save className="w-5 h-5" />
            Зберегти зміни
          </button>
        </div>
      </div>

      {/* Source Setup Modal */}
        <SetupSourceModal
          isOpen={isSourceModalOpen}
          onClose={() => {
            setIsSourceModalOpen(false);
            setExistingLinks([]);
          }}
          onSave={handleSourceLinkSave}
          sourceName={currentSource}
          existingLinks={existingLinks}
        />
    </div>
  );
}

export default FilterEditModal;
