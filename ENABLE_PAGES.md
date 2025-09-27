# 🔧 Включение GitHub Pages - Пошаговая инструкция

## ⚠️ ВАЖНО: Сначала включите Pages в настройках!

GitHub Actions не может работать без предварительного включения Pages в настройках репозитория.

## Шаг 1: Включить GitHub Pages

1. **Зайдите на GitHub**: https://github.com/sytykhandrei1/random-roulette
2. **Нажмите на вкладку "Settings"** (вверху справа, рядом с Code, Issues, Pull requests)
3. **В левом меню найдите "Pages"** (в разделе Code and automation)
4. **В разделе "Source" выберите "GitHub Actions"**
5. **Нажмите "Save"**

## Шаг 2: Проверить включение

После включения вы должны увидеть:
- ✅ "Your site is live at https://sytykhandrei1.github.io/random-roulette"
- ✅ Зеленая галочка рядом с "GitHub Actions"

## Шаг 3: Запустить деплой

1. **Перейдите на вкладку "Actions"**
2. **Нажмите "Deploy to GitHub Pages"** (если есть)
3. **Или сделайте любой commit** - это запустит деплой автоматически

## Шаг 4: Проверить результат

- **Сайт будет доступен**: https://sytykhandrei1.github.io/random-roulette
- **Время деплоя**: 2-5 минут после включения Pages

## 🔄 Альтернативный способ (если не работает)

Если GitHub Actions не работает, можно использовать простой деплой:

1. **В Settings → Pages**
2. **Выберите "Deploy from a branch"**
3. **Branch: main**
4. **Folder: / (root)**
5. **Save**

## ❌ Частые ошибки

### "Not Found" ошибка
- **Причина**: Pages не включен в настройках
- **Решение**: Включите Pages в Settings → Pages

### "Get Pages site failed"
- **Причина**: Pages включен, но не настроен на GitHub Actions
- **Решение**: Выберите "GitHub Actions" в Source

### Actions не запускаются
- **Причина**: Неправильные права доступа
- **Решение**: Проверьте, что репозиторий публичный или у вас есть права на Pages

## ✅ После успешного включения

- Сайт будет обновляться автоматически при каждом push
- Все изменения будут видны через 1-2 минуты
- URL: https://sytykhandrei1.github.io/random-roulette
