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
  'notice.text': 'No tracking, ads or analytics here. Only your language and theme choices are saved, in your own browser.',
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
  'tab.people': 'People', 'tab.words': 'Words', 'tab.settings': 'Settings', 'tab.history': 'History', 'admin.find': 'Find by name', 'btn.close': 'Close',
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
  's.title': 'Page settings', 's.pageTitle': 'Page title', 's.background': 'Moving camouflage background', 's.clock': 'Show hours, minutes and seconds next to days', 's.seconds': 'Show seconds', 's.progress': 'Show progress bars',
  's.statuses': 'Show funny statuses', 's.save': 'Save settings', 's.open': 'Open timers page',
  'hist.title': 'Recent changes', 'hist.empty': 'No changes yet',
  'hist.added': 'Added "{name}"', 'hist.saved': 'Saved "{name}"', 'hist.deleted': 'Deleted "{name}"',
  'hist.restarted': 'Restarted "{name}"', 'hist.settings': 'Page settings saved',
  'err.too_many': 'Too many attempts. Try again in a minute.', 'err.wrong_password': 'Wrong password',
  'err.not_logged_in': 'Not logged in', 'err.limit': 'Timer limit reached', 'err.name_required': 'Name is required',
  'err.bad_start': 'Invalid start date', 'err.bad_end': 'Invalid end date',
  'err.end_before_start': 'End date must be after start date', 'err.not_found': 'Not found',
  'err.timer_not_found': 'Timer not found', 'err.server': 'Server error', 'err.request': 'Request failed',
  'words.open': 'Send words of support', 'words.title': 'Words of support', 'words.hint': 'A word or a few sentences. They will drift down the page for everyone to see.',
  'words.ph': 'Hang in there, we are waiting for you at home!', 'words.radio': 'Radiogram', 'words.author': 'Your name (optional)', 'words.send': 'Send', 'words.cancel': 'Cancel',
  'err.words_off': 'Words of support are closed for now', 'err.words_empty': 'Write something first',
  'err.words_ip': 'You have sent enough for this hour. Thank you!', 'err.words_busy': 'Lots of support this hour already. Try again later.',
  's.look': 'Look', 's.cards': 'Cards', 's.autosave': 'Changes are saved right away.', 'g.who': 'Who', 'g.service': 'Service', 'g.after': 'After demobilization', 'err.number': 'Enter a number from 0 to 1000',
  'w.title': 'Words of support', 'w.accept': 'Visitors can send words', 'w.show': 'Words fall on the timers page',
  'w.perIp': 'Per visitor (IP) per hour', 'w.perHour': 'For the whole site per hour', 'w.clear': 'Delete all',
  'w.gap': 'Pause between words, seconds', 'w.cycle': 'Shortest cycle, minutes', 'w.cycleHint': 'In one cycle every word shows once, in random order and with random pauses. If there are few words, they are spread over the cycle: one word alone shows once per cycle.',
  'w.days': 'Keep words, days', 'w.daysHint': 'Older words are deleted on their own. 0 keeps them until you delete them.',
  'w.count': 'Words: {n}', 'confirm.words': 'Delete all {n} words of support?', 'hist.wordsCleared': 'Words of support deleted',
  'f.pending': 'Start is the call-up notice date', 'f.pendingHint': 'From this date the card shows "Not clear yet" instead of the countdown, until you confirm that he has left.',
  'pending.badge': 'Not confirmed', 'btn.confirm': 'Confirm departure', 'confirm.confirm': 'Confirm that "{name}" has left for service?',
  'msg.confirmed': 'Departure confirmed', 'hist.confirmed': 'Confirmed departure of "{name}"',
  'privacy.title': 'Privacy notice', 'privacy.back': 'Back to timers',
},
'ru-RU': {
  'lang.label': 'Язык', 'theme.dark': 'Включить тёмную тему', 'theme.light': 'Включить светлую тему',
  'footer.privacy': 'Конфиденциальность', 'nav.admin': 'Админка', 'nav.timers': 'К таймерам', 'footer.source': 'Исходный код',
  'notice.text': 'Здесь нет слежки, рекламы и аналитики. Сохраняются только выбранные язык и тема – в вашем браузере.',
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
  'tab.people': 'Люди', 'tab.words': 'Слова', 'tab.settings': 'Настройки', 'tab.history': 'История', 'admin.find': 'Найти по имени', 'btn.close': 'Закрыть',
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
  's.title': 'Настройки страницы', 's.pageTitle': 'Заголовок страницы', 's.background': 'Живой камуфляжный фон', 's.clock': 'Показывать часы, минуты и секунды рядом с днями', 's.seconds': 'Показывать секунды',
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
  'words.open': 'Отправить слова поддержки', 'words.title': 'Слова поддержки', 'words.hint': 'Слово или пара предложений. Они будут падать по странице, и их увидят все.',
  'words.ph': 'Держись, мы ждём тебя дома!', 'words.radio': 'Радиограмма', 'words.author': 'Ваше имя (необязательно)', 'words.send': 'Отправить', 'words.cancel': 'Отмена',
  'err.words_off': 'Слова поддержки сейчас закрыты', 'err.words_empty': 'Сначала напишите что-нибудь',
  'err.words_ip': 'На этот час хватит. Спасибо!', 'err.words_busy': 'За этот час уже много слов. Попробуйте позже.',
  's.look': 'Внешний вид', 's.cards': 'Карточки', 's.autosave': 'Изменения сохраняются сразу.', 'g.who': 'Кто', 'g.service': 'Служба', 'g.after': 'После дембеля', 'err.number': 'Введите число от 0 до 1000',
  'w.title': 'Слова поддержки', 'w.accept': 'Посетители могут отправлять слова', 'w.show': 'Слова падают на странице таймеров',
  'w.perIp': 'С одного посетителя (IP) в час', 'w.perHour': 'Со всего сайта в час', 'w.clear': 'Удалить все',
  'w.gap': 'Пауза между словами, секунд', 'w.cycle': 'Минимальный цикл, минут', 'w.cycleHint': 'За один цикл каждое слово показывается один раз, в случайном порядке и со случайными паузами. Если слов мало, они растягиваются на весь цикл: одно слово покажется раз за цикл.',
  'w.days': 'Хранить слова, дней', 'w.daysHint': 'Более старые слова удаляются сами. 0 – хранить, пока не удалите вручную.',
  'w.count': 'Слов: {n}', 'confirm.words': 'Удалить все слова поддержки ({n})?', 'hist.wordsCleared': 'Слова поддержки удалены',
  'f.pending': 'Начало службы – это дата повестки', 'f.pendingHint': 'С этой даты на карточке вместо отсчёта «Пока неясно», пока вы не подтвердите, что он отбыл.',
  'pending.badge': 'Не подтверждено', 'btn.confirm': 'Подтвердить отбытие', 'confirm.confirm': 'Подтвердить, что «{name}» отбыл на службу?',
  'msg.confirmed': 'Отбытие подтверждено', 'hist.confirmed': 'Подтверждено отбытие «{name}»',
  'privacy.title': 'Политика конфиденциальности', 'privacy.back': 'К таймерам',
},
'be-BY': {
  'lang.label': 'Мова', 'theme.dark': 'Уключыць цёмную тэму', 'theme.light': 'Уключыць светлую тэму',
  'footer.privacy': 'Канфідэнцыйнасць', 'nav.admin': 'Адмінка', 'nav.timers': 'Да таймераў', 'footer.source': 'Зыходны код',
  'notice.text': 'Тут няма сачэння, рэкламы і аналітыкі. Захоўваюцца толькі абраныя мова і тэма – у вашым браўзеры.',
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
  'tab.people': 'Людзі', 'tab.words': 'Словы', 'tab.settings': 'Налады', 'tab.history': 'Гісторыя', 'admin.find': 'Знайсці па імені', 'btn.close': 'Закрыць',
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
  's.title': 'Налады старонкі', 's.pageTitle': 'Загаловак старонкі', 's.background': 'Жывы камуфляжны фон', 's.clock': 'Паказваць гадзіны, хвіліны і секунды побач з днямі', 's.seconds': 'Паказваць секунды',
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
  'words.open': 'Адправіць словы падтрымкі', 'words.title': 'Словы падтрымкі', 'words.hint': 'Слова ці пара сказаў. Яны будуць падаць па старонцы, і іх убачаць усе.',
  'words.ph': 'Трымайся, мы чакаем цябе дома!', 'words.radio': 'Радыёграма', 'words.author': 'Ваша імя (неабавязкова)', 'words.send': 'Адправіць', 'words.cancel': 'Адмена',
  'err.words_off': 'Словы падтрымкі зараз закрыты', 'err.words_empty': 'Спачатку напішыце што-небудзь',
  'err.words_ip': 'На гэтую гадзіну дастаткова. Дзякуй!', 'err.words_busy': 'За гэтую гадзіну ўжо шмат слоў. Паспрабуйце пазней.',
  's.look': 'Знешні выгляд', 's.cards': 'Карткі', 's.autosave': 'Змены захоўваюцца адразу.', 'g.who': 'Хто', 'g.service': 'Служба', 'g.after': 'Пасля дэмбеля', 'err.number': 'Увядзіце лік ад 0 да 1000',
  'w.title': 'Словы падтрымкі', 'w.accept': 'Наведвальнікі могуць адпраўляць словы', 'w.show': 'Словы падаюць на старонцы таймераў',
  'w.perIp': 'З аднаго наведвальніка (IP) за гадзіну', 'w.perHour': 'З усяго сайта за гадзіну', 'w.clear': 'Выдаліць усе',
  'w.gap': 'Паўза паміж словамі, секунд', 'w.cycle': 'Мінімальны цыкл, хвілін', 'w.cycleHint': 'За адзін цыкл кожнае слова паказваецца адзін раз, у выпадковым парадку і з выпадковымі паўзамі. Калі слоў мала, яны расцягваюцца на ўвесь цыкл: адно слова пакажацца раз за цыкл.',
  'w.days': 'Захоўваць словы, дзён', 'w.daysHint': 'Больш старыя словы выдаляюцца самі. 0 – захоўваць, пакуль не выдаліце ўручную.',
  'w.count': 'Слоў: {n}', 'confirm.words': 'Выдаліць усе словы падтрымкі ({n})?', 'hist.wordsCleared': 'Словы падтрымкі выдалены',
  'f.pending': 'Пачатак службы – гэта дата позвы', 'f.pendingHint': 'З гэтай даты на картцы замест адліку «Пакуль незразумела», пакуль вы не пацвердзіце, што ён адбыў.',
  'pending.badge': 'Не пацверджана', 'btn.confirm': 'Пацвердзіць адбыццё', 'confirm.confirm': 'Пацвердзіць, што «{name}» адбыў на службу?',
  'msg.confirmed': 'Адбыццё пацверджана', 'hist.confirmed': 'Пацверджана адбыццё «{name}»',
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
  el.onclick = e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); };
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
function themeSwitch(el) { // light / dark toggle; until it is used the system setting decides
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'theme';
  const draw = () => { const next = theme() === 'dark' ? 'light' : 'dark'; b.innerHTML = ICONS[next]; b.title = t('theme.' + next); b.setAttribute('aria-label', b.title); };
  b.onclick = () => {
    const next = theme() === 'dark' ? 'light' : 'dark', root = document.documentElement;
    root.dataset.theme = next; root.style.colorScheme = next; store.set('theme', next); draw();
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
