import { useState } from 'react';
import { Plus, Tag, Edit2, Trash2, X } from 'lucide-react';
import { useCompanyTags } from '@/hooks/useCompanyTags';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface CompanyTagsManagerProps {
  className?: string;
}

export function CompanyTagsManager({ className = '' }: CompanyTagsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Отримуємо поточну компанію з Redux
  const currentCompany = useSelector((state: RootState) => state.company.currentCompany);
  
  // Використовуємо хук для роботи з тегами
  const { 
    tags: companyTags, 
    loading, 
    error,
    createTag, 
    updateTag,
    deleteTag,
    getTagsSortedByPriority
  } = useCompanyTags(currentCompany?.id);

  const handleCreateTag = async () => {
    if (newTagTitle.trim() && currentCompany) {
      try {
        await createTag(newTagTitle.trim());
        setNewTagTitle('');
        setShowAddForm(false);
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    }
  };

  const handleUpdateTag = async (id: number) => {
    if (editingTitle.trim()) {
      try {
        await updateTag(id, { title: editingTitle.trim() });
        setEditingTagId(null);
        setEditingTitle('');
      } catch (error) {
        console.error('Error updating tag:', error);
      }
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити цей тег?')) {
      try {
        await deleteTag(id);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const startEditing = (id: number, title: string) => {
    setEditingTagId(id);
    setEditingTitle(title);
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditingTitle('');
  };

  const sortedTags = getTagsSortedByPriority();

  if (!currentCompany) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 ${className}`}>
        <p className="text-gray-400 text-center">Оберіть компанію для управління тегами</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Теги компанії
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Додати тег
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Форма додавання тегу */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-purple-500/30">
          <h4 className="text-white font-medium mb-3">Додати новий тег</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTagTitle}
              onChange={(e) => setNewTagTitle(e.target.value)}
              placeholder="Назва тегу"
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
            />
            <button
              onClick={handleCreateTag}
              disabled={!newTagTitle.trim() || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {loading ? '...' : 'Додати'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTagTitle('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Список тегів */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-400">Завантаження тегів...</p>
          </div>
        )}

        {!loading && sortedTags.length === 0 && (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Теги ще не додані</p>
            <p className="text-gray-500 text-sm">Натисніть "Додати тег" щоб створити перший тег</p>
          </div>
        )}

        {!loading && sortedTags.map((tag) => (
          <div key={tag.id} className="bg-slate-700/50 rounded-lg p-4 border border-gray-600">
            {editingTagId === tag.id ? (
              // Режим редагування
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateTag(tag.id)}
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateTag(tag.id)}
                  disabled={!editingTitle.trim() || loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Зберегти
                </button>
                <button
                  onClick={cancelEditing}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                >
                  Скасувати
                </button>
              </div>
            ) : (
              // Звичайний режим
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm font-medium">
                    {tag.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    Пріоритет: {tag.attention_rank}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(tag.id, tag.title)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                    title="Редагувати"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              Створено: {new Date(tag.created_at).toLocaleDateString('uk-UA')}
              {tag.updated_at !== tag.created_at && (
                <span className="ml-2">
                  Оновлено: {new Date(tag.updated_at).toLocaleDateString('uk-UA')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
