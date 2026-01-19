'use client';

import { useState } from 'react';
import { ChecklistItem, VisiteChecklist } from '@/types';
import { groupByCategory } from '@/data/checklistTemplate';
import { FaCheckCircle, FaRegCircle, FaStickyNote, FaSave } from 'react-icons/fa';

interface VisiteChecklistProps {
  checklist: VisiteChecklist;
  onSave: (checklist: VisiteChecklist) => void;
  readonly?: boolean;
}

export function VisiteChecklistComponent({ checklist, onSave, readonly = false }: VisiteChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(checklist.items);
  const [notesGenerales, setNotesGenerales] = useState(checklist.notesGenerales || '');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const groupedItems = groupByCategory(items);
  const totalItems = items.length;
  const checkedItems = items.filter(i => i.checked).length;
  const progressPercent = Math.round((checkedItems / totalItems) * 100);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    if (readonly) return;

    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);
  };

  const updateNote = (itemId: string, note: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, note } : item
    );
    setItems(newItems);
    setEditingNote(null);
  };

  const handleSave = () => {
    onSave({
      items,
      notesGenerales,
      completedAt: checkedItems === totalItems ? new Date() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Barre de progression */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">
            📋 Checklist de visite
          </h3>
          <span className="text-sm font-semibold text-gray-600">
            {checkedItems}/{totalItems} ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              progressPercent === 100 ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {progressPercent === 100 && (
          <p className="text-green-600 text-sm font-medium mt-2">
            ✓ Checklist complétée !
          </p>
        )}

        {!readonly && (
          <button
            onClick={handleSave}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FaSave />
            <span>Sauvegarder la checklist</span>
          </button>
        )}
      </div>

      {/* Checklist par catégories */}
      <div className="space-y-3">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const categoryChecked = categoryItems.filter(i => i.checked).length;
          const categoryTotal = categoryItems.length;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header de catégorie */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                  <h4 className="font-bold text-gray-800 text-left">{category}</h4>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {categoryChecked}/{categoryTotal}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(categoryChecked / categoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Items de la catégorie */}
              {isExpanded && (
                <div className="px-6 pb-4 space-y-2">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="border-l-4 border-gray-200 pl-4 py-2">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          disabled={readonly}
                          className={`mt-1 flex-shrink-0 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {item.checked ? (
                            <FaCheckCircle className="text-2xl text-green-500" />
                          ) : (
                            <FaRegCircle className="text-2xl text-gray-300 hover:text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1">
                          <p className={`text-gray-800 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                            {item.label}
                          </p>

                          {/* Zone de note */}
                          {editingNote === item.id && !readonly ? (
                            <div className="mt-2">
                              <textarea
                                value={item.note || ''}
                                onChange={(e) => {
                                  const newItems = items.map(i =>
                                    i.id === item.id ? { ...i, note: e.target.value } : i
                                  );
                                  setItems(newItems);
                                }}
                                onBlur={() => setEditingNote(null)}
                                placeholder="Ajouter une note..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                autoFocus
                              />
                            </div>
                          ) : item.note ? (
                            <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                              <p className="text-sm text-gray-700 italic">{item.note}</p>
                            </div>
                          ) : null}

                          {!readonly && editingNote !== item.id && (
                            <button
                              onClick={() => setEditingNote(item.id)}
                              className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <FaStickyNote />
                              <span>{item.note ? 'Modifier la note' : 'Ajouter une note'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes générales */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
          <FaStickyNote className="text-yellow-500" />
          <span>Notes générales</span>
        </h4>
        <textarea
          value={notesGenerales}
          onChange={(e) => setNotesGenerales(e.target.value)}
          disabled={readonly}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          rows={4}
          placeholder="Notes générales sur la visite, impressions, points à vérifier..."
        />
      </div>
    </div>
  );
}
