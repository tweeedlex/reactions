# 🚀 Quick Start Guide

## ✅ Что работает

**LLM Bot полностью функционален**:

- ✅ **LLM Bot**: Работает на порту 3001
- ✅ **Системный промпт**: Загружается из Supabase  
- ✅ **Анализ LLM**: OpenAI, Claude, Gemini, Ollama
- ✅ **Сохранение**: Результаты сохраняются в базу данных

## 🚀 Быстрый старт

### 1. Установка
```bash
cd llm_bot
npm install
```

### 2. Настройка
```bash
cp env.example .env
# Отредактируйте .env с вашими ключами
```

### 3. Запуск
```bash
npm start
```

### 4. Использование
```bash
# Анализ сообщения
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Клиент жалуется на медленную работу сайта",
    "msg_id": 2,
    "provider": "openai"
  }'
```

## 🎉 Поздравляем!

Ваш LLM Bot работает отлично! Основная функциональность готова к использованию.
