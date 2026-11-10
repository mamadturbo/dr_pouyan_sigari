**تصمیم نهایی کاربر: Firefox نصب یا عیب‌یابی نمی‌شود و از اجرای پیش‌فرض حذف شده است. دستورهای تاریخی تشخیص Firefox در زیر صرفاً مرجع هستند؛ اجرا نکنید. مجموعهٔ فعال ۲۸ تست برای Chromium/WebKit دارد.**

# راهنمای محیط تست موبایل و ریسپانسیو

## تشخیص مدیریتی خطای Firefox (نیازمند تأیید کاربر)

تلاش عادی برای اجرای sxstrace با Access is denied متوقف شد. پس از تأیید، در PowerShell با Run as administrator دستور زیر را اجرا کنید. ابتدا مسیر موجود را انتخاب کنید:

```powershell
cd 'C:\Users\Megabyte-system\Desktop\dr sigari\dr-sigari-site\modern'
sxstrace.exe Trace -logfile:qa-artifacts/tooling-setup/firefox-admin.etl
```

در پنجرهٔ PowerShell دیگری تست Firefox را از modern اجرا کنید:

```powershell
pnpm exec playwright test --config tests/tooling/playwright.config.ts
```

سپس در پنجرهٔ trace، Enter را برای پایان ثبت بزنید و گزارش متنی را بسازید:

```powershell
sxstrace.exe Parse -logfile:qa-artifacts/tooling-setup/firefox-admin.etl -outfile:qa-artifacts/tooling-setup/firefox-admin.txt
```

این ابزار برای تشخیص assembly است؛ نصب runtime یا تغییر manifest راه‌حل اثبات‌شده‌ای نیست و در این مرحله انجام نمی‌شود.

این ابزارها برای ثبت شواهد و آزمایش آماده شده‌اند. هیچ مجوزی برای تغییر طراحی یا کد سایت از نصب آن‌ها نتیجه نمی‌شود.

## اجرا

همهٔ دستورها را از پوشهٔ `modern` اجرا کنید؛ بسته‌ها با pnpm مدیریت می‌شوند.

```powershell
cd 'C:\Users\Megabyte-system\Desktop\dr sigari\dr-sigari-site\modern'
pnpm test
pnpm exec tsc --noEmit --incremental false
pnpm exec playwright test --config tests/tooling/playwright.config.ts
pnpm exec playwright show-report qa-artifacts/tooling-setup/responsive-report
node tests/tooling/lighthouse.mjs
```

تست‌ها به خروجی موجود `out` متصل می‌شوند. برای آزمایش تغییرات بعدی، ابتدا خودتان `pnpm build` اجرا کنید. در این مأموریت خروجی سایت بازسازی نشد تا فایل‌های قبلی حفظ شوند. برای سرور دیگری متغیر `TOOLING_BASE_URL` را تنظیم کنید؛ در این حالت سرور خودکار اجرا نمی‌شود:

```powershell
$env:TOOLING_BASE_URL = 'http://127.0.0.1:3000'
pnpm exec playwright test --config tests/tooling/playwright.config.ts
Remove-Item Env:TOOLING_BASE_URL
node tests/tooling/lighthouse.mjs http://127.0.0.1:3000/
```

اجرای همهٔ تست‌ها گزارش قبلی همین مجموعه را جایگزین می‌کند. تست‌های قدیمی و تنظیمات `playwright.config.ts` اصلی حفظ شده‌اند:

```powershell
pnpm exec playwright test --project=desktop-chrome
pnpm exec playwright test --config tests/tooling/playwright.config.ts --project=engine-chromium --project=engine-webkit
pnpm exec playwright test --config tests/tooling/playwright.config.ts --project=390-portrait-reduce --headed
```

ماتریس ریسپانسیو از Chrome موجود و آزمایش موتور Chromium از headless shell پیش‌فرض Playwright استفاده می‌کند. اگر مرورگرها در دستگاه دیگری موجود نیستند:

```powershell
pnpm exec playwright install chromium firefox webkit
```

## پوشش تست و تفسیر نتیجه

۲۶ حالت برای صفحهٔ اصلی وجود دارد: عرض‌های 320، 360، 375، 390، 430، 768، 1024 و 1440؛ پنج حالت افقی گوشی؛ هرکدام با حرکت عادی و reduced motion. سه تست مستقل نیز راه‌اندازی موتور مرورگر، فارسی/RTL، کلیک، اسکرین‌شات و reduced motion را بررسی می‌کنند. Chromium همچنین CPU throttling، network throttling و Performance metrics را با CDP آزمایش می‌کند.

در هر حالت ریسپانسیو، پاسخ HTTP، وجود main، زبان فارسی، RTL و باز و بسته شدن منوی قابل‌نمایش بررسی می‌شوند. لمس برای viewportهای لمسی فعال است. اطلاعات زیر در `observations.json` و گزارش HTML ثبت می‌شوند:

- overflow افقی، اندازهٔ viewport، حالت اسکرول و reduced motion؛
- دکمه‌ها و لینک‌های کوچک‌تر از هدف طراحی 44×44، متن‌های پاراگراف کوچک‌تر از 16px؛
- وضعیت بارگیری تصاویر، وجود پروفایل‌ها و منبع و وضعیت ویدئو؛
- خطاهای console و JavaScript و یافته‌های axe برای WCAG 2 A/AA، 2.1 AA و 2.2 AA؛
- تصویر تمام صفحه برای بررسی چیدمان کارت‌ها، تصاویر و خوانایی فارسی.

یافته‌های ظاهری و axe در این مجموعه **شواهد ارزیابی** هستند و باعث شکست تست نصب نمی‌شوند. موفقیت این تست‌ها به معنی بی‌نقص بودن طراحی یا انطباق کامل WCAG نیست. تست WCAG موجود پروژه همچنان سخت‌گیرانه اجرا می‌شود. مقدار 44px هدف طراحی لمسی است و با حداقل قانونی همهٔ معیارهای WCAG یکسان نیست.

برای ممیزی صفحات دیگر، از تست‌های موجود مسیرها، فرم جست‌وجوی پژوهش‌ها، فیلترها، FAQ و ناوبری استفاده کنید. ارسال فرم واقعی، ارسال پیام یا درخواست نوبت در این مجموعه انجام نمی‌شود.

## بررسی دستی

در Chrome با F12، سپس Ctrl+Shift+M حالت دستگاه را باز کنید. عرض‌های بالا را وارد کنید و جهت را عوض کنید. در Network پروفایل محدودیت شبکه و در Performance محدودیت CPU را انتخاب کنید. در More tools → Rendering گزینهٔ prefers-reduced-motion را آزمایش کنید. برای WebKit در ویندوز محدودیت‌های سیستم و کدک وجود دارد؛ تست روی iPhone/iPad واقعی یا BrowserStack برای نتیجهٔ واقعی iOS لازم است.

چک‌لیست بررسی دستی: خوانایی و اتصال حروف فارسی، ترتیب RTL و متن ترکیبی، کارت‌ها و نسبت تصاویر، منو و focus با Tab/Escape، فرم و صفحه‌کلید موبایل، هدف لمس و فاصلهٔ دکمه‌ها، اسکرول افقی، چرخش، زوم ۲۰۰٪، reduced motion و رفتار انیمیشن‌ها. از NVDA یا دستگاه واقعی برای تست صفحه‌خوان استفاده کنید؛ axe جایگزین آن نیست.

## استفاده از Skillها

پروژه را در Codex از خود پوشهٔ `modern` باز کنید. Skillهای پروژه در `.agents/skills` قرار دارند؛ پوشهٔ والد فعلیِ این چت خارج از مخزن است و اسکن Skillها به زیرپوشه‌ها نزول نمی‌کند. در نوبت بعد فهرست `$` یا `/skills` را بررسی کنید؛ اگر نمایش داده نشد، Codex را دوباره باز کنید. مسیر و سازوکار رسمی: https://learn.chatgpt.com/docs/build-skills

```powershell
pnpm --package=npm dlx npx --yes skills list -a codex
```

- طراحی و پروتوتایپ موبایل: Figma وب؛ الگو و الهام: Mobbin؛ تولید پیش‌نویس UI: v0.
- پیاده‌سازی بعدی ریسپانسیو: `$responsive-design` و «Frontend Responsive Design Standards».
- ارزیابی موبایل: `$ux-mobile-responsiveness-audit`؛ دسترس‌پذیری: `$accessibility-compliance`؛ ارزیابی عمومی: `$web-design-guidelines`.
- عملکرد React/Next.js: `$vercel-react-best-practices`؛ تست مرورگر: `$webapp-testing` با چارچوب TypeScript موجود پروژه.
- `$frontend-design` و `$web-design-guidelines` از قبل در سطح کاربر موجودند؛ نصب مجدد و بازنویسی نشده‌اند.

محدوده‌ها: responsive-design برای تکنیک‌های fluid/container query و استانداردهای Frontend برای چک‌لیست پیاده‌سازی است. اختلاف «breakpoint محتوایی» با «breakpoint استاندارد» بر اساس breakpoint موجود پروژه و نیاز تأییدشده حل می‌شود. پیشنهاد رنگ/فونت/حرکت frontend-design بر هویت فعلی سایت اولویت ندارد. راهنمای webapp-testing از Python مثال می‌زند، اما محیط پروژه Node/TypeScript است؛ برای استفادهٔ فعلی نیازی به Python Playwright یا وابستگی تکراری نیست. helper با `shell=True` فقط برای دستور قابل‌اعتماد قابل‌استفاده است و مدیریت فرایندهای فرزند آن در ویندوز محدودیت دارد.

روند پیشنهادی: مرجع و پروتوتایپ در Figma/Mobbin → طرح تغییر با محدودیت‌های پروژه → پیاده‌سازی با Skill ریسپانسیو در مأموریت جداگانه → Playwright/axe و بررسی تصاویر → Lighthouse → دستگاه واقعی یا BrowserStack.

## محدودیت‌های ثبت‌شدهٔ پروژه

این موارد ثبت شده‌اند و در این مأموریت پیاده‌سازی یا اصلاح نشده‌اند:

- طراحی دسکتاپ و Full-page Snap Scrolling باید حفظ شوند.
- موبایل و تبلت باید اسکرول طبیعی داشته باشند.
- انیمیشن تبدیل کت‌وشلواری به پزشک در موبایل و تبلت اجرا نشود.
- هر دو کاراکتر و بخش‌های مربوط به آن‌ها حفظ شوند.
- هویت سبز و سفید، سبک مینیمال و تمام قابلیت‌های پروژه حفظ شوند.

## خدمات تحت وب

- Figma: https://www.figma.com/ — نسخهٔ وب برای طراحی و پروتوتایپ کافی است؛ دسکتاپ ویندوز/مک اختیاری است. https://www.figma.com/downloads/
- Mobbin: https://mobbin.com/ — مرور نمونه‌ها و جریان‌های موبایل؛ دسترسی کامل وابسته به حساب و طرح است. https://mobbin.com/pricing
- v0: https://v0.app/ — پس از ورود، نیاز UI را توصیف و نتیجه را مرور کنید؛ محدودیت اعتبار/طرح را در حساب بررسی کنید. https://v0.app/docs/quickstart
- BrowserStack: https://www.browserstack.com/ — در Live مرورگر و دستگاه را انتخاب و URL را آزمایش کنید؛ برای localhost به Local Testing نیاز است. https://www.browserstack.com/docs/live/get-started

هیچ حساب، پروژهٔ ابری، اشتراک یا اتصال جدیدی ساخته نشده و وضعیت ورود/طرح شخصی این سرویس‌ها بررسی نشده است.

## Responsively در ویندوز

اگر نصب خودکار به‌علت دانلود ناقص انجام نشد، دستور رسمی Winget زیر را در ویندوز اجرا کنید یا نصب‌کننده را از https://responsively.app/download دریافت کنید:

```powershell
winget install --id Responsively.ResponsivelyApp --exact --source winget --scope user
```

پس از نصب، `pnpm preview` را از modern اجرا کنید و در نوار آدرس Responsively نشانی `http://127.0.0.1:4175` را وارد کنید. در مدیریت دستگاه‌ها، یک مجموعه برای موبایل، تبلت و دسکتاپ بسازید: 320×900، 360×900، 375×900، 390×900، 430×900، 768×1024، 1024×900 و 1440×900. برای تست تبلت افقی 1024×768 و برای گوشی از Rotate استفاده کنید. همگام‌سازی کلیک و اسکرول را برای مقایسه فعال کنید؛ برای بررسی مستقل اسکرول snap دسکتاپ، همگام‌سازی اسکرول را موقتاً غیرفعال کنید. این مراحل تا زمانی که نصب برنامه کامل نشده باشد، روی دستگاه اعمال‌شده محسوب نمی‌شوند.

Node و pnpm شناسایی‌شده در محیط Codex قرار دارند. اگر در PowerShell بیرون از Codex فرمان pnpm پیدا نشد، از شیم موجود استفاده کنید؛ نصب سراسری جدید در این مأموریت انجام نشده است:

```powershell
& 'C:\Users\Megabyte-system\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' test
```


## آزمون نسخهٔ ریسپانسیو پیاده‌سازی‌شده

از پوشهٔ `modern` اجرا کنید:

```powershell
pnpm build
pnpm exec playwright test -c tests/tooling/playwright.config.ts
pnpm test
pnpm exec tsc --noEmit --incremental false
node tests/tooling/lighthouse.mjs
```

خروجی جدید در `qa-artifacts/responsive-implementation` ذخیره می‌شود؛ شواهد تاریخی `tooling-setup` حفظ شده‌اند. ماتریس جدید، Chrome و WebKit را در هشت عرض 320، 360، 375، 390، 430، 768، 1024 و 1440 و پنج حالت افقی گوشی، با هر دو تنظیم reduced-motion بررسی می‌کند. 52 حالت صفحهٔ اصلی، 16 آزمون مسیرها و تعاملات در حالت عمودی بدون reduced-motion و دو آزمون شروع موتور اجرا می‌شوند. 36 تکرار غیرضروری آزمون مسیرها عمداً skip هستند.

در گوشی، درخواست شبکهٔ `story-*` و `doctor-turn*` باید صفر باشد؛ poster واقعی در HTML اولیه نیست و picture حالت ثابت فقط در عرض حداقل 768 و ارتفاع حداقل 501 منبع دارد. تمام عرض‌های تا 1024 اسکرول طبیعی دارند. در گوشی افقی نیز تصاویر کاراکتر منبع شبکه ندارند. عکس اصلی معرفی پزشک بخشی از این حذف نیست.

axe صفحهٔ اصلی گوشی/تبلت و تمام مسیرهای داخلی باید بدون violation باشند. یافته‌های کنتراست قدیمی دسکتاپ فقط برای `.button-small` و `.experience-art-year` در ماتریس مجاز و در observations ثبت می‌شوند؛ سایر یافته‌ها آزمون را شکست می‌دهند. آزمون قدیمی WCAG همچنان آن یافته‌ها را خطا گزارش می‌کند تا پنهان نشوند.

Lighthouse را پس از پایان سایر تست‌ها اجرا کنید؛ اجرای هم‌زمان مرورگرها روی امتیاز عملکرد اثر می‌گذارد. مسیر خروجی را می‌توان با متغیر `LIGHTHOUSE_OUTPUT` تغییر داد. Firefox در مجموعهٔ فعال نیست.

اصلاح تکمیلی هیرو: آزمون شبکهٔ گوشی اکنون `doctor-hero*` را نیز کنترل می‌کند. عکس هیرو در گوشی عمودی و افقی نباید نمایش داده شود یا درخواست شبکه داشته باشد؛ عکس تبلت/دسکتاپ و صفحهٔ دربارهٔ پزشک حفظ است. برای اجرای ماتریس صفحهٔ اصلی به‌تنهایی از `--grep 'responsive layout'` استفاده کنید و برای حفظ شواهد قبلی، `--output=qa-artifacts/hero-no-photo/results` بدهید.
