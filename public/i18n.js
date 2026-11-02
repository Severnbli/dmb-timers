/*
 * dmb-timers – A website for posting demob timers
 * Copyright (C) 2026 Usevalad Buben usevaladbuben@gmail.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Shared by all pages: localization dictionaries, the language and theme switchers, and the privacy notice.
// Plural forms are objects keyed by Intl.PluralRules categories (one / few / many / other).
(() => {
const LANGS = { 'en-US': 'EN', 'ru-RU': 'RU', 'be-BY': 'BY' };
const NAMES = { 'en-US': 'English', 'ru-RU': 'Русский', 'be-BY': 'Беларуская' };
const DICT = {
'en-US': {
  'lang.label': 'Language', 'theme.dark': 'Switch to dark theme', 'theme.light': 'Switch to light theme',
  'footer.privacy': 'Privacy', 'nav.admin': 'Admin', 'nav.timers': 'Back to timers', 'footer.source': 'Source code',
  'notice.text': 'No tracking, ads or analytics here. Only your choices (language, theme, seen tips) are saved, in your own browser.',
  'notice.more': 'Details', 'notice.ok': 'Got it',
  'page.defaultTitle': 'Demobilization timers',
  'timer.defaultDone': 'Demobilized. Welcome home!',
  'state.wait': 'Civilian', 'state.soon': 'Starts soon', 'state.serve': 'Serving', 'state.done': 'Home', 'state.summons': 'Notice · waiting', 'summons.big': 'Not clear yet', 'summons.sub': 'Call-up notice for {date}. Waiting for confirmation',
  'days': { one: 'day', other: 'days' },
  'unit.left': { one: 'day left', other: 'days left' },
  'unit.toStart': { one: 'day until call-up', other: 'days until call-up' },
  'unit.home': { one: 'day at home', other: 'days at home' },
  'unit.leftShort': 'until demob', 'unit.toStartShort': 'until call-up',
  'then': 'then {n} {days} of service',
  'hms.h': 'hrs', 'hms.m': 'min', 'hms.s': 'sec',
  'served': '{p}% served', 'dayOf': 'day {n} of {t}', 'half': 'halfway',
  'empty': 'No timers yet. Add one in the admin panel.',
  'admin.title': 'Timers admin', 'admin.password': 'Password', 'admin.login': 'Log in', 'admin.logout': 'Log out',
  'admin.loginHint': 'Enter the admin password from the server .env file.',
  'tab.people': 'People', 'tab.settings': 'Settings', 'tab.history': 'History', 'admin.find': 'Find by name', 'btn.close': 'Close',
  'admin.addTitle': 'Add a person', 'admin.namePh': 'Name', 'admin.add': 'Add',
  'admin.timers': 'Timers', 'admin.emptyTimers': 'No timers yet. Add the first person above.',
  'f.name': 'Name', 'f.label': 'Label', 'f.start': 'Service start', 'f.mode': 'Duration',
  'mode.year': '1 year (12 months)', 'mode.half': 'Half year (6 months)', 'mode.custom': 'Custom end date',
  'f.end': 'Demobilization date', 'f.endAuto': 'start + duration', 'f.done': 'Message when finished', 'f.accent': 'Accent color',
  'f.defaultHint': 'Leave empty to use the default text in each visitor’s language.',
  'btn.save': 'Save', 'btn.reset': 'Start from now', 'btn.keep': 'Restart, keep duration', 'btn.del': 'Delete',
  'confirm.del': 'Delete "{name}"?', 'confirm.reset': 'Set start for "{name}" to now?',
  'confirm.keep': 'Restart "{name}" from now with the same duration?',
  'msg.added': 'Person added', 'msg.saved': 'Saved', 'msg.deleted': 'Deleted', 'msg.reset': 'Start reset',
  'msg.restarted': 'Restarted', 'msg.settings': 'Page settings saved', 'msg.loggedOut': 'Logged out',
  's.title': 'Page settings', 's.pageTitle': 'Page title', 's.background': 'Topographic map background', 's.clock': 'Show hours, minutes and seconds next to days', 's.seconds': 'Show seconds', 's.progress': 'Show progress bars',
  's.statuses': 'Show funny statuses', 's.save': 'Save settings', 's.open': 'Open timers page',
  'hist.title': 'Recent changes', 'hist.empty': 'No changes yet',
  'hist.added': 'Added "{name}"', 'hist.saved': 'Saved "{name}"', 'hist.deleted': 'Deleted "{name}"',
  'hist.restarted': 'Restarted "{name}"', 'hist.settings': 'Page settings saved',
  'err.too_many': 'Too many attempts. Try again in a minute.', 'err.wrong_password': 'Wrong password',
  'err.not_logged_in': 'Not logged in', 'err.limit': 'Timer limit reached', 'err.name_required': 'Name is required',
  'err.bad_start': 'Invalid start date', 'err.bad_end': 'Invalid end date',
  'err.end_before_start': 'End date must be after start date', 'err.not_found': 'Not found',
  'err.timer_not_found': 'Timer not found', 'err.server': 'Server error', 'err.request': 'Request failed',
  's.look': 'Look', 's.cards': 'Cards', 's.autosave': 'Changes are saved right away.', 'g.who': 'Who', 'g.service': 'Service', 'g.after': 'After demobilization', 'err.number': 'Enter a number from {min} to {max}',
  'f.pending': 'Start is the call-up notice date', 'f.pendingHint': 'From this date the card shows "Not clear yet" instead of the countdown, until you confirm that he has left.',
  'pending.badge': 'Not confirmed', 'btn.confirm': 'Confirm departure', 'confirm.confirm': 'Confirm that "{name}" has left for service?',
  'msg.confirmed': 'Departure confirmed', 'hist.confirmed': 'Confirmed departure of "{name}"',
  'fire.btn': 'Add a log', 'fire.label': 'Add a log to the fire, so the guys see someone is here and waiting. Logs in the fire: {n}.',
  'fire.hintTitle': 'Someone is waiting here', 'fire.hint': 'Stopped by? Tap the fire, and the guys will see that people visit and wait for them. One log every {h} hours: the more logs, the more sparks fly over the page.',
  'fire.thanks': 'Thank you! The fire burns brighter.', 'fire.wait': 'Your log is still burning. The next one in {time}.', 'fire.hm': '{h} h {m} min', 'fire.h': '{h} h', 'fire.m': '{m} min', 'fire.lit': 'Burning',
  'err.spark_off': 'The fire is out for now', 'err.spark_wait': 'Your log is still burning',
  'tab.fire': 'Fire', 'fa.title': 'Fire button', 'fa.hint': 'Visitors tap the fire to show the guys that someone is here. Every tap adds a log, and the fire dust over the page grows with them.',
  'fa.on': 'Show the fire button', 'fa.hours': 'One log per visitor (IP), hours', 'fa.days': 'Count starts over every, days',
  'fa.count': 'Logs in the fire: {n}', 'fa.resetAt': 'Starts over on {date}', 'fa.reset': 'Start over', 'confirm.sparks': 'Put out the fire and start the count from zero?',
  'msg.sparksReset': 'The count starts over', 'hist.sparksReset': 'Fire count started over',
  'fd.title': 'Fire dust', 'fd.on': 'Sparks drift over the page', 'fd.min': 'Sparks with no logs', 'fd.max': 'Sparks at full fire', 'fd.full': 'Logs for full fire',
  'fd.hint': 'For a 1440×900 screen; smaller screens get fewer. The first logs make the biggest difference, and the fuller the fire, the bigger and hotter the sparks and the brighter the glow from below.',
  'cols.1': 'One card per row', 'cols.2': 'Two cards per row', 'together.served': 'Served together', 'together.left': 'Left for everyone', 'together.rate': '{sign}{n} s/s', 'together.rateTitle': 'Every second adds a second for each of the {n} serving now',
  's.phoneCols': 'Cards per row on phones', 'pc.1': 'One wide card', 'pc.2': 'Two small squares', 's.counter': 'Shared counter', 's.counterOn': 'Show the shared counter above the cards', 's.counterMode': 'It counts', 'cm.served': 'Time served by everyone together', 'cm.left': 'Time left for everyone together', 's.counterHint': 'It runs one second faster for every person serving now. Unconfirmed call-ups are not counted.',
  'privacy.title': 'Privacy notice', 'privacy.back': 'Back to timers',
},
'ru-RU': {
  'lang.label': 'Язык', 'theme.dark': 'Включить тёмную тему', 'theme.light': 'Включить светлую тему',
  'footer.privacy': 'Конфиденциальность', 'nav.admin': 'Админка', 'nav.timers': 'К таймерам', 'footer.source': 'Исходный код',
  'notice.text': 'Здесь нет слежки, рекламы и аналитики. Сохраняются только ваш выбор (язык, тема, увиденные подсказки) – в вашем браузере.',
  'notice.more': 'Подробнее', 'notice.ok': 'Понятно',
  'page.defaultTitle': 'Дембельские таймеры',
  'timer.defaultDone': 'Дембель! С возвращением домой!',
  'state.wait': 'Гражданский', 'state.soon': 'Скоро призыв', 'state.serve': 'Служит', 'state.done': 'Дома', 'state.summons': 'Повестка · ждём', 'summons.big': 'Пока неясно', 'summons.sub': 'Повестка на {date}. Ждём подтверждения',
  'days': { one: 'день', few: 'дня', many: 'дней', other: 'дня' },
  'unit.left': { one: 'день до дембеля', few: 'дня до дембеля', many: 'дней до дембеля', other: 'дня до дембеля' },
  'unit.toStart': { one: 'день до призыва', few: 'дня до призыва', many: 'дней до призыва', other: 'дня до призыва' },
  'unit.home': { one: 'день дома', few: 'дня дома', many: 'дней дома', other: 'дня дома' },
  'unit.leftShort': 'до дембеля', 'unit.toStartShort': 'до призыва',
  'then': 'затем {n} {days} службы',
  'hms.h': 'ч', 'hms.m': 'мин', 'hms.s': 'сек',
  'served': 'отслужено {p}%', 'dayOf': 'день {n} из {t}', 'half': 'экватор',
  'empty': 'Таймеров пока нет. Добавьте первый в панели администратора.',
  'admin.title': 'Управление таймерами', 'admin.password': 'Пароль', 'admin.login': 'Войти', 'admin.logout': 'Выйти',
  'admin.loginHint': 'Введите пароль администратора из файла .env на сервере.',
  'tab.people': 'Люди', 'tab.settings': 'Настройки', 'tab.history': 'История', 'admin.find': 'Найти по имени', 'btn.close': 'Закрыть',
  'admin.addTitle': 'Добавить человека', 'admin.namePh': 'Имя', 'admin.add': 'Добавить',
  'admin.timers': 'Таймеры', 'admin.emptyTimers': 'Таймеров пока нет. Добавьте первого человека выше.',
  'f.name': 'Имя', 'f.label': 'Подпись', 'f.start': 'Начало службы', 'f.mode': 'Срок',
  'mode.year': '1 год (12 месяцев)', 'mode.half': 'Полгода (6 месяцев)', 'mode.custom': 'Своя дата окончания',
  'f.end': 'Дата дембеля', 'f.endAuto': 'начало + срок', 'f.done': 'Сообщение по окончании', 'f.accent': 'Цвет',
  'f.defaultHint': 'Оставьте пустым – каждый посетитель увидит текст по умолчанию на своём языке.',
  'btn.save': 'Сохранить', 'btn.reset': 'Начать с текущего момента', 'btn.keep': 'Перезапустить с тем же сроком', 'btn.del': 'Удалить',
  'confirm.del': 'Удалить «{name}»?', 'confirm.reset': 'Сделать началом службы «{name}» текущий момент?',
  'confirm.keep': 'Перезапустить «{name}» с текущего момента с тем же сроком?',
  'msg.added': 'Человек добавлен', 'msg.saved': 'Сохранено', 'msg.deleted': 'Удалено', 'msg.reset': 'Начало сброшено',
  'msg.restarted': 'Перезапущено', 'msg.settings': 'Настройки страницы сохранены', 'msg.loggedOut': 'Вы вышли',
  's.title': 'Настройки страницы', 's.pageTitle': 'Заголовок страницы', 's.background': 'Фон с топографической картой', 's.clock': 'Показывать часы, минуты и секунды рядом с днями', 's.seconds': 'Показывать секунды',
  's.progress': 'Показывать прогресс', 's.statuses': 'Показывать смешные статусы', 's.save': 'Сохранить настройки',
  's.open': 'Открыть страницу таймеров',
  'hist.title': 'Последние изменения', 'hist.empty': 'Изменений пока нет',
  'hist.added': 'Добавлен «{name}»', 'hist.saved': 'Сохранён «{name}»', 'hist.deleted': 'Удалён «{name}»',
  'hist.restarted': 'Перезапущен «{name}»', 'hist.settings': 'Сохранены настройки страницы',
  'err.too_many': 'Слишком много попыток. Повторите через минуту.', 'err.wrong_password': 'Неверный пароль',
  'err.not_logged_in': 'Вы не вошли', 'err.limit': 'Достигнут лимит таймеров', 'err.name_required': 'Укажите имя',
  'err.bad_start': 'Неверная дата начала', 'err.bad_end': 'Неверная дата окончания',
  'err.end_before_start': 'Дата окончания должна быть позже даты начала', 'err.not_found': 'Не найдено',
  'err.timer_not_found': 'Таймер не найден', 'err.server': 'Ошибка сервера', 'err.request': 'Запрос не выполнен',
  's.look': 'Внешний вид', 's.cards': 'Карточки', 's.autosave': 'Изменения сохраняются сразу.', 'g.who': 'Кто', 'g.service': 'Служба', 'g.after': 'После дембеля', 'err.number': 'Введите число от {min} до {max}',
  'f.pending': 'Начало службы – это дата повестки', 'f.pendingHint': 'С этой даты на карточке вместо отсчёта «Пока неясно», пока вы не подтвердите, что он отбыл.',
  'pending.badge': 'Не подтверждено', 'btn.confirm': 'Подтвердить отбытие', 'confirm.confirm': 'Подтвердить, что «{name}» отбыл на службу?',
  'msg.confirmed': 'Отбытие подтверждено', 'hist.confirmed': 'Подтверждено отбытие «{name}»',
  'fire.btn': 'Подкинуть дров', 'fire.label': 'Подкинуть полено в костёр, чтобы ребята видели: здесь их ждут. Поленьев в костре: {n}.',
  'fire.hintTitle': 'Здесь ждут', 'fire.hint': 'Заглянули? Нажмите на костёр – и ребята увидят, что к ним заходят и их ждут. Одно полено раз в {h} ч: чем больше поленьев, тем больше искр летит над страницей.',
  'fire.thanks': 'Спасибо! Огонь горит ярче.', 'fire.wait': 'Ваше полено ещё горит. Следующее – через {time}.', 'fire.hm': '{h} ч {m} мин', 'fire.h': '{h} ч', 'fire.m': '{m} мин', 'fire.lit': 'Горит',
  'err.spark_off': 'Костёр пока потушен', 'err.spark_wait': 'Ваше полено ещё горит',
  'tab.fire': 'Костёр', 'fa.title': 'Кнопка костра', 'fa.hint': 'Посетители нажимают на костёр, чтобы ребята видели, что здесь кто-то есть. Каждое нажатие – полено в костёр, и вместе с ними растёт огненная пыль над страницей.',
  'fa.on': 'Показывать кнопку костра', 'fa.hours': 'Одно полено с посетителя (IP), часов', 'fa.days': 'Счёт обнуляется каждые, дней',
  'fa.count': 'Поленьев в костре: {n}', 'fa.resetAt': 'Обнулится {date}', 'fa.reset': 'Обнулить', 'confirm.sparks': 'Потушить костёр и начать счёт с нуля?',
  'msg.sparksReset': 'Счёт обнулён', 'hist.sparksReset': 'Счёт костра обнулён',
  'fd.title': 'Огненная пыль', 'fd.on': 'Искры летят над страницей', 'fd.min': 'Искр без поленьев', 'fd.max': 'Искр при полном огне', 'fd.full': 'Поленьев до полного огня',
  'fd.hint': 'Для экрана 1440×900, на меньших экранах искр меньше. Сильнее всего огонь растёт с первых поленьев, а чем полнее огонь, тем крупнее и жарче искры и ярче зарево снизу.',
  'cols.1': 'Одна карточка в ряд', 'cols.2': 'Две карточки в ряд', 'together.served': 'Отслужено вместе', 'together.left': 'Осталось на всех', 'together.rate': '{sign}{n} с/с', 'together.rateTitle': 'Каждую секунду – по секунде за каждого из {n}, кто служит сейчас',
  's.phoneCols': 'Карточек в ряд на телефонах', 'pc.1': 'Одна широкая', 'pc.2': 'Два маленьких квадрата', 's.counter': 'Общий счётчик', 's.counterOn': 'Показывать общий счётчик над карточками', 's.counterMode': 'Что считает', 'cm.served': 'Сколько отслужили все вместе', 'cm.left': 'Сколько осталось всем вместе', 's.counterHint': 'Он идёт на секунду быстрее за каждого, кто служит сейчас. Неподтверждённые повестки не считаются.',
  'privacy.title': 'Политика конфиденциальности', 'privacy.back': 'К таймерам',
},
'be-BY': {
  'lang.label': 'Мова', 'theme.dark': 'Уключыць цёмную тэму', 'theme.light': 'Уключыць светлую тэму',
  'footer.privacy': 'Канфідэнцыйнасць', 'nav.admin': 'Адмінка', 'nav.timers': 'Да таймераў', 'footer.source': 'Зыходны код',
  'notice.text': 'Тут няма сачэння, рэкламы і аналітыкі. Захоўваецца толькі ваш выбар (мова, тэма, убачаныя падказкі) – у вашым браўзеры.',
  'notice.more': 'Падрабязней', 'notice.ok': 'Зразумела',
  'page.defaultTitle': 'Дэмбельскія таймеры',
  'timer.defaultDone': 'Дэмбель! З вяртаннем дадому!',
  'state.wait': 'Цывільны', 'state.soon': 'Хутка прызыў', 'state.serve': 'Служыць', 'state.done': 'Дома', 'state.summons': 'Позва · чакаем', 'summons.big': 'Пакуль незразумела', 'summons.sub': 'Позва на {date}. Чакаем пацвярджэння',
  'days': { one: 'дзень', few: 'дні', many: 'дзён', other: 'дня' },
  'unit.left': { one: 'дзень да дэмбеля', few: 'дні да дэмбеля', many: 'дзён да дэмбеля', other: 'дня да дэмбеля' },
  'unit.toStart': { one: 'дзень да прызыву', few: 'дні да прызыву', many: 'дзён да прызыву', other: 'дня да прызыву' },
  'unit.home': { one: 'дзень дома', few: 'дні дома', many: 'дзён дома', other: 'дня дома' },
  'unit.leftShort': 'да дэмбеля', 'unit.toStartShort': 'да прызыву',
  'then': 'потым {n} {days} службы',
  'hms.h': 'гад', 'hms.m': 'хв', 'hms.s': 'с',
  'served': 'адслужана {p}%', 'dayOf': 'дзень {n} з {t}', 'half': 'экватар',
  'empty': 'Таймераў пакуль няма. Дадайце першы ў панэлі адміністратара.',
  'admin.title': 'Кіраванне таймерамі', 'admin.password': 'Пароль', 'admin.login': 'Увайсці', 'admin.logout': 'Выйсці',
  'admin.loginHint': 'Увядзіце пароль адміністратара з файла .env на серверы.',
  'tab.people': 'Людзі', 'tab.settings': 'Налады', 'tab.history': 'Гісторыя', 'admin.find': 'Знайсці па імені', 'btn.close': 'Закрыць',
  'admin.addTitle': 'Дадаць чалавека', 'admin.namePh': 'Імя', 'admin.add': 'Дадаць',
  'admin.timers': 'Таймеры', 'admin.emptyTimers': 'Таймераў пакуль няма. Дадайце першага чалавека вышэй.',
  'f.name': 'Імя', 'f.label': 'Подпіс', 'f.start': 'Пачатак службы', 'f.mode': 'Тэрмін',
  'mode.year': '1 год (12 месяцаў)', 'mode.half': 'Паўгода (6 месяцаў)', 'mode.custom': 'Свая дата заканчэння',
  'f.end': 'Дата дэмбеля', 'f.endAuto': 'пачатак + тэрмін', 'f.done': 'Паведамленне па заканчэнні', 'f.accent': 'Колер',
  'f.defaultHint': 'Пакіньце пустым – кожны наведвальнік убачыць тэкст па змаўчанні на сваёй мове.',
  'btn.save': 'Захаваць', 'btn.reset': 'Пачаць з бягучага моманту', 'btn.keep': 'Перазапусціць з тым жа тэрмінам', 'btn.del': 'Выдаліць',
  'confirm.del': 'Выдаліць «{name}»?', 'confirm.reset': 'Зрабіць пачаткам службы «{name}» бягучы момант?',
  'confirm.keep': 'Перазапусціць «{name}» з бягучага моманту з тым жа тэрмінам?',
  'msg.added': 'Чалавек дададзены', 'msg.saved': 'Захавана', 'msg.deleted': 'Выдалена', 'msg.reset': 'Пачатак скінуты',
  'msg.restarted': 'Перазапушчана', 'msg.settings': 'Налады старонкі захаваны', 'msg.loggedOut': 'Вы выйшлі',
  's.title': 'Налады старонкі', 's.pageTitle': 'Загаловак старонкі', 's.background': 'Фон з тапаграфічнай картай', 's.clock': 'Паказваць гадзіны, хвіліны і секунды побач з днямі', 's.seconds': 'Паказваць секунды',
  's.progress': 'Паказваць прагрэс', 's.statuses': 'Паказваць смешныя статусы', 's.save': 'Захаваць налады',
  's.open': 'Адкрыць старонку таймераў',
  'hist.title': 'Апошнія змены', 'hist.empty': 'Змен пакуль няма',
  'hist.added': 'Дададзены «{name}»', 'hist.saved': 'Захаваны «{name}»', 'hist.deleted': 'Выдалены «{name}»',
  'hist.restarted': 'Перазапушчаны «{name}»', 'hist.settings': 'Захаваны налады старонкі',
  'err.too_many': 'Занадта шмат спроб. Паўтарыце праз хвіліну.', 'err.wrong_password': 'Няправільны пароль',
  'err.not_logged_in': 'Вы не ўвайшлі', 'err.limit': 'Дасягнуты ліміт таймераў', 'err.name_required': 'Пазначце імя',
  'err.bad_start': 'Няправільная дата пачатку', 'err.bad_end': 'Няправільная дата заканчэння',
  'err.end_before_start': 'Дата заканчэння павінна быць пазней за дату пачатку', 'err.not_found': 'Не знойдзена',
  'err.timer_not_found': 'Таймер не знойдзены', 'err.server': 'Памылка сервера', 'err.request': 'Запыт не выкананы',
  's.look': 'Знешні выгляд', 's.cards': 'Карткі', 's.autosave': 'Змены захоўваюцца адразу.', 'g.who': 'Хто', 'g.service': 'Служба', 'g.after': 'Пасля дэмбеля', 'err.number': 'Увядзіце лік ад {min} да {max}',
  'f.pending': 'Пачатак службы – гэта дата позвы', 'f.pendingHint': 'З гэтай даты на картцы замест адліку «Пакуль незразумела», пакуль вы не пацвердзіце, што ён адбыў.',
  'pending.badge': 'Не пацверджана', 'btn.confirm': 'Пацвердзіць адбыццё', 'confirm.confirm': 'Пацвердзіць, што «{name}» адбыў на службу?',
  'msg.confirmed': 'Адбыццё пацверджана', 'hist.confirmed': 'Пацверджана адбыццё «{name}»',
  'fire.btn': 'Падкінуць дроў', 'fire.label': 'Падкінуць палена ў вогнішча, каб хлопцы бачылі: тут іх чакаюць. Паленняў у вогнішчы: {n}.',
  'fire.hintTitle': 'Тут чакаюць', 'fire.hint': 'Зазірнулі? Націсніце на вогнішча – і хлопцы ўбачаць, што да іх заходзяць і іх чакаюць. Адно палена раз у {h} г: чым больш паленняў, тым больш іскраў ляціць над старонкай.',
  'fire.thanks': 'Дзякуй! Агонь гарыць ярчэй.', 'fire.wait': 'Ваша палена яшчэ гарыць. Наступнае – праз {time}.', 'fire.hm': '{h} г {m} хв', 'fire.h': '{h} г', 'fire.m': '{m} хв', 'fire.lit': 'Гарыць',
  'err.spark_off': 'Вогнішча пакуль патушана', 'err.spark_wait': 'Ваша палена яшчэ гарыць',
  'tab.fire': 'Вогнішча', 'fa.title': 'Кнопка вогнішча', 'fa.hint': 'Наведвальнікі націскаюць на вогнішча, каб хлопцы бачылі, што тут нехта ёсць. Кожнае націсканне – палена ў вогнішча, і разам з імі расце агністы пыл над старонкай.',
  'fa.on': 'Паказваць кнопку вогнішча', 'fa.hours': 'Адно палена з наведвальніка (IP), гадзін', 'fa.days': 'Лік абнуляецца кожныя, дзён',
  'fa.count': 'Паленняў у вогнішчы: {n}', 'fa.resetAt': 'Абнуліцца {date}', 'fa.reset': 'Абнуліць', 'confirm.sparks': 'Патушыць вогнішча і пачаць лік з нуля?',
  'msg.sparksReset': 'Лік абнулены', 'hist.sparksReset': 'Лік вогнішча абнулены',
  'fd.title': 'Агністы пыл', 'fd.on': 'Іскры ляцяць над старонкай', 'fd.min': 'Іскраў без паленняў', 'fd.max': 'Іскраў пры поўным агні', 'fd.full': 'Паленняў да поўнага агню',
  'fd.hint': 'Для экрана 1440×900, на меншых экранах іскраў менш. Мацней за ўсё агонь расце з першых паленняў, а чым паўнейшы агонь, тым буйнейшыя і гарачэйшыя іскры і ярчэйшае зарыва знізу.',
  'cols.1': 'Адна картка ў радзе', 'cols.2': 'Дзве карткі ў радзе', 'together.served': 'Адслужана разам', 'together.left': 'Засталося на ўсіх', 'together.rate': '{sign}{n} с/с', 'together.rateTitle': 'Кожную секунду – па секундзе за кожнага з {n}, хто служыць зараз',
  's.phoneCols': 'Картак у радзе на тэлефонах', 'pc.1': 'Адна шырокая', 'pc.2': 'Два маленькія квадраты', 's.counter': 'Агульны лічыльнік', 's.counterOn': 'Паказваць агульны лічыльнік над карткамі', 's.counterMode': 'Што лічыць', 'cm.served': 'Колькі адслужылі ўсе разам', 'cm.left': 'Колькі засталося ўсім разам', 's.counterHint': 'Ён ідзе на секунду хутчэй за кожнага, хто служыць зараз. Непацверджаныя позвы не лічацца.',
  'privacy.title': 'Палітыка канфідэнцыйнасці', 'privacy.back': 'Да таймераў',
}};

const store = { // localStorage can be unavailable (private mode, blocked site data)
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
function detect() {
  const saved = store.get('lang');
  if (DICT[saved]) return saved;
  for (const l of navigator.languages || [navigator.language || '']) {
    const p = l.toLowerCase().slice(0, 2);
    if (p === 'ru') return 'ru-RU';
    if (p === 'be') return 'be-BY';
    if (p === 'en') return 'en-US';
  }
  return 'en-US';
}

let lang = detect(), rules = new Intl.PluralRules(lang);
const raw = k => DICT[lang][k] ?? DICT['en-US'][k] ?? k;
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
const t = (k, v = {}) => fill(raw(k), v);
const tp = (k, n, v = {}) => { const f = raw(k); return fill(f[rules.select(n)] ?? f.other, { n, ...v }); };

function apply(root = document) {
  document.documentElement.lang = lang.slice(0, 2);
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); if (el.matches('a')) el.title = t(el.dataset.i18nLabel); });
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
}
function setLang(l) {
  if (!DICT[l] || l === lang) return;
  lang = l; rules = new Intl.PluralRules(l); store.set('lang', l);
  apply(); document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
}
function switcher(el) { // segmented EN / RU / BY control
  el.classList.add('lang'); el.setAttribute('role', 'group'); el.dataset.i18nLabel = 'lang.label';
  el.innerHTML = Object.entries(LANGS).map(([l, s]) =>
    `<button type="button" data-lang="${l}" title="${NAMES[l]}" lang="${l.slice(0, 2)}">${s}</button>`).join('');
  el.onclick = e => { // on phones only the current language is shown, and tapping it steps to the next one
    const b = e.target.closest('button'); if (!b) return;
    const all = [...el.querySelectorAll('button')];
    if (b.dataset.lang === lang && all.some(x => !x.offsetWidth)) setLang(all[(all.indexOf(b) + 1) % all.length].dataset.lang);
    else setLang(b.dataset.lang);
  };
}
function notice() { // one-time privacy notice; dismissing it is remembered in this browser only
  if (store.get('privacyOk')) return;
  const el = document.createElement('div');
  el.className = 'notice'; el.setAttribute('role', 'region'); el.dataset.i18nLabel = 'footer.privacy';
  el.innerHTML = '<p><span data-i18n="notice.text"></span> <a href="/privacy" data-i18n="notice.more"></a></p><button type="button" data-i18n="notice.ok"></button>';
  el.querySelector('button').onclick = () => { store.set('privacyOk', '1'); el.remove(); };
  document.body.append(el); apply(el);
}
const ICONS = { // the icon shows the theme a click switches to
  dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const theme = () => document.documentElement.dataset.theme || (systemDark.matches ? 'dark' : 'light');
// The theme changes with colors, backgrounds, borders and shadows easing over; the background canvas cross-fades itself (backdrop.js).
// No View Transitions: their snapshots drop the cards' backdrop blur, and it snaps back when they end. With reduced motion it switches at once
const FADE = 450;
function fade(swap) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
  if (!document.getElementById('theme-fade')) document.head.insertAdjacentHTML('beforeend', `<style id="theme-fade">
    .theme-fading,.theme-fading *,.theme-fading *::before,.theme-fading *::after{transition:background-color ${FADE}ms ease,color ${FADE}ms ease,border-color ${FADE}ms ease,box-shadow ${FADE}ms ease,fill ${FADE}ms ease,stroke ${FADE}ms ease!important}</style>`);
  const root = document.documentElement; root.classList.add('theme-fading'); swap();
  clearTimeout(fade.t); fade.t = setTimeout(() => root.classList.remove('theme-fading'), FADE + 50);
}
function themeSwitch(el) { // light / dark toggle; until it is used the system setting decides
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'theme';
  const draw = () => { const next = theme() === 'dark' ? 'light' : 'dark'; b.innerHTML = ICONS[next]; b.title = t('theme.' + next); b.setAttribute('aria-label', b.title); };
  b.onclick = () => {
    const next = theme() === 'dark' ? 'light' : 'dark', root = document.documentElement;
    const swap = () => { root.dataset.theme = next; root.style.colorScheme = next; store.set('theme', next); draw(); };
    fade(swap);
  };
  systemDark.addEventListener('change', draw); document.addEventListener('langchange', draw);
  el.replaceWith(b); draw();
}
function init() {
  document.querySelectorAll('[data-lang-switch]').forEach(switcher);
  document.querySelectorAll('[data-theme-switch]').forEach(themeSwitch);
  apply();
  if (!document.body.hasAttribute('data-no-notice')) notice();
}

window.I18N = { t, tp, apply, setLang, init, get lang() { return lang; } };
})();
