import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

interface ParsingIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interval: { days: number; hours: number; minutes: number }) => void;
  currentInterval: { days: number; hours: number; minutes: number };
}

// Фіксовані інтервали
const FIXED_INTERVALS = [
  { label: '1m', value: { days: 0, hours: 0, minutes: 1 } },
  { label: '5m', value: { days: 0, hours: 0, minutes: 5 } },
  { label: '15m', value: { days: 0, hours: 0, minutes: 15 } },
  { label: '30m', value: { days: 0, hours: 0, minutes: 30 } },
  { label: '1h', value: { days: 0, hours: 1, minutes: 0 } },
  { label: '2h', value: { days: 0, hours: 2, minutes: 0 } },
  { label: '4h', value: { days: 0, hours: 4, minutes: 0 } },
  { label: '8h', value: { days: 0, hours: 8, minutes: 0 } },
  { label: '12h', value: { days: 0, hours: 12, minutes: 0 } },
  { label: '24h', value: { days: 0, hours: 24, minutes: 0 } },
];

function ParsingIntervalModal({ isOpen, onClose, onSave, currentInterval }: ParsingIntervalModalProps) {
  const [selectedInterval, setSelectedInterval] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Знаходимо відповідний інтервал з фіксованих
      const matchingInterval = FIXED_INTERVALS.find(interval => 
        interval.value.days === currentInterval.days &&
        interval.value.hours === currentInterval.hours &&
        interval.value.minutes === currentInterval.minutes
      );
      setSelectedInterval(matchingInterval ? matchingInterval.value : null);
      setError('');
    }
  }, [isOpen, currentInterval]);

  const handleSave = () => {
    if (!selectedInterval) {
      setError('Будь ласка, оберіть інтервал парсингу.');
      return;
    }
    setError('');
    onSave(selectedInterval);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-md w-full">
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Інтервал парсингу</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-300 text-center">Оберіть інтервал, з яким система має перевіряти нові згадки.</p>
          
          <div className="grid grid-cols-5 gap-2">
            {FIXED_INTERVALS.map((interval) => {
              const isSelected = selectedInterval && 
                selectedInterval.days === interval.value.days &&
                selectedInterval.hours === interval.value.hours &&
                selectedInterval.minutes === interval.value.minutes;
              
              return (
                <button
                  key={interval.label}
                  onClick={() => setSelectedInterval(interval.value)}
                  className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {interval.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-purple-500/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParsingIntervalModal;
