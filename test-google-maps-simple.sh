#!/bin/bash

echo "🔍 Простий тест Google Maps парсингу..."
echo ""

# Тест з таймаутом 10 секунд
echo "🔗 Тестуємо URL: https://maps.app.goo.gl/ABC123"
echo "⏱️ Таймаут: 10 секунд"

timeout 10s curl -X POST "http://localhost:3000/google-maps/parse" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://maps.app.goo.gl/ABC123"}' \
  -w "\n⏱️ Час виконання: %{time_total}s\n" \
  -s

echo ""
echo "🏁 Тест завершено!"
