document.getElementById('calc-btn').addEventListener('click', function() {
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;
    const dietType = document.getElementById('diet-type').value;

    const errorAlert = document.getElementById('error-alert');
    errorAlert.style.display = 'none';
    errorAlert.innerHTML = '';

    // Валидация полей
    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
        showError('Пожалуйста, заполните все числовые поля корректно.');
        return;
    }

    if (age < 10 || age > 120 || weight < 30 || weight > 300 || height < 100 || height > 250) {
        showError('Введены нереалистичные показатели. Проверьте возраст, вес и рост.');
        return;
    }

    // 1. Расчёт калорий (Миффлин — Сан Жеор)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = (gender === 'male') ? (bmr + 5) : (bmr - 161);

    let tdee = bmr * activity;
    let targetCalories = tdee;
    let cardioAdvice = '';

    if (goal === 'lose') {
        targetCalories = tdee * 0.85; // дефицит 15%
        cardioAdvice = `🏃‍♂️ <strong>Рекомендация по активности (Похудение):</strong> Дефицит калорий — главный фактор снижения веса. Кардио (2–4 раза в неделю по 20–40 минут) полезно для здоровья сердца, но не компенсирует переедание. Силовые тренировки и бытовая активность (NEAT) сохраняют мышцы.`;
    } else if (goal === 'gain') {
        targetCalories = tdee * 1.10; // профицит 10%
        cardioAdvice = `🚴‍♂️ <strong>Рекомендация по активности (Набор массы):</strong> Профицит калорий в сочетании с силовыми тренировками стимулирует рост мышц. Достаточно 1–2 легких кардио-сессий в неделю для тонуса.`;
    } else {
        cardioAdvice = `🚶‍♂️ <strong>Рекомендация по активности (Поддержание):</strong> Оптимально 2–3 сессии физической активности в неделю для поддержания формы и выносливости.`;
    }

    // Защита от опасного снижения калорийности
    const minSafeCalories = gender === 'male' ? 1500 : 1200;
    if (targetCalories < minSafeCalories) {
        targetCalories = minSafeCalories;
        errorAlert.style.display = 'block';
        errorAlert.innerHTML = `⚠️ Внимание: Расчётная калорийность слишком низкая. Значение скорректировано до безопасного минимума (${minSafeCalories} ккал). Рекомендуется консультация специалиста.`;
    }

    // 2. Расчёт БЖУ
    let proteinMultiplier = (goal === 'lose') ? 2.0 : 1.8;
    let totalProtein = Math.round(weight * proteinMultiplier);
    let fats = Math.round(weight * 0.95);
    
    let caloriesFromProtein = totalProtein * 4;
    let caloriesFromFats = fats * 9;
    let remainingCalories = targetCalories - (caloriesFromProtein + caloriesFromFats);
    let carbs = Math.round(remainingCalories / 4);

    if (carbs < 50) {
        carbs = 50;
        fats = Math.max(40, Math.round((targetCalories - (totalProtein * 4) - (carbs * 4)) / 9));
    }
    
    let checkCalories = Math.round((totalProtein * 4) + (fats * 9) + (carbs * 4));
    let fiber = (dietType === 'vegan') ? 40 : 35;

// 3. Динамическая генерация сбалансированного меню под калории
    let breakfastHtml = '';
    let lunchHtml = '';
    let dinnerHtml = '';
    let snackHtml = '';

    // Рассчитываем примерные порции в зависимости от целевых калорий
    // Чем больше калорий (набор), тем больше граммовок мы закладываем в меню
    let scaleFactor = targetCalories / 2000; // коэффициент относительно стандартных 2000 ккал

    let oatGrams = Math.round(120 * scaleFactor);
    let meatGrams = Math.round(140 * scaleFactor);
    let sideGrams = Math.round(160 * scaleFactor);
    let fishGrams = Math.round(150 * scaleFactor);
    let dairyGrams = Math.round(150 * scaleFactor);

    if (dietType === 'omnivore') {
        breakfastHtml = `<div class="menu-item">🌅 <strong>Завтрак:</strong> Омлет из 3 яиц + ${oatGrams} г готовой овсяной каши + 1 фрукт.</div>`;
        lunchHtml = `<div class="menu-item">☀️ <strong>Обед:</strong> ${meatGrams} г готового куриного филе + ${sideGrams} г готового риса или гречки + 200 г свежих овощей.</div>`;
        dinnerHtml = `<div class="menu-item">🌙 <strong>Ужин:</strong> ${fishGrams} г запеченной рыбы (минтай/горбуша) + 150 г тушеных овощей + 20 г орехов.</div>`;
        snackHtml = `<div class="menu-item">🍎 <strong>Перекус:</strong> ${dairyGrams} г греческого йогурта или творога + горсть ягод.</div>`;
    } else if (dietType === 'vegetarian') {
        breakfastHtml = `<div class="menu-item">🌅 <strong>Завтрак:</strong> ${dairyGrams} г творога со сметаной + ${oatGrams} г готовой овсянки.</div>`;
        lunchHtml = `<div class="menu-item">☀️ <strong>Обед:</strong> ${sideGrams} г тушеной чечевицы или нута (или сыра тофу) + ${sideGrams} г готового риса + 200 г салата.</div>`;
        dinnerHtml = `<div class="menu-item">🌙 <strong>Ужин:</strong> Омлет из 3 яиц с овощами + 20 г семян или орехов.</div>`;
        snackHtml = `<div class="menu-item">🥛 <strong>Перекус:</strong> Стакан кефира или протеиновый коктейль + фрукт.</div>`;
    } else { // vegan
        breakfastHtml = `<div class="menu-item">🌅 <strong>Завтрак:</strong> Каша овсяная на растительном молоке (${oatGrams} г) + 30 г орехов/семян + фрукт.</div>`;
        lunchHtml = `<div class="menu-item">☀️ <strong>Обед:</strong> ${sideGrams} г вареной фасоли, нута или чечевицы + ${sideGrams} г готового киноа или гречки + 200 г свежих овощей.</div>`;
        dinnerHtml = `<div class="menu-item">🌙 <strong>Ужин:</strong> ${fishGrams} г обжаренного тофу с овощным рагу и зеленью.</div>`;
        snackHtml = `<div class="menu-item">🥜 <strong>Перекус:</strong> Горсть орехов (30 г) и сухофрукты.</div>`;
    }
    // Вывод результатов
    const resultBox = document.getElementById('result');
    const caloriesText = document.getElementById('calories-text');
    const nutrientsText = document.getElementById('nutrients-text');
    const foodEquivalent = document.getElementById('food-equivalent');
    const cardioText = document.getElementById('cardio-text');

    resultBox.style.display = 'block';
    caloriesText.innerHTML = `🔥 Ваша целевая калорийность: <strong>${Math.round(targetCalories)} ккал</strong> <small>(TDEE: ${Math.round(tdee)} ккал)</small>`;
    
    nutrientsText.innerHTML = `
        🥩 Белки: <strong>~${totalProtein} г</strong> | 
        🥑 Жиры: <strong>~${fats} г</strong> | 
        🌾 Углеводы: <strong>~${carbs} г</strong> | 
        🥦 Клетчатка: <strong>~${fiber} г</strong>
        <br><small style="color: #7f8c8d;">(Баланс БЖУ: ~${checkCalories} ккал)</small>
    `;

    foodEquivalent.innerHTML = `
        🍽️ <strong>Пример сбалансированного дневного меню:</strong><br>
        <small><em>Все блюда и порции указаны в адекватном готовом виде.</em></small><br><br>
        ${breakfastHtml}
        ${lunchHtml}
        ${dinnerHtml}
        ${snackHtml}
    `;

    cardioText.innerHTML = cardioAdvice;
});

function showError(message) {
    const resultBox = document.getElementById('result');
    const errorAlert = document.getElementById('error-alert');
    resultBox.style.display = 'block';
    errorAlert.style.display = 'block';
    errorAlert.innerHTML = message;
}
