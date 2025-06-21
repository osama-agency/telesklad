"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Save, XCircle } from "lucide-react";

interface FAQEntry {
  id: number;
  question: string;
  answer: string;
}

interface ManageFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ManageFAQModal({ isOpen, onClose, onSave }: ManageFAQModalProps) {
  const [faqEntries, setFaqEntries] = useState<FAQEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ question: string; answer: string }>({
    question: "",
    answer: ""
  });
  const [newEntry, setNewEntry] = useState<{ question: string; answer: string }>({
    question: "",
    answer: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFAQEntries();
    }
  }, [isOpen]);

  const fetchFAQEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/webapp/support');
      if (response.ok) {
        const data = await response.json();
        setFaqEntries(data.faq_items || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.question.trim() || !newEntry.answer.trim()) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await fetch('/api/webapp/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newEntry.question,
          answer: newEntry.answer
        })
      });

      if (response.ok) {
        await fetchFAQEntries();
        setNewEntry({ question: "", answer: "" });
        setShowAddForm(false);
        onSave();
      } else {
        alert('Ошибка добавления записи');
      }
    } catch (error) {
      console.error('Ошибка добавления записи:', error);
      alert('Ошибка добавления записи');
    }
  };

  const handleEditEntry = async (id: number) => {
    if (!editingEntry.question.trim() || !editingEntry.answer.trim()) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await fetch('/api/webapp/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          question: editingEntry.question,
          answer: editingEntry.answer
        })
      });

      if (response.ok) {
        await fetchFAQEntries();
        setEditingId(null);
        setEditingEntry({ question: "", answer: "" });
        onSave();
      } else {
        alert('Ошибка обновления записи');
      }
    } catch (error) {
      console.error('Ошибка обновления записи:', error);
      alert('Ошибка обновления записи');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      const response = await fetch('/api/webapp/support', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        await fetchFAQEntries();
        onSave();
      } else {
        alert('Ошибка удаления записи');
      }
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      alert('Ошибка удаления записи');
    }
  };

  const startEditing = (entry: FAQEntry) => {
    setEditingId(entry.id);
    setEditingEntry({
      question: entry.question,
      answer: entry.answer
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingEntry({ question: "", answer: "" });
  };

  const cancelAdding = () => {
    setShowAddForm(false);
    setNewEntry({ question: "", answer: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">
            Управление FAQ поддержки
          </h2>
          <button
            onClick={onClose}
            className="text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Добавить новую запись
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-4">
                Новая запись FAQ
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                    Вопрос
                  </label>
                  <input
                    type="text"
                    value={newEntry.question}
                    onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                    placeholder="Введите вопрос..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                    Ответ
                  </label>
                  <textarea
                    value={newEntry.answer}
                    onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all resize-none"
                    placeholder="Введите ответ..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEntry}
                    className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 flex items-center gap-2"
                  >
                    <Save size={16} />
                    Сохранить
                  </button>
                  <button
                    onClick={cancelAdding}
                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:scale-105 hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF] mx-auto"></div>
              <p className="text-[#64748B] dark:text-gray-400 mt-2">Загрузка...</p>
            </div>
          ) : faqEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B] dark:text-gray-400">Нет записей FAQ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqEntries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                  {editingId === entry.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                          Вопрос
                        </label>
                        <input
                          type="text"
                          value={editingEntry.question}
                          onChange={(e) => setEditingEntry({ ...editingEntry, question: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                          Ответ
                        </label>
                        <textarea
                          value={editingEntry.answer}
                          onChange={(e) => setEditingEntry({ ...editingEntry, answer: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEntry(entry.id)}
                          className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 flex items-center gap-2"
                        >
                          <Save size={16} />
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:scale-105 hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
                          {entry.question}
                        </h3>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEditing(entry)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            title="Редактировать"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[#64748B] dark:text-gray-400 whitespace-pre-line">
                        {entry.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-[#374151] dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
