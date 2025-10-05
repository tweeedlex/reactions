import { CompanyTagsManager } from './CompanyTagsManager';

// Приклад використання компонента CompanyTagsManager
export function CompanyTagsExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Управління тегами компанії</h1>
      
      <CompanyTagsManager />
      
      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-3">Як використовувати:</h3>
        <ul className="text-gray-300 space-y-2 text-sm">
          <li>• Натисніть "Додати тег" щоб створити новий тег</li>
          <li>• Використовуйте іконку редагування для зміни назви тегу</li>
          <li>• Використовуйте іконку видалення для видалення тегу</li>
          <li>• Теги автоматично завантажуються для поточної компанії</li>
          <li>• Теги відображаються відсортовані за пріоритетом</li>
        </ul>
      </div>
    </div>
  );
}
