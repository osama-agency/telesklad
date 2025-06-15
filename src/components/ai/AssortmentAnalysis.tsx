import { useState, useEffect } from "react";
import { useDateRange, getDateRangeParams } from "@/context/DateRangeContext";

interface AssortmentAnalysisProps {
  productsData?: any;
}

interface AIAnalysisData {
  facts: string[];
  recommendations: string[];
  forecasts: {
    days30: string;
    days60: string;
    days90: string;
  };
}

export function AssortmentAnalysis({ productsData }: AssortmentAnalysisProps) {
  const { formatMobileDateRange, dateRange } = useDateRange();
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем ИИ-анализ только по кнопке
  const fetchAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('from', dateRange.from.toISOString());
      if (dateRange.to) params.append('to', dateRange.to.toISOString());
      
      const response = await fetch(`/api/analytics/ai?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения ИИ-анализа');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysisData(result.data.analysis);
      } else {
        throw new Error(result.error || 'Неизвестная ошибка');
      }
    } catch (err) {
      console.error('AI Analysis fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка получения данных');
      
      // Устанавливаем fallback данные
      setAnalysisData({
        facts: [
          "72% выручки приносят 4 товара",
          "8 позиций в CZ — не продаются",
          "5 товаров убыточны (–11 420 ₽)",
          "Средняя маржа снизилась на 3%",
          "23 товара требуют срочного пополнения"
        ],
        recommendations: [
          "Увеличить закуп Strattera 10mg",
          "Исключить Wellbutrin",
          "Снизить цену на Atominex 25mg"
        ],
        forecasts: {
          days30: "Ожидается стабильный рост продаж на 5-8%",
          days60: "Возможно снижение активности на 2-3%",
          days90: "Возврат к средним показателям"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Устанавливаем дефолтные данные при загрузке компонента
  useEffect(() => {
    setAnalysisData({
      facts: [
        "72% выручки приносят 4 товара",
        "8 позиций в CZ — не продаются",
        "5 товаров убыточны (–11 420 ₽)",
        "Средняя маржа снизилась на 3%",
        "23 товара требуют срочного пополнения"
      ],
      recommendations: [
        "Увеличить закуп Strattera 10mg",
        "Исключить Wellbutrin",
        "Снизить цену на Atominex 25mg"
      ],
      forecasts: {
        days30: "Ожидается стабильный рост продаж на 5-8%",
        days60: "Возможно снижение активности на 2-3%",
        days90: "Возврат к средним показателям"
      }
    });
  }, []); // Только при первой загрузке

  const facts = analysisData?.facts || [];
  const recommendations = analysisData?.recommendations || [];

  const getRecommendationIcon = (index: number) => {
    const icons = ["✅", "⚠️", "📉", "🔄", "💡"];
    return icons[index % icons.length] || "•";
  };

  if (loading) {
    return (
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card mb-7.5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-dark-6">🤖 ИИ анализирует ваш ассортимент...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card mb-7.5">
      {/* Заголовок */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-1">
          🧠 Анализ ассортимента ({formatMobileDateRange()})
        </h3>
        <p className="text-sm text-dark-6">
          Демонстрационные данные анализа ассортимента. Нажмите кнопку для получения актуального ИИ-анализа.
        </p>
      </div>

      {/* Факты */}
      <div className="mb-6">
        <ul className="space-y-2">
          {facts.map((fact, index) => (
            <li 
              key={index}
              className="flex items-start gap-2 text-sm text-dark dark:text-white"
            >
              <span className="text-dark-6 mt-1 flex-shrink-0">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Рекомендации */}
      <div className="mb-6">
        <h4 className="text-base font-medium text-dark dark:text-white mb-3">
          Рекомендации по закупу
        </h4>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li 
              key={index}
              className="flex items-start gap-2 text-sm text-dark dark:text-white"
            >
              <span className="mt-0.5 flex-shrink-0">
                {getRecommendationIcon(index)}
              </span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Прогнозы */}
      {analysisData?.forecasts && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-2 rounded-lg">
          <h4 className="text-base font-medium text-dark dark:text-white mb-3">
            📈 Прогнозы продаж
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-6">30 дней:</span>
              <span className="text-dark dark:text-white">{analysisData.forecasts.days30}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-6">60 дней:</span>
              <span className="text-dark dark:text-white">{analysisData.forecasts.days60}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-6">90 дней:</span>
              <span className="text-dark dark:text-white">{analysisData.forecasts.days90}</span>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка */}
      <div className="flex justify-start">
        <button 
          onClick={fetchAIAnalysis}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={loading ? "animate-spin" : ""}>🤖</span>
          {loading ? 'ИИ анализирует...' : 'Запросить ИИ анализ'}
        </button>
      </div>
    </div>
  );
} 