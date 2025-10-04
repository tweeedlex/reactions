import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

interface ParsingIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interval: { days: number; hours: number; minutes: number }) => void;
  currentInterval: { days: number; hours: number; minutes: number };
}

function ParsingIntervalModal({ isOpen, onClose, onSave, currentInterval }: ParsingIntervalModalProps) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDays(currentInterval.days || 0);
      setHours(currentInterval.hours || 0);
      setMinutes(currentInterval.minutes || 0);
      setError('');
    }
  }, [isOpen, currentInterval]);

  const handleSave = () => {
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
    if (totalMinutes < 5) {
      setError('Інтервал парсингу не може бути меншим за 5 хвилин.');
      return;
    }
    setError('');
    onSave({ days, hours, minutes });
    onClose();
  };

  if (!isOpen) return null;

  const NumberInput = ({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max: number }) => (
    <div className="flex flex-col items-center">
      <label className="text-sm text-gray-400 mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (val >= 0 && val <= max) {
            onChange(val);
          }
        }}
        className="w-24 bg-slate-700 text-white text-center text-2xl font-bold p-3 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none"
        min="0"
        max={max}
      />
    </div>
  );

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
          <p className="text-gray-300 text-center">Встановіть, як часто система має перевіряти нові згадки. Мінімальний інтервал - 5 хвилин.</p>
          
          <div className="flex justify-center items-center gap-4">
            <NumberInput label="Дні" value={days} onChange={setDays} max={30} />
            <span className="text-3xl font-bold text-purple-400">:</span>
            <NumberInput label="Години" value={hours} onChange={setHours} max={23} />
            <span className="text-3xl font-bold text-purple-400">:</span>
            <NumberInput label="Хвилини" value={minutes} onChange={setMinutes} max={59} />
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
