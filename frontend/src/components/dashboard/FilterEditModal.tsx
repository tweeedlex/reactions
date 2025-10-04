import { useState, useEffect } from 'react';
import { X, Building2, Tag, Globe, Check, Save, Link, ExternalLink } from 'lucide-react';
import { getBrandFilters, updateBrandFilters, updateSourceLink, getSourceLink, removeSourceLink } from '@/utils/localStorage';
import SetupSourceModal from '@/components/SetupSourceModal';
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

  useEffect(() => {
    if (isOpen) {
      const filters = getBrandFilters();
      if (filters) {
        setBrandName(filters.brandName);
        setKeywords(filters.keywords);
        setSelectedSources(filters.sources);
        setSourceLinks(filters.sourceLinks || []);
      }
    }
  }, [isOpen]);

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
      removeSourceLink(source);
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

  const handleSave = () => {
    // Джерело вважається підключеним тільки якщо є посилання
    const connectedSources = selectedSources.filter(source => 
      sourceLinks.some(link => link.name === source && link.url.trim())
    );
    
    if (brandName.trim() && keywords.length > 0 && connectedSources.length > 0) {
      updateBrandFilters(brandName, keywords, selectedSources, sourceLinks);
      onSave?.();
      onClose();
    }
  };

  const connectedSources = selectedSources.filter(source => 
    sourceLinks.some(link => link.name === source && link.url.trim())
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
                const isSelected = selectedSources.includes(source);
                const hasLink = sourceLinks.some(link => link.name === source && link.url.trim());
                const isConnected = isSelected && hasLink;
                
                return (
                  <div key={source} className="relative">
                    <button
                      onClick={() => toggleSource(source)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        isConnected
                          ? 'bg-green-500/20 border-green-500 text-white'
                          : isSelected
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{source}</span>
                        {isConnected && <Check className="w-4 h-4 text-green-400" />}
                        {isSelected && !hasLink && <Link className="w-4 h-4 text-orange-400" />}
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
        onClose={() => setIsSourceModalOpen(false)}
        onSave={handleSourceLinkSave}
        sourceName={currentSource}
        existingUrl={getSourceLink(currentSource) || undefined}
      />
    </div>
  );
}

export default FilterEditModal;
