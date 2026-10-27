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

// Funny statuses. Each entry: [phases, rule, en-US, ru-RU, be-BY]
// phases: space-separated list of soon (before call-up) | serve | done (after demobilization)
// Rule keys; ranges are [min, max) in days, max may be omitted (= no upper limit):
//   u: days until call-up        d: days served          l: days left
//   a: days since demobilization p: percent served (0-100)
//   m: months (1-12) when it fits, in the server time zone
//   md: [from, to) dates as MMDD, may wrap the new year (e.g. [1225, 103])
//   h: [from, to) hours, may wrap past midnight (e.g. [23, 6])
//   w: weight (default 1); short milestones get more so they are not drowned out
// Statuses are picked only inside their window, so nobody sits at the train station two days early.
window.STATUSES = [
// ---- before the call-up ----
// civilians: the call-up is still months or years away
['soon', {u: [365], w: 2}, 'More than a year to go. Living like it is forever', 'Больше года до призыва. Живёт так, будто это навсегда', 'Больш за год да прызыву. Жыве так, быццам гэта назаўсёды'],
['soon', {u: [365]}, 'The army is so far away it feels like a rumour', 'Армия так далеко, что кажется слухом', 'Войска так далёка, што здаецца чуткай'],
['soon', {u: [180]}, 'Passing exams to push the call-up a bit further', 'Сдаёт сессию, чтобы отодвинуть призыв подальше', 'Здае сесію, каб адсунуць прызыў далей'],
['soon', {u: [180]}, 'Mom is already saving recipes for future parcels', 'Мама уже сохраняет рецепты для будущих посылок', 'Мама ўжо захоўвае рэцэпты для будучых пасылак'],
['soon', {u: [60]}, 'Sleeping until noon while it is still legal', 'Спит до обеда, пока это ещё законно', 'Спіць да абеду, пакуль гэта яшчэ законна'],
['soon', {u: [60]}, 'Growing the hair out while nobody minds', 'Отращивает волосы, пока никто не против', 'Адрошчвае валасы, пакуль ніхто не супраць'],
['soon', {u: [60]}, 'Leaving the bed unmade on purpose', 'Специально не заправляет кровать', 'Спецыяльна не засцілае ложак'],
['soon', {u: [60]}, 'Crossing the street to avoid walking past the enlistment office', 'Обходит военкомат по другой стороне улицы', 'Абыходзіць ваенкамат па іншым баку вуліцы'],
['soon', {u: [60]}, 'Says "when I join the army..." purely for the drama', 'Говорит «вот уйду в армию...» исключительно для драмы', 'Кажа «вось пайду ў войска...» выключна дзеля драмы'],
['soon', {u: [60]}, 'Eating draniki at grandma\'s, stocking up for later', 'Ест драники у бабушки – запасается впрок', 'Есць дранікі ў бабулі – запасаецца на потым'],
['soon', {u: [90]}, 'Gaming until 3 a.m. Calls it training for night duty', 'Играет в приставку до трёх ночи. Называет это подготовкой к нарядам', 'Гуляе ў прыстаўку да трох ночы. Называе гэта падрыхтоўкай да нарадаў'],
['soon', {u: [60], h: [7, 11], w: 2}, 'Hitting snooze for the fifth time. No sergeant in sight', 'Пятый раз откладывает будильник. Сержанта поблизости нет', 'Пяты раз адкладвае будзільнік. Сяржанта паблізу няма'],
['soon', {u: [60], h: [21, 3]}, 'Ordering shawarma at midnight, just because', 'Заказывает шаурму в полночь. Просто потому что можно', 'Заказвае шаўрму апоўначы. Проста таму, што можна'],
['soon', {u: [60], m: [6, 7, 8]}, 'Summer at the Braslav lakes, no wake-up call', 'Лето на Браславских озёрах, никакого подъёма', 'Лета на Браслаўскіх азёрах, ніякага пад\'ёму'],
['soon', {u: [60], m: [8, 9, 10]}, 'Picking mushrooms in the forest. Definitely not reconnaissance', 'Собирает грибы в лесу. Это точно не разведка', 'Збірае грыбы ў лесе. Гэта дакладна не разведка'],
['soon', {u: [60], m: [9, 10]}, 'Digging potatoes at the dacha: civilian drill', 'Копает бульбу на даче – гражданская строевая', 'Капае бульбу на лецішчы – цывільная страявая'],
['soon', {u: [60], m: [12, 1, 2]}, 'Winter holidays on the sofa: tangerines and series', 'Зимние каникулы на диване: мандарины и сериалы', 'Зімовыя канікулы на канапе: мандарыны і серыялы'],

['soon', {u: [180]}, 'Studying on a deferment. The enlistment office waits patiently', 'Учится на отсрочке. Военкомат терпеливо ждёт', 'Вучыцца на адтэрміноўцы. Ваенкамат цярпліва чакае'],
['soon', {u: [180]}, 'The call-up is far away: time for the sea and the dacha', 'До призыва далеко: успеет и на море, и на дачу', 'Да прызыву далёка: паспее і на мора, і на дачу'],
['soon', {u: [90]}, 'Says "I\'ll serve someday" and changes the subject', 'Говорит «когда-нибудь отслужу» и меняет тему', 'Кажа «калі-небудзь адслужу» і мяняе тэму'],
['soon', {u: [30, 365]}, 'Found the registration certificate (pripisnoe) from school days. Turned out useful', 'Нашёл приписное, выданное ещё в школе. Пригодилось', 'Знайшоў прыпіснае, выдадзенае яшчэ ў школе. Спатрэбілася'],
['soon', {u: [1, 60]}, 'Asking everyone who served: "What is it like in Pechi?"', 'Расспрашивает всех отслуживших: «А как там в Печах?»', 'Распытвае ўсіх, хто адслужыў: «А як там у Печах?»'],
['soon', {u: [60]}, 'Still a civilian. Enjoying every lie-in', 'Пока гражданский. Наслаждается каждым поздним подъёмом', 'Пакуль цывільны. Атрымлівае асалоду ад кожнага позняга пад\'ёму'],
['soon', {u: [14, 180]}, 'Passing the medical board, hoping the eye chart is merciful', 'Проходит медкомиссию, надеется на снисхождение окулиста', 'Праходзіць медкамісію, спадзяецца на літасць акуліста'],
['soon', {u: [14]}, 'Googling what portyanki (footwraps) are', 'Гуглит, что такое портянки', 'Гугліць, што такое анучы'],
['soon', {u: [1, 10]}, 'Last cheat days: eating everything, perlovka is ahead', 'Последние читмилы: ест всё подряд, впереди перловка', 'Апошнія чытмілы: есць усё запар, наперадзе пярлоўка'],
['soon', {u: [10]}, 'Doing push-ups every evening. Well, most evenings', 'Каждый вечер отжимается. Ну, почти каждый', 'Кожны вечар адціскаецца. Ну, амаль кожны'],
['soon', {u: [1]}, 'Explaining to everyone that it will definitely be fine', 'Объясняет всем, что всё точно будет нормально', 'Тлумачыць усім, што ўсё дакладна будзе нармальна'],
['soon', {u: [1, 30]}, 'Studying the draft notice (povestka) like an ancient scroll', 'Изучает повестку, как древний свиток', 'Вывучае позву, як старажытны скрутак'],
['soon', {u: [2, 45]}, 'Visiting the enlistment office (voenkomat) for the tenth time', 'В десятый раз идёт в военкомат', 'У дзясяты раз ідзе ў ваенкамат'],
['soon', {u: [1, 21]}, 'Listening to every uncle tell how it was in \'95', 'Слушает, как каждый дядя рассказывает, как было в 95-м', 'Слухае, як кожны дзядзька распавядае, як было ў 95-м'],
['soon', {u: [1, 21]}, 'Training to fall asleep in 40 seconds', 'Тренируется засыпать за 40 секунд', 'Трэніруецца засынаць за 40 секунд'],
['soon', {u: [1, 14]}, 'Practicing "Yes, comrade sergeant!" in the mirror', 'Репетирует перед зеркалом «Так точно, товарищ сержант!»', 'Рэпеціруе перад люстэркам «Ёсць, таварыш сяржант!»'],
['soon', {u: [1, 7]}, 'Mom is cooking for the next year, all in one week', 'Мама готовит на год вперёд, и всё за одну неделю', 'Мама гатуе на год наперад, і ўсё за адзін тыдзень'],
['soon', {u: [0.5, 7]}, 'Packing a bag the army will rearrange anyway', 'Собирает сумку, которую в армии всё равно перетряхнут', 'Збірае сумку, якую ў войску ўсё роўна перацрасуць'],
['soon', {u: [0.5, 5]}, 'Buying socks, because nobody trusts footwraps', 'Закупается носками: портянкам никто не доверяет', 'Закупляецца шкарпэткамі: анучам ніхто не давярае'],
['soon', {u: [0.5, 4], w: 3}, 'Farewell party (provody) is on. The liver is already on leave', 'Проводы в разгаре. Печень уже в увольнении', 'Провады ў разгары. Печань ужо ў звальненні'],
['soon', {u: [0.3, 3]}, 'Last walk with friends around the old neighbourhood', 'Последняя прогулка с друзьями по родному району', 'Апошні шпацыр з сябрамі па родным раёне'],
['soon', {u: [0.2, 3]}, 'Got a buzz cut early, to beat the army barber to it', 'Постригся под ноль заранее, чтобы опередить армейского цирюльника', 'Пастрыгся пад нуль загадзя, каб апярэдзіць армейскага цырульніка'],
['soon', {u: [0.2, 2]}, 'Saying goodbye to the favourite mattress', 'Прощается с любимым матрасом', 'Развітваецца з любімым матрацам'],
['soon', {u: [0.2, 1.5]}, 'Sewing a secret pocket for snacks', 'Пришивает секретный карман для сладостей', 'Прышывае сакрэтную кішэню для ласункаў'],
['soon', {u: [0.3, 1.2], w: 2}, 'Last homemade dinner for a long while', 'Последний домашний ужин надолго', 'Апошняя хатняя вячэра надоўга'],
['soon', {u: [0, 0.5], w: 2}, 'Hugging mom, patting the dog, checking the documents', 'Обнимает маму, гладит собаку, проверяет документы', 'Абдымае маму, гладзіць сабаку, правярае дакументы'],
['soon', {u: [0, 0.4], w: 3}, 'Sitting on the packed bag at the assembly point', 'Сидит на собранной сумке на сборном пункте', 'Сядзіць на сабранай сумцы на зборным пункце'],
['soon', {u: [0, 0.25], w: 2}, 'The bus to the unit is almost here. So is the haircut', 'Автобус в часть почти подан. Как и стрижка', 'Аўтобус у часць амаль пададзены. Як і стрыжка'],
['soon', {}, 'Counting down like it is New Year\'s Eve, but less fun', 'Считает дни, как перед Новым годом, только веселья меньше', 'Лічыць дні, як перад Новым годам, толькі весялосці менш'],

// ---- arrival and basic training ----
['serve', {d: [0, 1], w: 3}, 'Got a new haircut. Everybody got the same one', 'Новая стрижка. У всех одинаковая', 'Новая стрыжка. Ва ўсіх аднолькавая'],
['serve', {d: [0, 1], w: 2}, 'Handed in the phone. Feels like losing a hand', 'Сдал телефон. Ощущение, будто сдал руку', 'Здаў тэлефон. Адчуванне, быццам здаў руку'],
['serve', {d: [0, 3]}, 'Got the uniform. It fits nobody and everybody', 'Выдали форму. Не сидит ни на ком и на всех сразу', 'Выдалі форму. Не сядзіць ні на кім і на ўсіх адразу'],
['serve', {d: [0, 3]}, 'Meeting the starshina (sergeant major). Forgot own name', 'Знакомится со старшиной. Забыл собственное имя', 'Знаёміцца са старшынёй. Забыў уласнае імя'],
['serve', {d: [0, 2], h: [21, 7], w: 2}, 'First night in the barracks: sixty people snoring in harmony', 'Первая ночь в казарме: шестьдесят человек храпят в унисон', 'Першая ноч у казарме: шэсцьдзесят чалавек храпуць ва ўнісон'],
['serve', {d: [0, 14]}, 'Learning to make a bed that looks like a cube', 'Учится заправлять кровать в идеальный кубик', 'Вучыцца засцілаць ложак у ідэальны кубік'],
['serve', {d: [0, 14]}, 'Learning to wind footwraps. Nobody asked if it was wanted', 'Учится наматывать портянки. Никто не спрашивал, хочет ли', 'Вучыцца накручваць анучы. Ніхто не пытаўся, ці хоча'],
['serve', {d: [1, 10]}, 'Dressing in 45 seconds while a match burns', 'Одевается за 45 секунд, пока горит спичка', 'Апранаецца за 45 секунд, пакуль гарыць запалка'],
['serve', {d: [1, 30]}, 'Basic training (KMB): no visitors, plenty of shouting', 'Курс молодого бойца: посетителей нет, крика хватает', 'Курс маладога байца: наведвальнікаў няма, крыку хапае'],
['serve', {d: [3, 45]}, 'Sewing on the white collar (podvorotnichok). Every. Single. Evening', 'Подшивает подворотничок. Каждый. Божий. Вечер', 'Падшывае падкаўнерык. Кожны. Божы. Вечар'],
['serve', {d: [7, 30]}, 'Practicing the march step for the oath', 'Отрабатывает строевой шаг к присяге', 'Адпрацоўвае страявы крок да прысягі'],
['serve', {d: [10, 30]}, 'Memorizing the oath. Mumbling it in sleep', 'Учит текст присяги. Бормочет его во сне', 'Вучыць тэкст прысягі. Мармыча яго ў сне'],
['serve', {d: [24, 38], w: 4}, 'Oath day: parents in the stands, mom is crying', 'День присяги: родители на трибуне, мама плачет', 'Дзень прысягі: бацькі на трыбуне, мама плача'],
['serve', {d: [28, 120]}, 'First leave pass (uvolnenie): three shawarmas in one hour', 'Первое увольнение: три шаурмы за час', 'Першае звальненне: тры шаўрмы за гадзіну'],
['serve', {d: [5, 90]}, 'Training unit (uchebka): marching, marching, marching', 'Учебка: строевая, строевая, строевая', 'Вучэбка: страявая, страявая, страявая'],
['serve', {d: [5, 90]}, 'Assembling and disassembling the rifle, blindfolded. Again', 'Собирает и разбирает автомат с завязанными глазами. Опять', 'Збірае і разбірае аўтамат з завязанымі вачыма. Зноў'],
['serve', {d: [3, 120]}, 'Running cross-country at dawn, sincerely wondering why', 'Бежит кросс на рассвете и искренне не понимает зачем', 'Бяжыць крос на світанку і шчыра не разумее навошта'],
['serve', {d: [14, 90]}, 'First time at the shooting range. Ears still ringing', 'Первый раз на стрельбище. В ушах до сих пор звенит', 'Першы раз на стрэльбішчы. У вушах дагэтуль звініць'],

['serve', {d: [0, 90]}, 'Hearing legends about the Pechi training centre, hoping they are exaggerated', 'Слушает легенды про учебку в Печах и надеется, что они преувеличены', 'Слухае легенды пра вучэбку ў Печах і спадзяецца, што яны перабольшаныя'],
['serve', {d: [5, 30]}, 'Learning the anthem "My, Belarusy" by heart, every verse', 'Учит наизусть гимн «Мы, беларусы», все куплеты', 'Вучыць на памяць гімн «Мы, беларусы», усе куплеты'],
['serve', {d: [25, 40], w: 2}, 'Took the oath at a war memorial. Mom filmed every second', 'Принял присягу у мемориала. Мама сняла каждую секунду', 'Прыняў прысягу ля мемарыяла. Мама зняла кожную секунду'],

// ---- everyday service ----
['serve', {d: [7]}, 'Draniki in the canteen today! A holiday for the whole company', 'В столовой драники! Праздник для всей роты', 'У сталовай дранікі! Свята для ўсёй роты'],
['serve', {d: [7]}, 'Potatoes for lunch, potatoes for dinner. Belarus, after all', 'Бульба на обед, бульба на ужин. Беларусь всё-таки', 'Бульба на абед, бульба на вячэру. Беларусь усё ж такі'],
['serve', {d: [21]}, 'Writing to mom: "All good, they feed us potatoes"', 'Пишет маме: «Всё хорошо, кормят бульбой»', 'Піша маме: «Усё добра, кормяць бульбай»'],
['serve', {d: [30]}, 'Got the monthly allowance: enough for condensed milk and cookies', 'Пришло денежное довольствие: хватило на сгущёнку и печенье', 'Прыйшло грашовае забеспячэнне: хапіла на згушчонку і пячэнне'],
['serve', {d: [14]}, 'Excursion to the Brest Fortress: stood in silence for a long time', 'Экскурсия в Брестскую крепость: долго стоял молча', 'Экскурсія ў Брэсцкую крэпасць: доўга стаяў моўчкі'],
['serve', {d: [7], h: [21, 22], w: 2}, 'Evening roll call: shouting "Here!" louder than anyone', 'Вечерняя поверка: кричит «Я!» громче всех', 'Вячэрняя праверка: крычыць «Я!» гучней за ўсіх'],
['serve', {d: [3], l: [3], m: [12, 1, 2]}, 'Belarusian winter: no frost, no snow, just slush on the parade ground', 'Белорусская зима: ни мороза, ни снега, только слякоть на плацу', 'Беларуская зіма: ні марозу, ні снегу, толькі слата на плацы'],
['serve', {d: [30], l: [7], m: [6, 7, 8]}, 'Field exercise in Polesie: feeding the local mosquitoes', 'Полевой выход на Полесье: кормит местных комаров', 'Палявы выхад на Палессе: корміць мясцовых камароў'],
['serve', {d: [14], m: [4, 5, 6, 7, 8]}, 'Watching a stork over the barracks and thinking of home', 'Смотрит на аиста над казармой и думает о доме', 'Глядзіць на бусла над казармай і думае пра дом'],
['serve', {d: [30], md: [610, 703]}, 'Parade rehearsal for July 3rd: marching down Pieramozhcau Avenue at night', 'Репетиция парада к 3 июля: ночью марширует по проспекту Победителей', 'Рэпетыцыя парада да 3 ліпеня: ноччу маршыруе па праспекце Пераможцаў'],
['serve done', {md: [703, 704], w: 6}, 'July 3rd, Independence Day: parade, fireworks and squared shoulders', '3 июля, День Независимости: парад, салют и гордо расправленные плечи', '3 ліпеня, Дзень Незалежнасці: парад, салют і ганарліва распраўленыя плечы'],
['serve done', {md: [509, 510], w: 6}, 'May 9th: laying flowers at the eternal flame', '9 Мая: возлагает цветы к Вечному огню', '9 Мая: ускладае кветкі да Вечнага агню'],
['serve', {d: [5], l: [1]}, 'Cleaning the rifle. It was already clean', 'Чистит автомат. Он и так был чистый', 'Чысціць аўтамат. Ён і так быў чысты'],
['serve', {d: [14], l: [7]}, 'Peeling potatoes on kitchen duty (naryad)', 'Чистит картошку в наряде по столовой', 'Чысціць бульбу ў нарадзе па сталовай'],
['serve', {d: [14], l: [7]}, 'Polishing the floor with a toothbrush, purely for education', 'Натирает пол зубной щёткой, исключительно в воспитательных целях', 'Націрае падлогу зубной шчоткай, выключна ў выхаваўчых мэтах'],
['serve', {d: [14], l: [3]}, 'Ideology classes: fighting sleep and losing', 'Занятия по идеологии: борется со сном и проигрывает', 'Заняткі па ідэалогіі: змагаецца са сном і прайграе'],
['serve', {d: [3]}, 'Eating perlovka. It tastes better than it looks. A bit', 'Ест перловку. На вкус лучше, чем на вид. Немного', 'Есць пярлоўку. На смак лепш, чым на выгляд. Трошкі'],
['serve', {d: [7]}, 'Waiting for Sunday, the day of the phone call to mom', 'Ждёт воскресенья – дня звонка маме', 'Чакае нядзелі – дня званка маме'],
['serve', {d: [7], m: [10, 11, 12, 1, 2, 3, 4]}, 'Washing the uniform by hand, drying it on the radiator', 'Стирает форму руками, сушит на батарее', 'Мые форму рукамі, сушыць на батарэі'],
['serve', {}, 'Crossing out another day on the pocket calendar', 'Зачёркивает ещё один день в карманном календарике', 'Закрэслівае яшчэ адзін дзень у кішэнным каляндарыку'],
['serve', {d: [14]}, 'Opening a parcel from home. Half of it goes to the squad', 'Открывает посылку из дома. Половина уходит отделению', 'Адкрывае пасылку з дому. Палова сыходзіць аддзяленню'],
['serve', {d: [14], l: [3], m: [12, 1, 2, 3]}, 'Standing guard in the snow, dreaming of a hot shawarma', 'Стоит на посту в снегу и мечтает о горячей шаурме', 'Стаіць на пасту ў снезе і марыць пра гарачую шаўрму'],
['serve', {d: [3], l: [3], m: [12, 1, 2, 3]}, 'Shovelling snow off the parade ground. It keeps falling', 'Убирает снег с плаца. А он всё идёт', 'Прыбірае снег з плаца. А ён усё ідзе'],
['serve', {d: [7], l: [3], m: [6, 7, 8]}, 'Full gear at +30°C. Sauna included', 'Полная выкладка при +30. Сауна включена', 'Поўная выкладка пры +30. Лазня ўключана'],
['serve', {d: [14], l: [3], m: [9, 10]}, 'Sent to help with the potato harvest, for the motherland', 'Отправлен на уборку картошки, во имя родины', 'Адпраўлены на ўборку бульбы, дзеля радзімы'],
['serve', {d: [3], l: [3], m: [10, 11]}, 'Raking leaves. The wind disagrees', 'Сгребает листья. Ветер против', 'Грабе лісце. Вецер супраць'],
['serve', {d: [7], l: [3], m: [4, 5]}, 'Spring clean-up day: painting the kerbs white', 'Весенний ПХД: красит бордюры в белый', 'Вясновы ПГД: фарбуе бардзюры ў белы'],
['serve', {d: [30], l: [7], m: [5, 6, 7, 8, 9]}, 'Painting the grass green before the general\'s visit', 'Красит траву в зелёный к приезду генерала', 'Фарбуе траву ў зялёны да прыезду генерала'],
['serve', {d: [2], md: [1229, 102], w: 5}, 'New Year in the barracks: tangerines, the President\'s speech and lights-out at midnight', 'Новый год в казарме: мандарины, обращение Президента и отбой в полночь', 'Новы год у казарме: мандарыны, зварот Прэзідэнта і адбой апоўначы'],
['serve done', {md: [223, 224], w: 6}, 'February 23rd: accepting congratulations as a real defender', '23 февраля: принимает поздравления как настоящий защитник', '23 лютага: прымае віншаванні як сапраўдны абаронца'],
['serve', {d: [1], l: [0.5], h: [6, 7], w: 3}, 'Wake-up call (pod\'yom)! 45 seconds to get dressed', 'Подъём! 45 секунд на одевание', 'Пад\'ём! 45 секунд на апрананне'],
['serve', {d: [1], l: [0.5], h: [13, 15], w: 2}, 'Lunch: soup, perlovka and compote', 'Обед: суп, перловка и компот', 'Абед: суп, пярлоўка і кампот'],
['serve', {d: [1], l: [0.5], h: [23, 6], w: 3}, 'Asleep after lights-out, dreaming of mom\'s kitchen', 'Спит после отбоя, снится мамина кухня', 'Спіць пасля адбою, сніцца мамчына кухня'],
['serve', {d: [14], l: [1], h: [0, 5]}, 'Night orderly by the nightstand (tumbochka), fighting sleep', 'Дневальный на тумбочке ночью, борется со сном', 'Днявальны на тумбачцы ноччу, змагаецца са сном'],

// ---- experienced soldier ----
['serve', {d: [60]}, 'Knows which boot squeaks and which door never closes', 'Знает, какой сапог скрипит и какая дверь не закрывается', 'Ведае, які бот рыпіць і якія дзверы не зачыняюцца'],
['serve', {d: [60]}, 'Mastered the art of sleeping while standing', 'Освоил искусство спать стоя', 'Асвоіў мастацтва спаць стоячы'],
['serve', {d: [60], l: [20]}, 'On a field exercise: tents, mud and a field kitchen', 'На полевом выходе: палатки, грязь и полевая кухня', 'На палявым выхадзе: палаткі, гразь і палявая кухня'],
['serve', {d: [60]}, 'Adjusting the beret with mathematical precision', 'Поправляет берет с математической точностью', 'Папраўляе берэт з матэматычнай дакладнасцю'],
['serve', {d: [90]}, 'Knows the regulations by heart and the loopholes even better', 'Знает устав наизусть, а лазейки – ещё лучше', 'Ведае статут на памяць, а шчыліны ў ім – яшчэ лепш'],
['serve', {d: [90], l: [3]}, 'No longer afraid of the sergeant, but still salutes', 'Сержанта уже не боится, но честь отдаёт', 'Сяржанта ўжо не баіцца, але чэсць аддае'],
['serve', {d: [90]}, 'Weighing how many kilos mom\'s parcels added', 'Подсчитывает, сколько кило добавили мамины посылки', 'Падлічвае, колькі кіло дадалі мамчыны пасылкі'],
['serve', {d: [90, 240]}, 'Got the first stripe (lychka). Proudly sewed it on crooked', 'Получил первую лычку. Гордо пришил её криво', 'Атрымаў першую лычку. Ганарліва прышыў яе крыва'],
['serve', {d: [120], l: [10]}, 'On guard duty: sees everything, says nothing', 'В карауле: всё видит, ничего не говорит', 'У карауле: усё бачыць, нічога не кажа'],
['serve', {d: [150], l: [14]}, 'Saying "when I was a rookie..." to a rookie', 'Говорит молодому: «Вот когда я был молодым...»', 'Кажа маладому: «Вось калі я быў маладым...»'],
['serve', {d: [150], l: [14]}, 'Mentoring the young ones: "this is how you hold a mop"', 'Учит молодых: «Швабру держат вот так»', 'Вучыць маладых: «Швабру трымаюць вось так»'],
['serve', {p: [48, 53], d: [30], w: 8}, 'Halfway there. The "pereval" (mountain pass) is behind', 'Половина позади. Перевал пройден', 'Палова ззаду. Перавал пройдзены'],
['serve', {p: [50, 62], d: [30]}, 'Downhill from here: every day is shorter than the last', 'Дальше под горку: каждый день короче предыдущего', 'Далей з горкі: кожны дзень карацейшы за папярэдні'],

['serve', {d: [120], l: [30]}, 'Exercises at the Borisov range: sand everywhere, even in the tea', 'Учения на Борисовском полигоне: песок везде, даже в чае', 'Вучэнні на Барысаўскім палігоне: пясок усюды, нават у гарбаце'],
['serve', {d: [150], l: [30]}, 'Home on leave: it flew by like a single day', 'В отпуске дома: пролетел как один день', 'У адпачынку дома: праляцеў як адзін дзень'],

// ---- getting ready to go home ----
['serve', {l: [97, 103], d: [100], w: 8}, '100 days to the order: shaved head again, by tradition', 'Сто дней до приказа: снова побрился наголо, по традиции', 'Сто дзён да загаду: зноў пагаліўся налыса, па традыцыі'],
['serve', {l: [1, 90], d: [60]}, 'Already dreaming about jeans and freedom', 'Уже мечтает о джинсах и свободе', 'Ужо марыць пра джынсы і свабоду'],
['serve', {l: [14, 120], d: [90]}, 'Drawing the demob album (dembelsky albom)', 'Рисует дембельский альбом', 'Малюе дэмбельскі альбом'],
['serve', {l: [7, 60], d: [60]}, 'Braiding the aiguillettes (aksel\'bant) for the ride home', 'Плетёт аксельбант на дорогу домой', 'Пляце аксельбант на дарогу дадому'],
['serve', {l: [3, 45], d: [60]}, 'Preparing the dress uniform: every crease to regulation', 'Готовит парадку: каждая складка по уставу', 'Рыхтуе парадку: кожная складка па статуце'],
['serve', {l: [1, 30], d: [30]}, 'Counting not days anymore, but breakfasts', 'Считает уже не дни, а завтраки', 'Лічыць ужо не дні, а сняданкі'],
['serve', {l: [1, 60], p: [70]}, 'Already a legend of the barracks', 'Уже легенда казармы', 'Ужо легенда казармы'],
['serve', {l: [2, 14]}, 'Bought the ticket home. Checks it twice a day', 'Купил билет домой. Проверяет его дважды в день', 'Купіў квіток дадому. Правярае яго двойчы на дзень'],
['serve', {l: [1, 10]}, 'Reading the train timetable for the fifth time', 'В пятый раз перечитывает расписание поездов', 'У пяты раз перачытвае расклад цягнікоў'],
['serve', {l: [1, 7]}, 'Suitcase packed, eyes already at home', 'Чемодан собран, глаза уже дома', 'Чамадан сабраны, вочы ўжо дома'],
['serve', {l: [0.5, 7]}, 'Trying to look serious, smiling anyway', 'Пытается выглядеть серьёзно, но всё равно улыбается', 'Спрабуе выглядаць сур\'ёзна, але ўсё роўна ўсміхаецца'],
['serve', {l: [0.5, 3]}, 'Saying farewell to the canteen tea', 'Прощается с чаем из столовой', 'Развітваецца з чаем са сталовай'],
['serve', {l: [1, 3], w: 2}, 'Ironing the dress uniform for the last time', 'В последний раз гладит парадку', 'Апошні раз прасуе парадку'],
['serve', {l: [0, 2], w: 3}, 'Running around with the clearance sheet, collecting signatures', 'Бегает с обходным листом, собирает подписи', 'Бегае з абходным лістом, збірае подпісы'],
['serve', {l: [0, 1], w: 3}, 'Handing in the rifle, the bedding and the last bit of patience', 'Сдаёт автомат, постельное и остатки терпения', 'Здае аўтамат, бялізну і рэшткі цярпення'],
['serve', {l: [0, 0.5], w: 4}, 'Looking at the checkpoint gate like at a finish line', 'Смотрит на КПП, как на финишную черту', 'Глядзіць на КПП, як на фінішную рысу'],

// ---- after demobilization ----
['done', {a: [0.5, 14]}, 'Registering at the enlistment office again, this time as a reservist', 'Встаёт на учёт в военкомате, теперь как запасник', 'Становіцца на ўлік у ваенкамаце, цяпер як запаснік'],
['done', {a: [1, 60]}, 'Grandma: "So thin!" Serving draniki with machanka', 'Бабушка: «Как исхудал!» Кормит драниками с мачанкой', 'Бабуля: «Як схуднеў!» Корміць дранікамі з мачанкай'],
['done', {a: [0, 0.5], w: 4}, 'At the train station in full dress, aiguillettes shining', 'На вокзале при параде, аксельбанты сияют', 'На вакзале ў парадным, аксельбанты зіхацяць'],
['done', {a: [0, 1], w: 3}, 'On the train home, staring out of the window and grinning', 'Едет домой в поезде, смотрит в окно и улыбается', 'Едзе дадому ў цягніку, глядзіць у акно і ўсміхаецца'],
['done', {a: [0.2, 2], w: 3}, 'Dembel! Hugging mom at the door', 'Дембель! Обнимает маму на пороге', 'Дэмбель! Абдымае маму на парозе'],
['done', {a: [0.2, 7]}, 'Eating mom\'s draniki: the portion for the whole service', 'Ест мамины драники – порцию за всю службу', 'Есць мамчыны дранікі – порцыю за ўсю службу'],
['done', {a: [0.3, 5]}, 'Sleeping in own bed with no wake-up call for the first time in ages', 'Впервые за долгое время спит в своей кровати без подъёма', 'Упершыню за доўгі час спіць у сваім ложку без пад\'ёму'],
['done', {a: [0.5, 14]}, 'Visiting every relative in the dress uniform', 'Обходит всех родственников в парадке', 'Абыходзіць усіх сваякоў у парадцы'],
['done', {a: [1, 30]}, 'Wearing jeans for the first time in months', 'Впервые за долгие месяцы надел джинсы', 'Упершыню за доўгія месяцы надзеў джынсы'],
['done', {a: [1, 30]}, 'Sleeping until noon purely because it is possible', 'Спит до обеда просто потому, что можно', 'Спіць да абеду проста таму, што можна'],
['done', {a: [2, 60]}, 'Still wakes up at 6:00 sharp. No reason', 'Всё ещё просыпается ровно в 6:00. Без причины', 'Усё яшчэ прачынаецца роўна а 6:00. Без прычыны'],
['done', {a: [3, 120]}, 'Tells army stories. Nobody asked', 'Рассказывает армейские байки. Никто не просил', 'Расказвае армейскія байкі. Ніхто не прасіў'],
['done', {a: [7]}, 'Teaching everyone how to make a bed properly', 'Учит всех правильно заправлять кровать', 'Вучыць усіх правільна засцілаць ложак'],
['done', {a: [7]}, 'Folds T-shirts into perfect squares. Cannot stop', 'Складывает футболки идеальными квадратами. Не может остановиться', 'Складае футболкі ідэальнымі квадратамі. Не можа спыніцца'],
['done', {a: [14]}, 'Showing the demob album to every guest', 'Показывает дембельский альбом каждому гостю', 'Паказвае дэмбельскі альбом кожнаму госцю'],
['done', {a: [30]}, 'Civilian again. Still eats in exactly seven minutes', 'Снова гражданский. Но ест всё ещё ровно за семь минут', 'Зноў цывільны. Але есць усё яшчэ роўна за сем хвілін'],
['done', {a: [365], w: 3}, 'More than a year in the reserve; the stories keep getting bigger', 'Больше года в запасе, а байки всё растут', 'Больш за год у запасе, а байкі ўсё растуць'],
['done', {}, 'Reserve soldier now. Civilians, be careful', 'Теперь в запасе. Гражданские, берегитесь', 'Цяпер у запасе. Цывільныя, беражыцеся'],
];
