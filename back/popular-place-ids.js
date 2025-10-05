// Популярні Place ID для тестування парсингу
const popularPlaceIds = {
  // Україна
  'Київ, Майдан Незалежності': 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
  'Львів, Площа Ринок': 'ChIJVXealLU8L0cRgHcYlQnJpBk',
  'Одеса, Дерибасівська': 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  'Харків, Площа Свободи': 'ChIJVXealLU8L0cRgHcYlQnJpBk',
  
  // Світові міста
  'Нью-Йорк, Таймс-сквер': 'ChIJmQJIxlVZwokRrQIQHwj7UKk',
  'Лондон, Трафальгарська площа': 'ChIJwULG5WSOdkgR_H2kH5axt2Y',
  'Париж, Ейфелева вежа': 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
  'Токіо, Сібуя': 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  
  // Ресторани
  'Макдональдс Київ': 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
  'KFC Київ': 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
  
  // Готелі
  'Готель Україна, Київ': 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
  'Готель Львів': 'ChIJVXealLU8L0cRgHcYlQnJpBk'
};

console.log('🌟 Популярні Place ID для тестування парсингу:\n');

Object.entries(popularPlaceIds).forEach(([name, placeId]) => {
  console.log(`📍 ${name}`);
  console.log(`   Place ID: ${placeId}`);
  console.log(`   URL: https://maps.google.com/maps/place/${placeId}`);
  console.log(`   Тест: curl "http://localhost:3000/url-parsing/parse?url=https://maps.google.com/maps/place/${placeId}&language=uk"`);
  console.log('');
});

console.log('💡 Як використовувати:');
console.log('1. Скопіюйте Place ID зі списку вище');
console.log('2. Використовуйте його в URL для парсингу');
console.log('3. Або використовуйте повний URL Google Maps');
console.log('');
console.log('🔧 Приклад:');
console.log('curl "http://localhost:3000/url-parsing/parse?url=https://maps.google.com/maps/place/ChIJd8BlQ2BZwokRAFQEcDlJRAI&language=uk"');
