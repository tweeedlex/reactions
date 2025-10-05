import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AIResponse {
  suggestion: string;
  tone: 'professional' | 'friendly' | 'apologetic' | 'grateful';
  category: 'complaint' | 'praise' | 'question' | 'suggestion';
  confidence: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Генерує швидку відповідь на відгук
   */
  async generateQuickResponse(feedback: {
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    source: string;
    author: string;
    category: string;
  }): Promise<AIResponse> {
    this.logger.log(`Генеруємо відповідь для відгуку: ${feedback.text.substring(0, 50)}...`);

    try {
      // Визначаємо тон відповіді на основі тональності
      const tone = this.determineTone(feedback.sentiment, feedback.text);
      
      // Визначаємо категорію відгуку
      const category = this.determineCategory(feedback.text, feedback.category);
      
      // Генеруємо відповідь
      const suggestion = await this.generateResponse(feedback, tone, category);
      
      // Розраховуємо впевненість
      const confidence = this.calculateConfidence(feedback, suggestion);

      return {
        suggestion,
        tone,
        category,
        confidence
      };
    } catch (error) {
      this.logger.error('Помилка генерації відповіді:', error);
      return this.getFallbackResponse(feedback);
    }
  }

  /**
   * Визначає тон відповіді
   */
  private determineTone(sentiment: string, text: string): 'professional' | 'friendly' | 'apologetic' | 'grateful' {
    const lowerText = text.toLowerCase();
    
    if (sentiment === 'negative') {
      // Перевіряємо на скарги
      if (lowerText.includes('проблема') || lowerText.includes('погано') || lowerText.includes('не працює')) {
        return 'apologetic';
      }
      return 'professional';
    }
    
    if (sentiment === 'positive') {
      if (lowerText.includes('дякую') || lowerText.includes('чудово') || lowerText.includes('супер')) {
        return 'grateful';
      }
      return 'friendly';
    }
    
    return 'professional';
  }

  /**
   * Визначає категорію відгуку
   */
  private determineCategory(text: string, existingCategory: string): 'complaint' | 'praise' | 'question' | 'suggestion' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('?') || lowerText.includes('чи') || lowerText.includes('як')) {
      return 'question';
    }
    
    if (lowerText.includes('проблема') || lowerText.includes('погано') || lowerText.includes('не працює') || lowerText.includes('зламаний')) {
      return 'complaint';
    }
    
    if (lowerText.includes('додати') || lowerText.includes('покращити') || lowerText.includes('можна')) {
      return 'suggestion';
    }
    
    if (lowerText.includes('чудово') || lowerText.includes('супер') || lowerText.includes('подобається')) {
      return 'praise';
    }
    
    return 'question';
  }

  /**
   * Генерує відповідь на основі контексту
   */
  private async generateResponse(
    feedback: any, 
    tone: string, 
    category: string
  ): Promise<string> {
    const templates = this.getResponseTemplates(tone, category);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Замінюємо плейсхолдери
    return template
      .replace('{author}', feedback.author)
      .replace('{source}', feedback.source)
      .replace('{category}', feedback.category);
  }

  /**
   * Отримує шаблони відповідей
   */
  private getResponseTemplates(tone: string, category: string): string[] {
    const templates = {
      'apologetic': {
        'complaint': [
          'Дякуємо за зворотний зв\'язок, {author}. Вибачте за незручності. Наша команда вже працює над вирішенням цієї проблеми.',
          'Шкода, що у вас виникли проблеми з {source}. Ми обов\'язково розглянемо вашу скаргу та покращимо сервіс.',
          'Дякуємо, що поділилися своїм досвідом. Ваші зауваження допоможуть нам стати кращими.'
        ],
        'question': [
          'Дякуємо за питання, {author}. Наша служба підтримки зв\'яжеться з вами найближчим часом.',
          'Ваше питання важливе для нас. Ми надамо детальну відповідь протягом 24 годин.'
        ]
      },
      'grateful': {
        'praise': [
          'Дуже дякуємо за такі теплі слова, {author}! Ваша підтримка надихає нас працювати ще краще.',
          'Дякуємо за позитивний відгук! Раді, що {source} вам подобається.',
          'Ваші слова означають для нас дуже багато. Дякуємо за довіру!'
        ]
      },
      'friendly': {
        'praise': [
          'Дякуємо за чудовий відгук, {author}! Раді, що {source} приносить вам користь.',
          'Ваші слова нас дуже радують! Продовжуйте користуватися {source} з задоволенням.'
        ],
        'suggestion': [
          'Дякуємо за цікаву пропозицію, {author}! Ми обов\'язково розглянемо її для майбутніх оновлень.',
          'Ваша ідея звучить перспективно! Наша команда розробки вивчить можливість її реалізації.'
        ]
      },
      'professional': {
        'question': [
          'Дякуємо за звернення, {author}. Наша служба підтримки надасть вам детальну відповідь.',
          'Ваше питання зареєстровано. Ми зв\'яжемося з вами найближчим часом.',
          'Дякуємо за інтерес до {source}. Наші спеціалісти нададуть вам необхідну інформацію.'
        ],
        'suggestion': [
          'Дякуємо за конструктивну пропозицію, {author}. Наша команда розгляне її при плануванні оновлень.',
          'Ваша ідея цінна для нас. Ми додамо її до списку для розгляду.'
        ]
      }
    };

    return templates[tone]?.[category] || [
      'Дякуємо за зворотний зв\'язок, {author}. Ми цінуємо ваші коментарі та працюємо над покращенням сервісу.'
    ];
  }

  /**
   * Розраховує впевненість у відповіді
   */
  private calculateConfidence(feedback: any, suggestion: string): number {
    let confidence = 0.5; // Базова впевненість
    
    // Збільшуємо впевненість для позитивних відгуків
    if (feedback.sentiment === 'positive') {
      confidence += 0.2;
    }
    
    // Збільшуємо впевненість для довгих відгуків
    if (feedback.text.length > 100) {
      confidence += 0.1;
    }
    
    // Зменшуємо впевненість для незрозумілих відгуків
    if (feedback.text.length < 20) {
      confidence -= 0.2;
    }
    
    return Math.min(Math.max(confidence, 0.1), 0.95);
  }

  /**
   * Fallback відповідь у випадку помилки
   */
  private getFallbackResponse(feedback: any): AIResponse {
    return {
      suggestion: `Дякуємо за зворотний зв'язок, ${feedback.author}. Ми цінуємо ваші коментарі та працюємо над покращенням сервісу.`,
      tone: 'professional',
      category: 'question',
      confidence: 0.3
    };
  }
}
