// Популярні місця в Києві для тестування
const kyivPlaces = [
  {
    name: 'Макдональдс на Хрещатику',
    url: 'https://maps.google.com/maps/place/Макдональдс/@50.4501,30.5234,17z',
    description: 'Популярний ресторан з багатьма відгуками'
  },
  {
    name: 'ТРЦ Глобус',
    url: 'https://maps.google.com/maps/place/ТРЦ+Глобус/@50.4501,30.5234,17z',
    description: 'Торговий центр з відгуками'
  },
  {
    name: 'Майдан Незалежності',
    url: 'https://maps.google.com/maps/place/Майдан+Незалежності/@50.4501,30.5234,17z',
    description: 'Центральна площа Києва'
  },
  {
    name: 'Золоті Ворота',
    url: 'https://maps.google.com/maps/place/Золоті+Ворота/@50.4501,30.5234,17z',
    description: 'Історична пам\'ятка'
  }
];

console.log('🏙️ Популярні місця в Києві для тестування парсингу:\n');

kyivPlaces.forEach((place, index) => {
  console.log(`${index + 1}. 📍 ${place.name}`);
  console.log(`   ${place.description}`);
  console.log(`   URL: ${place.url}`);
  console.log(`   Тест: curl "http://localhost:3000/url-parsing/parse?url=${encodeURIComponent(place.url)}&language=uk"`);
  console.log('');
});

console.log('💡 Як знайти правильний Place ID:');
console.log('1. Відкрийте Google Maps в браузері');
console.log('2. Знайдіть потрібне місце');
console.log('3. Натисніть на нього');
console.log('4. Скопіюйте URL - він повинен містити Place ID (ChIJ...)');
console.log('5. Використовуйте цей URL для парсингу');
console.log('');
console.log('🔧 Приклад правильного URL:');
console.log('https://maps.google.com/maps/place/ChIJd8BlQ2BZwokRAFQEcDlJRAI');
console.log('');
console.log('⚠️ Увага: URL з координатами (@50.4000574,30.5350083) часто не працюють!');
console.log('✅ Використовуйте URL з Place ID (ChIJ...)');
