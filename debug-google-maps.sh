#!/bin/bash

echo "🔍 Діагностика Google Maps парсингу..."
echo ""

# Тест 1: Перевірка SerpAPI підключення
echo "1️⃣ Перевірка SerpAPI підключення..."
curl -s "http://localhost:3000/google-maps/test-serpapi" | jq '.' 2>/dev/null || echo "❌ Помилка перевірки SerpAPI або jq не встановлено"

echo ""
echo "2️⃣ Тест парсингу Google Maps..."

# Тест з різними URL
test_urls=(
    "https://maps.app.goo.gl/ABC123"
    "https://www.google.com/maps/place/Test+Place/@50.4501,30.5234,17z"
    "https://maps.google.com/maps?cid=123456789"
)

for url in "${test_urls[@]}"; do
    echo ""
    echo "🔗 Тестуємо URL: $url"
    
    start_time=$(date +%s)
    response=$(curl -s -X POST "http://localhost:3000/google-maps/parse" \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$url\"}")
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo "⏱️ Час виконання: ${duration} секунд"
    
    if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
        success=$(echo "$response" | jq -r '.success')
        parsed_count=$(echo "$response" | jq -r '.parsedCount')
        place_id=$(echo "$response" | jq -r '.placeId')
        message=$(echo "$response" | jq -r '.message')
        
        echo "✅ Успіх: $success"
        echo "📊 Знайдено відгуків: $parsed_count"
        echo "📍 Place ID: $place_id"
        echo "📝 Повідомлення: $message"
        
        if [ "$parsed_count" -gt 0 ]; then
            echo "🎉 Знайдено відгуки!"
        else
            echo "⚠️ Відгуки не знайдені"
        fi
    else
        echo "❌ Помилка: $response"
    fi
done

echo ""
echo "3️⃣ Перевірка збережених коментарів..."
comments_response=$(curl -s "http://localhost:3000/comments")
if echo "$comments_response" | jq -e '. | length' >/dev/null 2>&1; then
    total_comments=$(echo "$comments_response" | jq '. | length')
    google_maps_comments=$(echo "$comments_response" | jq '[.[] | select(.store == "googlemaps")] | length')
    
    echo "📊 Всього коментарів в БД: $total_comments"
    echo "🗺️ Google Maps коментарів: $google_maps_comments"
    
    if [ "$google_maps_comments" -gt 0 ]; then
        echo "📝 Останні Google Maps коментарі:"
        echo "$comments_response" | jq -r '[.[] | select(.store == "googlemaps")] | .[0:3] | .[] | "  \(.author): \(.content[0:50])..."'
    else
        echo "⚠️ Google Maps коментарів не знайдено в БД"
    fi
else
    echo "❌ Помилка отримання коментарів: $comments_response"
fi

echo ""
echo "4️⃣ Перевірка пріоритизованих відгуків..."
prioritized_response=$(curl -s "http://localhost:3000/feedbacks/prioritized?limit=10")
if echo "$prioritized_response" | jq -e '. | length' >/dev/null 2>&1; then
    total_feedbacks=$(echo "$prioritized_response" | jq '. | length')
    google_maps_feedbacks=$(echo "$prioritized_response" | jq '[.[] | select(.source == "googlemaps")] | length')
    
    echo "📊 Всього пріоритизованих відгуків: $total_feedbacks"
    echo "🗺️ Google Maps відгуків: $google_maps_feedbacks"
    
    if [ "$google_maps_feedbacks" -gt 0 ]; then
        echo "📝 Останні Google Maps відгуки:"
        echo "$prioritized_response" | jq -r '[.[] | select(.source == "googlemaps")] | .[0:3] | .[] | "  \(.author): \(.text[0:50])..."'
    else
        echo "⚠️ Google Maps відгуків не знайдено в пріоритизованих"
    fi
else
    echo "❌ Помилка отримання пріоритизованих відгуків: $prioritized_response"
fi

echo ""
echo "🏁 Діагностика завершена!"
