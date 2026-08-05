# Face2me: живой Tavus-агент в 3D-киоске — дизайн

**Дата:** 2026-08-05 · **Статус:** утверждён пользователем (брейншторм-сессия)
**Страница:** `app/work/face2me` · **Репо-факты:** движок хиро — OGL (`parts/hero-scene.tsx`), живой звонок ранее был построен в `parts/door.tsx` (сейчас снят со страницы), роут `app/api/reception/route.ts` существует.

## Решения (зафиксированы пользователем)

| Вопрос | Решение |
|---|---|
| Сцена разговора | Экран 3D-киоска в хиро; эффекты — в чёрной пустоте вокруг тотема |
| Роль агента | **Сейлз / SDR** (не ресепшн) |
| Финал воронки | Гибрид: тул открывает окно-форму (имя + почта), посетитель печатает, Ren голосом подтверждает |
| «Руки» | Окна-карточки по теме разговора + сценография мира как фоновый слой |
| «Глаза» | Камера посетителя **сразу на старте** (один пермишен: camera + mic) |
| Бюджет | Пул из нескольких free-аккаунтов Tavus, ротация ключей как фоллбэк; серую зону ToS пользователь принял осознанно |
| Видеослой | `apply_greenscreen` + хромакей в шейдере экрана киоска (WebGL/OGL); всё текстовое — DOM поверх |

## 1. Персона — Ren v2 (SDR)

Та же реплика (`TAVUS_REPLICA_ID`, Ruby/phoenix-4), новый системный промпт. Ren — сейлз на смене у витрины собственного продукта, говорит о продукте **в первом лице** («я стою от $599 в месяц — железо, софт и установка включены»).

Жёсткие правила промпта (гардрейлы копирайта vaflet):
- честное «я — ИИ» при вопросе или уместности;
- **ни слова о тех-стеке и вендорах** (правило: в копии для лидов только клиентская ценность);
- только подтверждённые факты: тарифы $599/$999/$1500+ за локацию month-to-month, языки **только EN/ES/RU** (+multilingual-распознавание), умения: чек-ин, букинг, регистрация новых посетителей голосом, name-match; «wired into whatever runs your business»; команда — два инженера, NYC/NJ (опубликовано на face2.me); киоск универсальный — никакой клиники/пациентов в речи;
- никого не заменила — «закрываю смены, которые никто не хочет»;
- цель разговора: понять, что за место у посетителя → показать релевантную карточку (`show_card`) → предложить оставить контакт (`open_lead_form`); после отказа не дожимает;
- тон vaflet: деловая, суховато-ироничная, без корпоративного сиропа.

Параметры разговора (создаются в `/api/reception`):
- `conversational_context`: «посетитель на странице кейса Face2me на vaflet.io, только что прошёл walk-up к киоску» + время суток (серверное);
- `custom_greeting`: короткое приветствие с крючком;
- `language: "multilingual"`, `enable_recording: false`;
- капы: `max_call_duration: 180`, `participant_absent_timeout: 40`, `participant_left_timeout: 20`;
- `apply_greenscreen: true`.

Perception (Raven): `perception_model: "raven-1"`, `visual_awareness_queries` («что видно в кадре», «какое настроение у посетителя»), `audio_awareness_queries` («спешит ли», «сомневается ли»). Perception-тулы в MVP не заводим — awareness-инжекция в контекст покрывает «глаза», Ren комментирует и подстраивает питч естественно. Без камеры разговор не ломается (мягкая деградация на стороне Tavus).

## 2. Тулы («руки») — Tavus Tools Registry

Объявляются через `POST /v2/tools` + attach `POST /v2/pals/{id}/tools` (**не** legacy `layers.llm.tools`). Все — `delivery: {app_message: true}`, `origin: "llm"`.

| Тул | Параметры | on_call / on_resolve | Эффект на странице |
|---|---|---|---|
| `show_card` | `{topic: "pricing"\|"spec"\|"languages"\|"bundle"}` | `silent` / `fire_and_forget` | Всплывает карточка в слоте у киоска; новая вытесняет старую (максимум 2 на сцене) |
| `open_lead_form` | `{}` | `silent` / `fire_and_forget` | Открывается форма (имя + почта + «что за место», опц.) |
| `dismiss_cards` | `{}` | `silent` / `fire_and_forget` | Все окна растворяются |

Сабмит формы возвращается Ren **не** через tool_result (форма асинхронная), а через `conversation.respond`: клиент шлёт «Form submitted: name=…, email=…» — Ren голосом подтверждает («записала, наберём»). После сабмита клиент показывает карточку-квитанцию «заявка принята».

Контракт клиента: на `conversation.tool_call` → исполнить эффект → отправить `conversation.tool_result` с тем же `tool_call_id` (`status: "success"`, output < 4 KB; для fire_and_forget-тулов результат Tavus не ждёт, но шлём для журнала событий).

## 3. Клиентский рантайм

Новый модуль `app/work/face2me/parts/reception.tsx` — единственная точка знания о Daily/Tavus на клиенте:

- **`ReceptionController`** (не-React ядро): `POST /api/reception` → `@daily-co/daily-js` call object (`audioSource: true`, `videoSource: true` — камера сразу), join, подписка на `app-message` и `track-started`/`left-meeting`/`error`.
- **Маршрутизация событий** (typed): `conversation.tool_call` → менеджер карточек; `conversation.utterance.streaming` → субтитры; `conversation.started_speaking`/`stopped_speaking` (`properties.role: "pal"|"user"`, принимать и legacy `"replica"`) → сцена (цвет/свет); `system.shutdown` → финал.
- **Мост в сцену**: `hero-scene.tsx` получает от контроллера видеоэлемент и слушает узкий интерфейс (`onSpeaking(bool)`, `onLive(bool)`, `onFarewell()`); связь — window-события по живой конвенции репо `vaflet:*` (прецеденты: `vaflet:singularity` в `Starfield.tsx`/`PageTransition.tsx`, `vaflet:hero-word`), новое имя `vaflet:f2m-reception` с typed detail.
- **Скролл-трансформации сцены** (z/yaw камеры, rotate второго акта) видеослою не мешают: видео — текстура на существующем меше экрана и просто следует за ним; отдельной синхронизации не нужно.
- **Кнопка звонка** появляется, когда walk-up дошёл до конца (progress ≈ 1), рядом с rotate/fullscreen. Fullscreen-звонок поддержан (кнопка уже есть).
- **Скролл во время live**: не блокируем; уход со сцены (ScrollTrigger leave) = hang up («ушёл от стойки»). Возврат — новая сессия.
- **Self-view**: маленькая виньетка «what she sees» с локальным видеотреком — честно показываем, что камера включена (и это демо реального киоска).

## 4. Видеослой — greenscreen → шейдер экрана

- Tavus отдаёт видео на зелёном фоне RGB **[0, 255, 155]**.
- `SCREEN_FRAG` в `hero-scene.tsx` расширяется: `uLiveTex` (видеотекстура OGL, `texture.image = videoEl`, обновление в существующем paint loop), `uLiveMix`, хромакей по green-dominance (`g - max(r, b)` + smoothstep + spill suppression — адаптация референс-шейдера Tavus `CVI-greenscreen-webGL`).
- Коннект 2–5 с — экран живёт халфтон-точками, затем точки растворяются в живое лицо (`uLiveMix` 0→1): cold start = часть шоу.
- Правило цвета: **цвет у лица только пока Ren говорит**, в молчании — grayscale (в шейдере; управляется `onSpeaking`).

## 5. Окна и субтитры — DOM-слой

`CardLayer` — **отдельный файл `parts/cards.tsx`** (та же файловая граница, что `reception.tsx` для рантайма и `hero-scene.tsx` для рендера), монтируется в `hero.tsx` поверх stage, там же, где margin notes. Эстетика пустоты: чёрный фон, тонкая белая рамка, display-шрифт; **не** неоморфизм (мир `data-f2m` начинается ниже). Слоты слева/справа от киоска; на мобиле — bottom-sheet. GSAP-появление в духе margin notes (смещение + растворение).

Мобильная вертикаль (карточки и субтитры оба претендуют на низ): bottom-sheet карточки ограничен `max-height: 45vh`; субтитры при открытом sheet сжимаются до одной строки и прижимаются к его верхней кромке (z-order: субтитры выше). Закрылся sheet — субтитры возвращаются вниз сцены.

Карточки: **The bill** (три тарифа, malachite скупо), **Spec**, **Languages** (EN/ES/RU), **Bundle** (железо+софт+установка, железо остаётся собственностью Face2me), **Lead form**, **квитанция «заявка принята»**. Контент — из уже утверждённого копирайта страницы, без новых заявлений.

Субтитры: низ сцены, крупный display-шрифт во всю ширину (правило шоукейса — разговор читается как страница), из `conversation.utterance.streaming` (`properties.speech`, `properties.role`); реплики посетителя приглушённые. Это же — базовая доступность звонка.

## 6. Сценография (фоновый слой)

Питается событиями, которые и так летят: пульс света экрана и отражения в полу на `started/stopped_speaking`; перебивание (`stopped_speaking` с `interrupted: true`) — частицы вздрагивают; `system.shutdown` (180 с или прощание) — лицо рассыпается обратно в точки, свет сужается. Reduced motion: сцена уже рендерит один кадр — звонок доступен, карточки без анимаций, субтитры работают.

## 7. Сервер

### `/api/reception` (v2)
- Пул аккаунтов: env `TAVUS_ACCOUNTS` = JSON-массив `[{key, personaId, replicaId}, …]` (обратная совместимость: если переменной нет — старые `TAVUS_API_KEY/PERSONA_ID/REPLICA_ID` как пул из одного).
- Перебор по порядку: не-2xx от `POST /v2/conversations` (минуты кончились, конкурентность занята) → следующий аккаунт; все мертвы → `503 desk-closed`.
- Turnstile: **реализация проверки — в скоупе этого спека** (env-флаг: `TURNSTILE_SECRET` задан → проверяем, на деве выключено); **включение на проде** — отдельное решение при выкате, вне скоупа.
- Ответ клиенту: `{url, id, seconds}` как сейчас.

### `/api/lead` (новый)
- `POST {name, email, note?, conversationId?}`, валидация; rate-limit по IP в памяти инстанса — **best-effort дедупликация, не защита** (в serverless-окружении память между инвокациями не живёт; реальный контроль — Turnstile при включении на проде).
- Доставка: **Telegram-бот** (env `TG_BOT_TOKEN`, `TG_CHAT_ID`; sendMessage основателям). Плюс `console.log` структурированной записи как минимальный дублирующий след. Resend — осознанно отложен (нужна верификация домена).
- Используется и без звонка: состояние «смена окончена» открывает ту же форму локально — **лид не теряется никогда**.

### `scripts/tavus-provision.mjs`
Идемпотентный скрипт (по имени персоны/тулов): для каждого аккаунта из пула — создаёт/обновляет персону Ren v2 (промпт, perception, layers), создаёт тулы в registry, attach к персоне, печатает готовый env-блок `TAVUS_ACCOUNTS`. Один скрипт = одинаковые Ren во всех аккаунтах. Запускается вручную при изменении промпта/тулов.

## 8. Состояния и отказы

| Состояние | Триггер | Что видит посетитель |
|---|---|---|
| walk-up | скролл | как сейчас |
| invite | progress ≈ 1 | кнопка звонка у киоска |
| connecting | клик, пермишены выданы | халфтон-точки собираются, «она услышала» |
| live | `track-started` (remote video) | живая Ren в экране, карточки, субтитры |
| over | `system.shutdown` / hang up / уход скроллом | рассыпание в точки, «Back to work», кнопка «ещё раз» |
| busy/closed | `/api/reception` 503 (все аккаунты) | «Смена окончена — оставьте записку» + локальная lead-форма |
| пермишен отклонён | getUserMedia fail | честная подсказка + та же lead-форма как выход |
| ошибка звонка | Daily `error` | как over + приглашение к форме |

## 9. Отладка и тестирование (минуты драгоценны)

- **Dev-хук `window.__ren`** (только `NODE_ENV=development`): эмиттер фейковых app-messages (tool_call, utterance.streaming, speaking, shutdown) — вся визуалка отлаживается без живых минут.
- `test_mode: true` у Tavus — бесплатная интеграционная проверка роута (разговор создаётся, PAL не джойнится).
- `npx tsc --noEmit` чисто; playwright-смок страницы: walk-up жив, кнопка появляется, фейковый прогон карточек/субтитров через `__ren`, мобила 390px без x-overflow.
- Один живой смок-звонок в конце: tool calls реально прилетают, хромакей чистый, форма доходит до Telegram.

## 10. Вне скоупа (осознанно)

- Perception-тулы (vision/audio triggers) — после MVP.
- Навигация агентом по странице (скролл к секциям) — отвергнуто: конфликт с запиненной сценой.
- Реальный календарный букинг (Calendly) — заменён на гибрид-форму решением пользователя.
- Бюджетный счётчик минут — **не существует и не пишется в этом спеке**. Контракт на будущее (одной строкой): durable-хранилище (KV/Upstash) с ключом `f2m:minutes:<месяц>`, инкремент на каждый созданный разговор, `/api/reception` отдаёт 503 при превышении месячного лимита. До тех пор бюджет держат капы Tavus (180 с/сессия, free-лимит аккаунтов) и ротация пула.
- Включение Turnstile на проде (реализация проверки — в скоупе, см. раздел 7).
- Карточка Ren в `components/Founders.tsx` — отдельная задача из старого плана, не трогаем здесь.

## Справка: точные факты Tavus API (из ресёрча 2026-08-05)

- Терминология 2026: persona→PAL, replica→face; legacy-эндпоинты и поля работают как алиасы.
- Tool call клиенту: app-message `{message_type: "conversation", event_type: "conversation.tool_call", properties: {name, arguments /* JSON-строка */, tool_call_id}}`.
- Ответ: `conversation.tool_result` `{tool_call_id, output, status: "success"|"error"}`; app-messages ограничены **4 KB** (превышение тихо дропается).
- Речь: `conversation.utterance` / `conversation.utterance.streaming` (`properties.speech`, `properties.role: "user"|"pal"` + legacy `"replica"`).
- Говорение: `conversation.started_speaking`/`stopped_speaking` (`role`; у stopped — `duration`, `interrupted`). Событие `replica_interrupted` удалено.
- Клиент→агент: `conversation.respond {text}`, `conversation.echo`, `conversation.interrupt`, `conversation.append_llm_context`/`overwrite_llm_context {context}`.
- Системные: `system.pal_joined` (legacy `system.replica_joined`), `system.shutdown` (`shutdown_reason`).
- `POST /v2/conversations`: `conversational_context` и `audio_only` — верхний уровень; `apply_greenscreen`, `max_call_duration`, `participant_*_timeout`, `language`, `enable_closed_captions` — внутри `properties`; `test_mode: true` — PAL не джойнится.
- Greenscreen: RGB [0,255,155]; кеинг на клиенте (референс: `github.com/andy-tavus/CVI-greenscreen-webGL`).
- Free-тир (по дашборду пользователя): **20 CVI-минут/мес, 1 одновременная сессия**; Starter $59 — 100 мин, 3 сессии, overage $0.37/мин.
