from pathlib import Path
import json,csv,re,hashlib,collections
R=Path(__file__).resolve().parent
ROOT=R.parent
DATE='2026-10-28'
STATUS=['تأییدشده','تأیید محدود','متعارض','یافت‌نشده','نیازمند تأیید پزشک']
sources=[]
def source(id,title,url,publisher,kind,evidence,published='',updated='',access='خوانده شد',notes=''):
    sources.append(dict(source_id=id,title=title,url=url,publisher=publisher,source_type=kind,published_at=published,updated_at=updated,accessed_at=DATE,access_status=access,evidence=evidence,evidence_type='بازگویی شاهد؛ نقل‌قول مستقیم نیست',notes=notes))
source('S01','پروفایل رسمی دکتر پویان سیگاری','https://membersearch.irimc.org/member/profile?id=32b39ef4-eeb5-4f3e-9849-ef582561c563','سازمان نظام پزشکی','رسمی','نام و شماره 130866؛ تخصص و بورد؛ مجوز اردبیل تا 1409/07/01؛ مطب سرچشمه، وکیل، شیخ‌الرئیس، طبقه دوم؛ تلفن محلی 33235000.',notes='در مرورگر و ابزار وب خوانده شد؛ Python خطای زنجیره گواهی داد. اطلاعات کرمان در جدول تماس نیز موجود است؛ تاریخ به‌روزرسانی تماس‌ها معلوم نیست.')
source('S02','نوبت‌دهی دکتر پویان سیگاری','https://realtimedentist.com/dentist/130866/','دندانپزشکان ایران','دایرکتوری','تخصص، اردبیل، شماره حرفه‌ای و تلفن با سایت منطبق است؛ شکستگی و دررفتگی فک فهرست شده.',notes='منبع رسمی پزشک نیست؛ استقلال از پی‌جو احراز نشد؛ هیچ نوبت واقعی رزرو یا آزموده نشد.')
source('S03','لیست دندانپزشکان اردبیل','https://payju.ir/node/23743','پی‌جو؛ فاطمه مهرابی','دایرکتوری','ردیف اول نام پزشک، نشانی ساختمان و تلفن 04533235000 را دارد.',updated='۱۴۰۰/۰۸/۱۱',notes='تاریخ قدیمی؛ با S02 یک تأیید مستقل اضافی فرض نشده است.')
source('S04','پروفایل دکتر پویان سیگاری','https://dental.e-teb.com/doctor/دکتر-پویان-سیگاری/','ای‌طب','دایرکتوری','معرفی به زبان اول شخص، بورد و ایمپلنت؛ برنامه ۹ تا ۱۶ با عبارت مخدوش روز هفته.',notes='مالکیت متن توسط پزشک احراز نشد؛ کلیدواژه‌های عمومی و نظرات اسپم قابل انتساب نیستند؛ ساعات قابل انتشار نیست.')
source('S05','معرفی جراحان بینی اردبیل','https://tabibnet.com/best-nose-surgeon-in-ardebil/','طبیب‌نت','تجاری','نام کاربری اینستاگرام و خدمات بینی/پلک و ادعای رتبه بورد آمده است.',notes='رتبه بورد، برتری و رضایت‌ها بدون مدرک؛ شاهد اولیه برای خدمت فعلی نیست.')
source('S06','برگزاری هفته دوم از اولین دوره جامع اندو استان اردبیل','https://igdanews.ir/14820/برگزاری-هفته-دوم-از-اولین-دوره-جامع-اند/','پایگاه خبری انجمن دندانپزشکان عمومی ایران','گزارش برگزارکننده','تدریس جراحی اندودانتیکس در ۲۱ اردیبهشت ۱۳۹۶؛ عنوان استادیار دانشکده دندانپزشکی اردبیل.',published='2017-05-14',notes='ابزار وب خطا داد، اما دریافت مستقیم HTTPS موفق بود؛ evidence/igda-2017.html؛ همایون سیگاری نویسنده/مسئول گزارش است و با پویان یکی نیست.')
source('S07','برنامه ضایعات پاتولوژیک 200941','https://t.me/s/IranianGDA?after=11272','انجمن دندانپزشکان عمومی ایران','اعلان برگزارکننده','۲۰ مرداد ۱۴۰۲: پویان سیگاری دبیر علمی و سخنران کیست‌ها و تومورهای ادنتوژنیک.',notes='پیوند دقیق پیام: https://t.me/IranianGDA/11292؛ اعلان اثبات حضور واقعی نیست.')
source('S08','برنامه جراحی پیچیده فک و صورت 219652','https://t.me/s/IranianGDA/11904','انجمن دندانپزشکان عمومی ایران','اعلان برگزارکننده','۱۲ مرداد ۱۴۰۳: سخنران اصول کلی ارتوگناتیک.',notes='این پیام مربوط به وبینار مرداد است، نه مسئولیت کنگره آذر؛ خطای تطبیق منبع در سایت.')
source('S09','گفتگو با دبیر مشاور علمی کنگره شانزدهم','https://t.me/s/IranianGDA?before=12091','انجمن دندانپزشکان عمومی ایران','اعلان و مصاحبه','معرفی دکتر سیگاری به‌عنوان دبیر مشاور علمی تخصصی جراحی دهان، فک و صورت کنگره ۶ تا ۹ آذر ۱۴۰۳.',notes='پیام مصاحبه https://t.me/IranianGDA/12066؛ فقط متن همراه خوانده شد؛ ویدئو تماشا نشد.')
source('S10','گزارش کارگاه عفونت‌های ادنتوژنیک','https://t.me/s/Ardcomdent/1169','کمیته تحقیقات دانشکده دندانپزشکی اردبیل','گزارش نهاد آموزشی','گزارش برگزاری کارگاه با تدریس پزشک در ۱۵ اردیبهشت ۱۴۰۴.',notes='گزارش دقیق در پیام https://t.me/Ardcomdent/1172؛ کانال خودمعرف دانشکده است و تأیید پیوند از دامنه دانشگاه یافت نشد.')
source('S11','معرفی سخنران کنگره هفدهم','https://t.me/s/IranianGDA?after=12897','انجمن دندانپزشکان عمومی ایران','اعلان برگزارکننده','نام پزشک در معرفی سخنرانان کنگره ۲۷ تا ۳۰ آبان ۱۴۰۴.',notes='پیام https://t.me/IranianGDA/12907؛ اعلان با حضور واقعی تفکیک شد.')
source('S12','اصول ارتوگناتیک و اصلاح لبخند، 257769','https://t.me/s/IranianGDA?before=13344','انجمن دندانپزشکان عمومی ایران','اعلان برگزارکننده','سخنرانی اصول جراحی و تجویز ارتوگناتیک برای ۳۰ مرداد ۱۴۰۵ اعلام شده.',notes='پیام https://t.me/IranianGDA/13331؛ برگزاری قطعی تأیید نشده.')
source('S13','Efficacy of closed reduction surgery on treatment of nasal bone fracture in admitted patients to Shahid Bahonar Hospital, Kerman, Iran','https://www.researchgate.net/publication/313440139_Efficacy_of_closed_reduction_surgery_on_treatment_of_nasal_bone_fracture_in_admitted_patients_to_Shahid_Bahonar_Hospital_Kerman_Iran','نسخه مقاله بارگذاری‌شده توسط Shiva Pouradeli در ResearchGate','نسخه مؤلف روی میزبان ثانویه','چهار نویسنده؛ سیگاری نفر سوم، استادیار جراحی در اردبیل؛ استناد چاپ‌شده 5(3):148-153.',published='2016 (Summer)',notes='بارگذاری 2017-02-08؛ تاریخ سپتامبر در سربرگ پلتفرم را تاریخ دقیق انتشار نمی‌گیریم. ناشر اصلی در پیگیری نهایی از مسیر آرشیو بازیابی شد [S31,S32].')
source('S14','رکورد DOAJ مقاله بینی','https://doaj.org/article/b7a113abbb42427fa2f16917bdda214d','DOAJ','نمایه','شاهد قابل خواندن دریافت نشد.',access='غیرقابل‌دسترسی: HTTP 403')
source('S15','Radiographic Evaluation of Bone Resorption Rate 1 Year After the Placement of Intra-lock Dental Implants','https://ajdr.umsha.ac.ir/Article/ajdr-306','Avicenna Journal of Dental Research؛ دانشگاه علوم پزشکی همدان','ناشر اصلی','سه نویسنده، سیگاری اول؛ نشریه 11(4):135-138؛ تاریخ انتشار 2019-12-30؛ وابستگی اردبیل.',published='2019-12-30')
source('S16','PDF مقاله ایمپلنت','https://ajdr.umsha.ac.ir/PDF/ajdr-306.pdf','Avicenna Journal of Dental Research','متن ناشر','وابستگی جراحی اردبیل و انجام ایمپلنت‌ها در مطب سیگاری ذکر شده؛ نویسنده مسئول وحید خلیلی است.',published='2019-12-30',notes='با وب خوانده شد؛ Python خطای SSL؛ آمار نتیجه مطالعه معیار تضمین فردی نیست.')
source('S17','Crossref: 10.34172/ajdr.2019.27','https://api.crossref.org/works/10.34172/ajdr.2019.27','Crossref؛ داده سپرده‌شده ناشر','فراداده','DOI، ترتیب نویسندگان، تاریخ و صفحات با ناشر همخوان.',notes='ایجاد رکورد 2020-10-29، با تاریخ انتشار فرق دارد؛ ORCID ثبت‌شده متعلق به وحید خلیلی است.')
source('S18','Investigating the Factors Related to the Success of Forced Eruption Treatment of Impacted Maxillary Canine Teeth','https://jurnal.unimus.ac.id/index.php/IJD/article/view/19835','Indonesian Journal of Dentistry؛ Universitas Muhammadiyah Semarang','ناشر اصلی','هفت نویسنده؛ سیگاری آخر و مسئول؛ وابستگی دانشگاه علوم پزشکی اردبیل.',published='2026-02-28')
source('S19','PDF مقاله دندان نیش','https://jurnal.unimus.ac.id/index.php/IJD/article/download/19835/pdf','Indonesian Journal of Dentistry','متن ناشر','صفحات 85-97 و تاریخ 28/02/2026؛ ارجاع نمونه صفحه اول عنوان بی‌ربط آناناس دارد.',published='2026-02-28',notes='مجوز CC BY-SA 4.0؛ صفحه اول استخراج و تصویری بازبینی شد؛ ایمیل مکاتبه پژوهشی با تماس مطب یکسان فرض نشد.')
source('S20','Crossref: 10.26714/ijd.v6i1.19835','https://api.crossref.org/works/10.26714/ijd.v6i1.19835','Crossref؛ داده ناشر','فراداده','تاریخ 2026-02-28؛ page فقط 85؛ فهرست هفت نویسنده.',notes='ایجاد رکورد 2026-06-25 تاریخ انتشار نیست؛ صفحات کامل از PDF ترجیح داده شد.')
source('S21','Effect of Different Energy Levels of Microwave on Disinfection of Dental Stone Casts','https://pmc.ncbi.nlm.nih.gov/articles/PMC3779372/','PMC/NLM؛ متن مقاله دانشگاه علوم پزشکی تبریز','متن کامل آرشیوشده','Pooyan Sigari، نفر پنجم، دستیار جراحی دهان و فک و صورت در کرمان؛ 2013;7(3):140-146.',published='2013-08-30',notes='همخوانی رشته و کرمان شواهد انتساب را تقویت می‌کند؛ فاقد شناسه حرفه‌ای مشترک و همکار مشترک با سه مقاله دیگر؛ تأیید محدود.')
source('S22','PubMed PMID 24082984','https://pubmed.ncbi.nlm.nih.gov/24082984/','NLM/PubMed','نمایه','رکورد همان مقاله ۲۰۱۳ و DOI 10.5681/joddd.2013.022.',published='2013-08-30',access='صفحه وب 429؛ XML رسمی EFetch خوانده شد',notes='evidence/pubmed-2013.xml؛ استنباط وابستگی فرد از PMC است، نه وابستگی نویسنده اول در PubMed.')
source('S23','همکاری بازسازی مندیبل','https://www.linkedin.com/posts/farinroshaan_craniofacialreconstruction-maxillofacialsurgery-activity-7327321866543538178-ZE-s','Farin Roshaan Co. در LinkedIn','اعلام شرکت همکار','شرکت از همکاری با Pouyan Sigari برای ایمپلنت اختصاصی مندیبل خبر می‌دهد.',notes='تاریخ نمایش نسبی 1y Edited است؛ تاریخ دقیق تعیین نشد؛ تأیید مستقل یا رضایت بازنشر تصاویر بیمار یافت نشد.')
source('S24','پروفایل اینستاگرام معرفی‌شده','https://www.instagram.com/dr.pouyansigari/','Instagram','شبکه اجتماعی','دریافت صفحه موفق نشد.',access='غیرقابل‌دسترسی با ابزار وب',notes='انتساب فقط از S05 و سایت؛ مالکیت و احراز رسمی بودن ثابت نشد.')
source('S25','PubMed User Guide','https://pubmed.ncbi.nlm.nih.gov/help/','NLM','راهنمای رسمی','جستجو با عنوان، نویسنده و نشریه و دسترسی به متن کامل توضیح داده شده.',updated='2026-09-30')
source('S26','Dentoalveolar Surgeries','https://myoms.org/what-we-do/extractions-and-dentoalveolar-surgery/dentoalveolar-surgeries/','AAOMS','آموزش عمومی پزشکی','همراه داشتن فهرست داروها و پیروی از دستور اختصاصی جراح برای آمادگی توصیه شده.',notes='صرفاً منبع آموزش عمومی؛ اثبات خدمات سیگاری نیست؛ متن پیشنهادی نیازمند بازبینی پزشک.')
source('S27','ORCID name search','https://pub.orcid.org/v3.0/search/?q=given-names:Pouyan%20AND%20family-name:Sigari','ORCID','جستجوی نام','پاسخ num-found=0 برای این عبارت دقیق.',notes='نبود نتیجه این پرس‌وجو اثبات نداشتن ORCID نیست؛ evidence/orcid-search.json')
source('S28','PubMed author search Sigari P','https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Sigari%20P%5BAuthor%5D&retmode=json','NLM','جستجوی نمایه','یک نتیجه، PMID 24082984.',notes='برای سه عنوان سایت PMID احراز نشد؛ نبود نتیجه مساوی بی‌اعتباری مقاله نیست.')
source('S29','deep-research SKILL.md','https://github.com/bytedance/deer-flow/blob/main/skills/public/deep-research/SKILL.md','ByteDance/deer-flow','روش تحقیق','اکتشاف، تعمیق، تنوع منابع و اعتبارسنجی، سپس تلفیق.',notes='منبع اصلی خوانده و با installer نصب شد؛ آخرین commit مربوط به مسیر در زمان بررسی 7de94394d4295182701ffb47e938e7c39b963091؛ فایل نصب‌شده در ~/.codex/skills/deep-research؛ برای نوبت بعد در فهرست مهارت‌ها در دسترس است.')
source('S30','جدول برنامه علمی کنگره هفدهم','https://igda.ir/2025/09/28/جدول-برنامه-علمی-کنگره-هفدهم/','انجمن دندانپزشکان عمومی ایران','صفحه برگزارکننده','صفحه و پیوندهای PDF برنامه دریافت شدند.',published='2025-09-28',notes='evidence/igda-17-program.html؛ نام پزشک از S11 احراز شده؛ هر هفت PDF در بازبینی پایان دریافت و متن آنها بررسی شد؛ دو مورد مرتبط در S34,S35 ثبت و تصویری تأیید شدند. گزارش دریافت در evidence/igda-17-pdf-check.json و هش/جستجوی نرمال در evidence/igda-17-pdf-normalized-check.json است.')
source('S31','صفحه اصلی مقاله شکستگی بینی','https://johoe.kmu.ac.ir/article_84849.html','Journal of Oral Health and Oral Epidemiology؛ دانشگاه علوم پزشکی کرمان','ناشر اصلی','چهار نویسنده به‌ترتیب؛ سیگاری سوم و استادیار جراحی اردبیل؛ 2016;5(3):148-153.',published='2016',notes='با پیمایش آرشیو شماره سوم و مرورگر بازیابی شد؛ History صفحه Receive 2016-08-30، Revise 2026-09-08 و Accept 2019-03-12 دارد که با PDF نمی‌خواند؛ روز دقیق نشر تعیین نشد.')
source('S32','PDF اصلی مقاله شکستگی بینی','https://johoe.kmu.ac.ir/article_84849_a69334eb2833436632141fed5619955e.pdf','Journal of Oral Health and Oral Epidemiology','متن ناشر','متن شش‌صفحه‌ای، تابستان 2016، جلد5 شماره3 صفحات148-153؛ سیگاری نویسنده سوم با وابستگی اردبیل؛ مسئول مکاتبه جواد فاریابی.',published='2016 (Summer)',notes='دریافت 2015-08-15 و پذیرش 2016-05-24 در PDF؛ اینها تاریخ انتشار نیستند. URL PDF فعلی با لینک قدیمی آرشیو فرق دارد؛ DOI در صفحه/PDF یافت نشد.')
source('S33','intralock by vahid khalili','https://prezi.com/p/dym_anh1swto/intralock/','حساب عمومی vahid khalili در Prezi؛ مالکیت احراز نشده','سرنخ رسانه','نتیجه جستجو ارائه مرتبط با مقاله ایمپلنت را معرفی کرد؛ متن ارائه در بازکردن صفحه بازیابی نشد.',access='فقط پوسته عمومی صفحه خوانده شد؛ متن ارائه در دسترس نشد',notes='تاریخ June 26 2020 فقط در نتیجه جستجو بود و به عنوان تاریخ تأییدشده ثبت نمی‌شود؛ شاهد تازه انتساب یا سابقه محسوب نشد؛ مجوز بازنشر نامعلوم.')
source('S34','برنامه سالن فردوسی کنگره هفدهم','https://igda.ir/wp-content/uploads/2025/11/Ferdosi-f.pdf','انجمن دندانپزشکان عمومی ایران','برنامه رسمی برگزارکننده','صفحه2: نام پزشک در پنل جراحی دندانپزشکی ایمن، چهارشنبه1404/08/28 ساعت16-17:30، سالن فردوسی.',notes='PDF مستقیم دریافت، متن با NFKC خوانده و صفحه2 تصویری کنترل شد؛ عنوان‌ها مشترک پنل‌اند و موضوع اختصاصی هر سخنران تفکیک نشده؛ برنامه اثبات حضور نیست.')
source('S35','برنامه سالن مولوی کنگره هفدهم','https://igda.ir/wp-content/uploads/2025/11/Molavi-f.pdf','انجمن دندانپزشکان عمومی ایران','برنامه رسمی برگزارکننده','صفحه4: معرفی پویان سیگاری برای کامپلیکیشن‌های مرتبط با جراحی ایمپلنت و سینوس ماگزیلاری، جمعه1404/08/30، پنل11-13، سالن مولوی.',notes='PDF مستقیم دریافت، متن نرمال و صفحه4 تصویری کنترل شد؛ زمان کل پنل است نه زمان دقیق سخنرانی؛ حضور واقعی احراز نشد.')
source('S36','نمایه pouyan_sigari در ClubhouseDB','https://clubhousedb.com/user/pouyan_sigari','ClubhouseDB؛ آینه غیررسمی و غیر وابسته به Clubhouse','سرنخ شبکه اجتماعی','نام و عنوان Oral and Maxillofacial Surgeon؛ نام کاربری pouyan_sigari؛ فهرست عضویت از جمله گروه پزشکان اردبیل.',updated='2023-09-01',notes='صفحه خوانده شد؛ شماره حرفه‌ای یا پیوند رسمی مشترک ندارد و مالکیت احراز نشده؛ عضویت گروه نه مدرک سمت/خدمت/حضور؛ آمار دنبال‌کننده برای سایت استخراج یا پیشنهاد نشد.')
source('L01','سورس و اسناد محلی پروژه',str(ROOT),'پروژه محلی','ممیزی محلی','داده‌ها، پنج مسیر، دو MDX، اسکیمای Person و backlog بررسی شدند.',notes='ادعاهای محلی شاهد مستقل هویت نیستند؛ baseline هش فایل‌ها در evidence ذخیره شد.')
with (R/'sources.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(sources[0]));w.writeheader();w.writerows(sources)

findings=[];coverage=[]
def add(field,value,sids,status,page,section,current,gap,priority='P1',confidence='medium',notes=''):
    fid=f'F{len(findings)+1:03}'
    findings.append(dict(id=fid,claim=field,value=value,source_ids=sids,confidence=confidence,verification_status=status,relevant_page=page,notes=notes or gap))
    coverage.append(dict(id=fid,page=page,section=section,field=field,current=current,value=value,status=status,source_ids=sids,gap=gap,priority=priority))
add('name.fa','دکتر پویان سیگاری',['S01'],'تأییدشده','همه','هویت','دکتر پویان سیگاری','',confidence='high')
add('name.en','Pouyan Sigari',['S15','S18'],'تأییدشده','/about/','هویت','Pouyan Sigari','املای Pooyan در مقاله ۲۰۱۳ نیز آمده.',confidence='high')
add('specialty','متخصص جراحی دهان، فک و صورت',['S01'],'تأییدشده','همه','هویت','متخصص جراحی دهان، فک و صورت','',confidence='high')
add('license.number','130866',['S01'],'تأییدشده','/ و /about/','هویت','۱۳۰۸۶۶','',confidence='high')
add('license.board','تخصص بورد (دانشنامه) جراحی دهان، فک و صورت',['S01'],'تأییدشده','/about/','مدارک','در education درج نشده','رتبه برتر از این عنوان استنباط نمی‌شود.',confidence='high')
add('license.valid_city','اردبیل',['S01'],'تأییدشده','/contact/','پروانه','اردبیل','شهر کرمان در نتیجه جستجو با شهر مجاز پروانه اشتباه نشود.',confidence='high')
add('license.expiry_jalali','1409/07/01',['S01'],'تأییدشده','/about/','پروانه','ندارد','وضعیت مشاهده‌شده در روز دسترسی؛ تاریخ و دامنه تغییر می‌کنند.',confidence='high')
add('education.professional_degree','دکترای حرفه‌ای دندانپزشکی',['S01'],'تأییدشده','/about/','تحصیلات','education=[]','دانشگاه و تاریخ هنوز مشخص نیست.',confidence='high')
add('education.general_institution',None,[],'یافت‌نشده','/about/','تحصیلات','خالی','دانشنامه یا رزومه تاریخ‌دار پزشک لازم است.')
add('education.specialty_institution','کرمان؛ به‌عنوان محل دستیاری در مقاله ۲۰۱۳',['S21'],'تأیید محدود','/about/','تحصیلات','خالی','این وابستگی جای دانشگاه صادرکننده دانشنامه را نمی‌گیرد.')
add('education.graduation_dates',None,[],'یافت‌نشده','/about/','تحصیلات','خالی','سال ورود/پایان عمومی، تخصص و بورد پرسیده شود.')
add('education.board_rank',None,['S05'],'نیازمند تأیید پزشک','/about/','افتخارات','ندارد','ادعای رتبه برتر در سایت تجاری؛ گواهی و رتبه/سال لازم است.','P2')
add('education.fellowships_awards',None,[],'یافت‌نشده','/about/','افتخارات','ندارد','فلوشیپ، افتخار و عضویت حرفه‌ای مشخص احراز نشد.','P2')
add('academic.historical_2016_2017','معرفی به‌عنوان استادیار جراحی دهان، فک و صورت در اردبیل',['S06','S31','S32'],'تأییدشده','/about/ و /','سوابق','استادیار در منابع ۲۰۱۶ و ۱۳۹۶','فقط تاریخی؛ حکم امروز نیست.',confidence='high')
add('academic.current_rank',None,['S01','S18'],'یافت‌نشده','/about/','سمت فعلی','missing.appointments','وابستگی در مقاله ۲۰۲۶ مرتبه یا استخدام امروز را ثابت نمی‌کند.')
add('academic.affiliation_2026','گروه جراحی دهان، فک و صورت، دانشگاه علوم پزشکی اردبیل',['S18','S19'],'تأییدشده','/ و /about/','پژوهش','وابستگی دانشگاهی در مقاله ۲۰۲۶','صرفاً وابستگی اعلامی همان مقاله.',confidence='high')
add('hospital.current_appointments',None,['S01'],'نیازمند تأیید پزشک','/about/','بیمارستان','ندارد','ردیف دانشکده و بیمارستان باهنر کرمان تاریخ ندارد؛ نباید سمت فعلی نوشته شود.')
add('experience.2017','تدریس اصول جراحی اندودانتیکس، ۲۱ اردیبهشت ۱۳۹۶',['S06'],'تأییدشده','/about/ و /','خط زمانی','۱۳۹۶ دوره اندو','گزارش برگزاری خوانده شد.',confidence='high')
add('experience.2023','معرفی به‌عنوان دبیر علمی برنامه 200941؛ ۲۰ مرداد ۱۴۰۲',['S07'],'تأییدشده','/about/ و /','خط زمانی','۱۴۰۲ دبیری علمی','عنوان را معرفی/اعلان بنویسید؛ حضور قطعی مستند نیست.',confidence='high')
add('experience.2024_webinar','معرفی برای سخنرانی ارتوگناتیک، ۱۲ مرداد ۱۴۰۳',['S08'],'تأییدشده','/about/ و /','خط زمانی','همراه کنگره آمده','تفکیک از کنگره آذر ضروری است.',confidence='high')
add('experience.2024_congress','دبیر مشاور علمی تخصصی جراحی دهان، فک و صورت کنگره شانزدهم',['S09'],'تأییدشده','/about/ و /','خط زمانی','لینک 11904 برای مسئولیت','منبع مسئولیت به مصاحبه 12066 ارجاع داده شود.',confidence='high')
add('experience.2025_workshop','تدریس کارگاه عفونت‌های ادنتوژنیک، ۱۵ اردیبهشت ۱۴۰۴',['S10'],'تأیید محدود','/about/ و /','خط زمانی','۱۴۰۴ کارگاه','گزارش برگزاری موجود؛ رسمی بودن کانال با دامنه دانشگاه مستقلاً تأیید نشد.')
add('experience.2025_congress','معرفی به‌عنوان سخنران کنگره هفدهم، ۲۷ تا ۳۰ آبان ۱۴۰۴',['S11'],'تأییدشده','/about/','خط زمانی','۱۴۰۴ سخنران','اعلان با حضور/سخنرانی انجام‌شده فرق دارد.',confidence='high')
add('experience.2026_webinar','اعلان سخنرانی ارتوگناتیک برنامه 257769 برای ۳۰ مرداد ۱۴۰۵',['S12'],'تأییدشده','/about/','خط زمانی','ندارد','گزارش برگزاری مستقلی یافت نشد.','P2',confidence='high')
add('clinic.address','اردبیل، سرچشمه، کوچه وکیل، ساختمان شیخ‌الرئیس، طبقه دوم',['S01','S03'],'تأییدشده','/contact/ و /','تماس','همین نشانی با میدان سرچشمه','نشانی ثبت‌شده؛ فعالیت روز نیازمند هماهنگی است.',confidence='high')
add('clinic.phone','04533235000',['S01','S02'],'تأییدشده','/contact/ و /','تماس','۰۴۵ ۳۳۲۳ ۵۰۰۰','هشت رقم محلی در S01، پیش‌شماره در S02؛ تماس عملی انجام نشده.',confidence='high')
add('clinic.postcode','5613669742',['S01'],'تأییدشده','/contact/','تماس','ندارد','کدپستی عمومی محل کار؛ در متن کوتاه ضروری نیست.','P2',confidence='high')
add('clinic.hours',None,['S04'],'نیازمند تأیید پزشک','/contact/','ساعات','درج نشده','یک دایرکتوری برنامه ۹ تا ۱۶ و روز مخدوش دارد؛ تاریخ و تأیید مطب لازم است.')
add('clinic.appointment','تماس برای اطلاع از شیوه نوبت‌گیری',['S02'],'تأیید محدود','/contact/ و FAQ','نوبت','تماس با مطب','موتور آنلاین دایرکتوری دارای نوبت قابل تأیید مشاهده نشد؛ نوبت رزرو نشد.')
add('clinic.map_pin',None,['L01'],'نیازمند تأیید پزشک','/contact/','نقشه','Google Maps search URL','لینک فقط جستجوی متن نشانی است؛ Place ID و پین مستقل احراز نشد.')
add('clinic.instagram','https://www.instagram.com/dr.pouyansigari/',['S05','S24'],'تأیید محدود','/contact/ و SEO','شبکه اجتماعی','همین URL','حساب مستقیماً خوانده نشد؛ رسمی بودن نیازمند تأیید مالک است.')
add('clinic.insurance_fees_access',None,['S02'],'نیازمند تأیید پزشک','/contact/ و FAQ','مراجعه','ندارد','نبود بیمه ثبت‌شده به معنی عدم پذیرش بیمه نیست؛ تعرفه، دسترس‌پذیری و روزهای تعطیل پرسیده شود.','P2')
add('clinic.contact_email',None,['S19'],'نیازمند تأیید پزشک','/contact/','تماس','ندارد','ایمیل نویسنده مسئول عمومی است ولی برای تماس مطب تأیید نشده.','P2')
add('service.omfs','جراحی دهان، فک و صورت',['S01'],'تأییدشده','/expertise/ و /','خدمات','کارت اول','دامنه ثبت‌شده حرفه‌ای؛ فهرست عمل‌های فعلی جداگانه تأیید شود.',confidence='high')
add('service.fracture_dislocation','در دایرکتوری خدمات فک ثبت شده',['S02'],'تأیید محدود','/expertise/','خدمات','شکستگی و دررفتگی فک','مقاله بینی سند شکستگی فک نیست؛ تأیید مطب برای خدمت روز لازم است.')
add('service.implants','سابقه انجام ایمپلنت در مطب اردبیل در مطالعه ۲۰۱۹',['S16'],'تأییدشده','/expertise/','خدمات','ایمپلنت دندانی','سابقه مستند است؛ خدمات فعلی/برند فعلی/نتیجه فردی استنباط نشود.',confidence='high')
add('service.orthognathic','موضوع آموزش و معرفی حرفه‌ای در جراحی فک',['S08','S04','S12'],'تأیید محدود','/expertise/','خدمات','جراحی اصلاح ناهنجاری فک','تدریس معادل اثبات ارائه فعلی عمل نیست؛ تأیید دامنه درمان لازم است.')
add('service.rhinoplasty_blepharoplasty',None,['S05','S24'],'نیازمند تأیید پزشک','/expertise/','خدمات','جراحی زیبایی بینی و پلک','فقط منبع تجاری؛ مقاله شکستگی بینی گواهی رینوپلاستی/پلک نیست.')
add('service.custom_mandible','گزارش شرکت از همکاری بازسازی با ایمپلنت اختصاصی',['S23'],'تأیید محدود','/expertise/','خدمات','بازسازی فک با ایمپلنت اختصاصی','شاهد ذی‌نفع؛ مجوز بازنشر و خدمت فعلی احراز نشده.')
add('media.portfolio',None,['L01','S23'],'نیازمند تأیید پزشک','/ #journey','نمونه‌کار','اسلات خالی و وعده افزودن تصاویر','تصاویر بیمار با رضایت صریح و مجوز صاحب اثر؛ نمونه‌کار واقعی در سورس نیست.')
add('media.hero_story_rights',None,['L01'],'نیازمند تأیید پزشک','/ و /about/','رسانه','تصویر ChatGPT و ویدئوی پیوست','مالکیت/رضایت استفاده از چهره و فایل ویرایش‌شده مستند نیست.')
add('faq.documents','پیشنهاد عمومی همراه داشتن مدارک مرتبط و فهرست داروها',['S26'],'نیازمند تأیید پزشک','FAQ و وبلاگ','آمادگی','مدارک قبلی همراه باشد','پیش‌نویس عمومی؛ بازبینی پزشک و مدارک ویژه مطب لازم است.')
add('faq.followup','زمان پیگیری مطابق برنامه فردی درمان مشخص شود',['S26','L01'],'نیازمند تأیید پزشک','FAQ و وبلاگ','پیگیری','تماس و پیروی از دستور پزشک','مسیر تماس پیگیری و فوریت‌ها باید مطب تعیین کند.')
add('blog.consultation','پیش‌نویس تحریریه، بدون بازبینی پزشکی',['L01','S26'],'نیازمند تأیید پزشک','وبلاگ (بدون route)','first-consultation.mdx','2026-10-19، تحریریه؛ Instagram reference','مرجع اینستاگرام منبع پزشکی نیست؛ route فعلی یافت نشد.')
add('blog.research_guide','راهنمای جستجوی عنوان، نویسنده و نشریه',['S25'],'تأییدشده','وبلاگ (بدون route)','finding-research.mdx','2026-10-19، تحریریه','راهنمای رسمی خوانده شد؛ مقاله نویسندگی پزشک ندارد.','P2',confidence='high')
add('seo.titles_descriptions','پنج مسیر واقعی، عنوان و توضیح فارسی و OG/Twitter',['L01'],'تأییدشده','همه','متادیتا','pageMetadata؛ ۵ route','متن پیشنهادی در فایل مربوط؛ ادعای درمان/رتبه افزوده نشود.','P2',confidence='high')
add('seo.person_schema','Person با تلفن، نشانی و sameAs',['L01'],'تأییدشده','/ و /about/','JSON-LD','Person/WebSite/BreadcrumbList','sameAs اینستاگرام هنوز تأیید محدود؛ نام متغیر verifiedPublications تنها اعتبارسنجی قالب است.','P1',confidence='high')
add('seo.domain',None,['L01'],'نیازمند تأیید پزشک','همه','دامنه','missing.domain و SITE_URL','مالک پروژه باید دامنه HTTPS را اعلام کند؛ از ثبت میزبانی قدیمی استنتاج نشود.')
add('seo.indexing','بدون SITE_URL: noindex و robots مسدود و sitemap خالی',['L01'],'تأییدشده','همه','نمایه‌سازی','حفاظت پیش‌نمایش','اسناد تعداد ۶+۲ مسیر می‌گویند اما sitemap فعلی فقط ۵ صفحه دارد.','P2',confidence='high')

add('experience.2025_safe_dentistry_panel','درج نام در پنل جراحی دندانپزشکی ایمن؛ 1404/08/28 ساعت16-17:30، سالن فردوسی',['S30','S34'],'تأییدشده','/about/ و /','خط زمانی','صرفاً نام کنگره','برنامه رسمی، نه اثبات حضور؛ موضوع اختصاصی هر سخنران تفکیک نشده.',confidence='high')
add('experience.2025_implant_sinus_talk','معرفی برای سخنرانی کامپلیکیشن‌های مرتبط با جراحی ایمپلنت و سینوس ماگزیلاری؛ 1404/08/30 در پنل11-13 سالن مولوی',['S30','S35'],'تأییدشده','/about/ و /','خط زمانی','صرفاً نام کنگره','زمان کل پنل است؛ حضور قطعی و زمان اختصاصی سخنرانی احراز نشد.',confidence='high')
add('social.clubhouse_candidate','pouyan_sigari در آینه ClubhouseDB؛ انتساب مالکیت احراز نشده',['S36'],'تأیید محدود','/contact/','شبکه اجتماعی','در سایت نیست','نام/رشته و گروه اردبیل سازگار است، ولی سند اتصال به شماره130866 نیست؛ به‌عنوان حساب رسمی یا sameAs منتشر نشود.',notes='سرنخ تاریخی با به‌روزرسانی2023؛ اثبات فعالیت جاری یا خدمات نیست.')
pubs=[
dict(id='P2016',legacy_id='research-1',title='Efficacy of closed reduction surgery on treatment of nasal bone fracture in admitted patients to Shahid Bahonar Hospital, Kerman, Iran',authors=['Javad Faryabi','Ahmad Enhesari','Pouyan Sigari','Shiva Pouradeli'],journal='Journal of Oral Health and Oral Epidemiology',publication_date='2016',date_precision='year; issue Summer; exact date unresolved',volume='5',issue='3',pages='148-153',article_number=None,doi=None,pmid=None,publisher_url='https://johoe.kmu.ac.ir/article_84849.html',source_url='https://johoe.kmu.ac.ir/article_84849_a69334eb2833436632141fed5619955e.pdf',abstract_summary_fa='پژوهش به ارزیابی جااندازی بسته شکستگی بینی در ۳۶ بیمار و تطبیق تصویربرداری پیش و پس از درمان می‌پردازد.',attribution_status='تأییدشده',confidence='high',identity_evidence='نام کامل، تخصص و وابستگی اردبیل در صفحه و PDF ناشر؛ تطبیق با پروفایل حرفه‌ای و سوابق تاریخی.',sigari_author_position=3,corresponding_author='Javad Faryabi',source_ids=['S31','S32','S13'],notes=['History ناشر: دریافت 2016-08-30، بازنگری 2026-09-08 و پذیرش 2019-03-12؛ PDF: دریافت 2015-08-15 و پذیرش 2016-05-24. این تاریخ‌ها تاریخ انتشار نیستند و تعارض ثبت شد.','عنوان فعلی سایت کوتاه‌شده است.','ترتیب و صفحات از ناشر و PDF اصلی تأیید شد؛ ترتیب متفاوت ویرا ترجیح داده نشد.','روز 5 June در پانوشت و September در ResearchGate تاریخ دقیق قابل اتکا نیست.','DOI/PMID یافت‌نشده؛ DOAJ بسته بود اما ناشر و PDF در پیگیری نهایی خوانده شدند.','صفحات 148-153 در ناشر و PDF تأیید شد؛ 146-153 در استناد ثانویه نادرست ترجیح داده نشد.']),
dict(id='P2019',legacy_id='research-2',title='Radiographic Evaluation of Bone Resorption Rate 1 Year After the Placement of Intra-lock Dental Implants',authors=['Pouyan Sigari','Abbas Naghizadeh Baghi','Vahid Khalili'],journal='Avicenna Journal of Dental Research',publication_date='2019-12-30',date_precision='day',volume='11',issue='4',pages='135-138',article_number=None,doi='10.34172/ajdr.2019.27',pmid=None,publisher_url='https://ajdr.umsha.ac.ir/Article/ajdr-306',source_url='https://ajdr.umsha.ac.ir/PDF/ajdr-306.pdf',abstract_summary_fa='مطالعه گذشته‌نگر تصاویر رادیوگرافی برای بررسی تغییر استخوان پیرامون ایمپلنت‌های Intra-lock است؛ متن محل انجام درمان را مطب سیگاری در اردبیل معرفی می‌کند.',attribution_status='تأییدشده',confidence='high',identity_evidence='نویسنده اول با نام کامل، تخصص و دانشگاه اردبیل و اشاره مستقل متن به مطب اردبیل.',sigari_author_position=1,corresponding_author='Vahid Khalili',source_ids=['S15','S16','S17'],notes=['Crossref DOI را یک سال پس از تاریخ مقاله ثبت کرده؛ تاریخ ایجاد رکورد انتشار نیست.','ORCID وحید خلیلی به سیگاری منتسب نشود.','اعداد و محدوده سن بین چکیده و روش متن یکسان نیست؛ برای تبلیغ موفقیت شخصی استفاده نشود.']),
dict(id='P2026',legacy_id='research-3',title='Investigating the Factors Related to the Success of Forced Eruption Treatment of Impacted Maxillary Canine Teeth',authors=['Reza Namadkolahi','Mahdiye Maratebi','Sara Faraj Vajari','Parastoo Ghaderi','Niloofar Deravi','Sohrab Pourkhamaneh','Pouyan Sigari'],journal='Indonesian Journal of Dentistry',publication_date='2026-02-28',date_precision='day',volume='6',issue='1',pages='85-97',article_number=None,doi='10.26714/ijd.v6i1.19835',pmid=None,publisher_url='https://jurnal.unimus.ac.id/index.php/IJD/article/view/19835',source_url='https://jurnal.unimus.ac.id/index.php/IJD/article/download/19835/pdf',abstract_summary_fa='مطالعه پرونده ۵۲ بیمار با دندان نیش نهفته فک بالا، ارتباط ویژگی‌های نهفتگی با موفقیت درمان رویش اجباری را بررسی کرده است.',attribution_status='تأییدشده',confidence='high',identity_evidence='نام کامل، نویسنده مسئول، گروه جراحی دهان و فک و صورت دانشگاه علوم پزشکی اردبیل؛ همخوان با مقاله ۲۰۱۹.',sigari_author_position=7,corresponding_author='Pouyan Sigari',source_ids=['S18','S19','S20'],notes=['خطای عنوان در Citation صفحه اول: عنوان آناناس/موش چاپ شده؛ عنوان اصلی، DOI و مؤلفان در بالای صفحه و صفحه ناشر همخوان‌اند.','Crossref تنها صفحه آغاز 85 دارد؛ بازه کامل PDF 85-97 است.','تاریخ ایجاد DOI 2026-06-25 را با تاریخ انتشار 2026-02-28 مخلوط نکنید.']),
dict(id='P2013-candidate',legacy_id=None,title='Effect of Different Energy Levels of Microwave on Disinfection of Dental Stone Casts',authors=['Mahmood Robati Anaraki','Farzaneh Lotfipour','Elnaz Moslehifard','Ali Momtaheni','Pooyan Sigari'],journal='Journal of Dental Research, Dental Clinics, Dental Prospects',publication_date='2013-08-30',date_precision='electronic day; print Summer',volume='7',issue='3',pages='140-146',article_number=None,doi='10.5681/joddd.2013.022',pmid='24082984',publisher_url=None,source_url='https://pmc.ncbi.nlm.nih.gov/articles/PMC3779372/',abstract_summary_fa='مطالعه آزمایشگاهی به مقایسه روش‌های ضدعفونی نمونه‌های گچ دندانپزشکی با تابش مایکروویو و محلول شیمیایی پرداخته است.',attribution_status='تأیید محدود',confidence='medium',identity_evidence='املای Pooyan؛ دستیاری جراحی فک و صورت کرمان در ۲۰۱۳، با داده تاریخی محل کار کرمان همخوان؛ بدون شناسه یکتا یا همکار مشترک با سه مقاله سایت.',sigari_author_position=5,corresponding_author='Elnaz Moslehifard',source_ids=['S21','S22','S01'],notes=['نام مشابه به‌تنهایی کافی نیست؛ برای افزودن به سایت تأیید پزشک لازم است.','وابستگی تبریز در ابتدای PubMed متعلق به نویسنده اول است؛ وابستگی خود سیگاری از PMC خوانده شد.','DOI در متن و PubMed موجود ولی API Crossref تک‌رکورد 404 برگرداند؛ DOI حذف یا تکذیب نمی‌شود.'])]
for p in pubs:
    p['abstract_type']='خلاصه تألیفی فارسی از چکیده؛ نقل‌قول یا توصیه شخصی پزشک نیست'
    p['abstract_available']=True;p['accessed_at']=DATE
    p['field_status']={k:('یافت‌نشده' if p[k] is None else 'تأیید محدود' if p['id'] in ['P2013-candidate'] else 'تأییدشده') for k in ['title','authors','journal','publication_date','volume','issue','pages','article_number','doi','pmid','publisher_url']}
    p['field_status']['attribution']=p['attribution_status']
    p['field_status']['abstract_summary_fa']='نیازمند تأیید پزشک'
    for k in ['title','authors','journal','publication_date','volume','issue','pages','doi','pmid','publisher_url','attribution','abstract_summary_fa']:
        value=p.get(k,p['attribution_status'] if k=='attribution' else None)
        add(f"publications.{p['id']}.{k}",value,p['source_ids'],p['field_status'][k],'/publications/','کتاب‌شناسی',('عنوان کوتاه و سال؛ سایر فیلدها خالی' if p['legacy_id'] else 'در سایت نیست'),'؛ '.join(p['notes']) if k in ['attribution','publication_date','pages'] else ('یافت نشد؛ حدس زده نشود.' if value is None else 'مشخصات و توضیح در publications.json'),confidence=p['confidence'])
add('publications.P2016.editorial_history',{'publisher_history':{'received':'2016-08-30','revised':'2026-09-08','accepted':'2019-03-12'},'pdf_history':{'received':'2015-08-15','accepted':'2016-05-24'}},['S31','S32'],'متعارض','/publications/','کتاب‌شناسی','در سایت نیست','تاریخ‌های دریافت/پذیرش متعارض‌اند؛ برای نشر از سال شماره ۲۰۱۶ استفاده شود. روز دقیق نشر و علت اختلاف نیازمند پاسخ ناشر است.',confidence='high')
(R/'publications.json').write_text(json.dumps(pubs,ensure_ascii=False,indent=2),encoding='utf-8')
(R/'findings.json').write_text(json.dumps(findings,ensure_ascii=False,indent=2),encoding='utf-8')
(R/'coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')

def short(v):
    if v is None:return 'یافت نشد'
    if isinstance(v,list):return '؛ '.join(v)
    return str(v)
def table(rows):
    head='| شناسه | صفحه | بخش / فیلد | مقدار فعلی | نتیجه تحقیق | وضعیت | منابع | نقص باقی‌مانده | اولویت |\n|---|---|---|---|---|---|---|---|---|\n'
    for x in rows:
        vals=[x['id'],x['page'],x['section']+' / '+x['field'],x['current'],short(x['value']),x['status'],', '.join(x['source_ids']) or '—',x['gap'],x['priority']]
        head+='| '+' | '.join(v.replace('|','/').replace('\n',' ') for v in vals)+' |\n'
    return head
audit='''# ممیزی محتوا و جدول پوشش سایت

تاریخ دسترسی: ۲۰۲۶-۱۰-۲۸، منطقه زمانی تهران. این ممیزی سورس است و انتشار عمومی را احراز نمی‌کند.

## نسخه و ساختار واقعی

README ریشه هنوز راهنمای نسخه تک‌صفحه‌ای dist است؛ docs/content-management.md محل ویرایش را modern معرفی می‌کند. modern/README.md تغییرات ۲۸ اکتبر و package.json نسخه Next 16.4.2 / React 19.3.1 را ثبت کرده‌اند. next.config.mjs خروجی export و trailingSlash دارد. نسخه فعال توسعه modern است، نسخه legacy در dist و پیش‌نمایش تک‌فایلی باقی است. دامنه و انتشار فعال احراز نشد. AGENTS.md تنها در modern یافت و خوانده شد؛ قاعده آن مربوط به راهنمای نسخه Next هنگام تغییر کد است. کدی تغییر نکرد.

پنج مسیر واقعی از src/app: /، /about/، /expertise/، /publications/، /contact/. صفحه 404 و robots/sitemap نیز موجودند. FAQ در خانه و تماس است؛ تجربه در خانه و درباره؛ صفحه مستقل سوابق وجود ندارد. دو MDX در content/blog و registry موجودند، ولی در app مسیر blog و slug یا Article route نیست. توصیف README/docs/seo.md درباره شش صفحه و دو مقاله و Article schema با کد فعلی هماهنگ نیست. این موارد نقص فنی ثبت‌شده‌اند، نه درخواست تغییر کد.

خانه شامل Hero، پروفایل علمی/جراحی، سوابق، شش حوزه درمان، گالری نمونه‌کار خالی، سه مقاله پژوهشی، FAQ و تماس است. PatientJourney.tsx باقی مانده اما در صفحه خانه mount نشده؛ DoctorPortfolio جای آن را گرفته است. Header/Footer تکرار هویت و تماس دارند.

## داده و متادیتا

doctor.ts دارای ۱۰ فیلد؛ education.ts آرایه خالی؛ experience.ts چهار ردیف؛ expertise.ts شش کارت؛ faq.ts سه سؤال؛ publications.ts سه رکورد legacy-source با authors=[] و journal=null. نام متغیر verifiedPublications فقط parse شدن schema را نشان می‌دهد و معادل تحقیق منبع نیست. missing.ts شش دسته education، appointments، publications، clinicHours، clinicalReviewer و domain را ثبت می‌کند؛ همه در جدول زیر پوشش دارند.

pageMetadata عنوان، description، OG/Twitter و canonical وابسته به SITE_URL می‌سازد. personSchema نام، تخصص، نشانی، تلفن و sameAs اینستاگرام را مصرف می‌کند؛ اینستاگرام هنوز مستقل احراز نشده است. خانه Person/WebSite و درباره Person؛ PageIntro مسیرهای داخلی BreadcrumbList دارد. بدون دامنه noindex/nofollow، robots مسدود و sitemap خالی؛ با دامنه sitemap فعلی فقط پنج مسیر دارد. امتیاز، Review، جایزه، ساعات و مرتبه علمی جاری در JSON-LD نیست. متادیتای MDX مدرک نویسندگی یا بازبینی پزشک نیست.

## پرونده‌های بررسی‌شده

READMEهای ریشه/modern؛ docs/{content-management,seo,architecture,architecture-audit,migration-report,deployment}.md؛ modern/AGENTS.md؛ package.json و next.config.mjs؛ همه app/page.tsxها و layout، not-found، robots و sitemap؛ هفت فایل content/data؛ دو MDX؛ lib/{content,seo,schemas,publications}.ts و types/content.ts؛ Hero، DoctorStory، Portfolio، PatientJourney، FAQ، ContactInformation، Timeline، Header/Footer، PageIntro و کارت مقاله. نسخه dist/content.js و dist/index.html نیز برای تفاوت منابع مرور شد. assetهای فعال در modern/public/assets فهرست شدند. خروجی build و screenshotهای design-review منبع هویت محسوب نمی‌شوند.

## تعریف وضعیت و پوشش

تأییدشده: شاهد مستقیم کافی برای صورت‌بندی محدود همان ادعا؛ تأیید محدود: شاهد مرتبط با محدودیت انتساب/استقلال/تازگی؛ متعارض: شواهد معتبر ناسازگار بدون حل؛ یافت‌نشده: جستجو نتیجه معتبر نداد؛ نیازمند تأیید پزشک: تأیید مالک، جزئیات جاری یا بازبینی لازم است. confidence میزان اطمینان پژوهشی است، نه احتمال آماری.

«تعیین‌تکلیف» با «آماده انتشار» یکسان نیست. یک منبع رسمی می‌تواند برای ثبت تخصص کافی باشد، ولی اعلان رویداد فقط معرفی سخنران را ثابت می‌کند. منابع یک مقاله در ناشر/Crossref/PubMed استقلال محتوایی ندارند.

## جدول نیازها و نتیجه نهایی

'''+table(coverage)
(R/'site-content-audit.md').write_text(audit,encoding='utf-8')

identity='''# احراز هویت و تفکیک نام‌ها

مبنای قطعی: [پروفایل رسمی نظام پزشکی](https://membersearch.irimc.org/member/profile?id=32b39ef4-eeb5-4f3e-9849-ef582561c563) [S01]. جستجوی شماره 130866 در فرم رسمی یک نتیجه با نام پویان سیگاری داد و لینک پروفایل از همان نتیجه دنبال شد. مدارک دندانپزشکی و تخصص ثبت شده‌اند. سرنخ تاریخی ClubhouseDB با نام و رشته سازگار ولی فاقد اتصال رسمی است و مالکیت حساب تأیید نشد [S36]. وضعیت مشاهده‌شده در روز دسترسی است؛ شماره عضویت را با شماره مستقل پروانه یا مدرک فراغت از تحصیل یکی نمی‌گیریم.

املای فارسی با ی/ک فارسی و عربی، و Pouyan / Pooyan / P. Sigari جستجو شد. Pouyan در دو ناشر مرتبط با اردبیل ثبت شده است [S15,S18]. Pooyan در مقاله ۲۰۱۳ آمده و با رشته جراحی و محل دستیاری کرمان همخوان است [S21]. املای P تنها برای انتساب کافی نیست.

## زنجیره انتساب

| مورد | پیوند هویتی | تصمیم |
|---|---|---|
| مقاله ۲۰۱۶ | نام کامل، استادیار جراحی اردبیل، ترتیب و صفحات در صفحه و PDF ناشر | تأییدشده؛ تاریخ دقیق انتشار نامعلوم [S31,S32] |
| مقاله ۲۰۱۹ | نام، رشته، دانشگاه اردبیل و مطب اردبیل در متن ناشر | تأییدشده [S15–S17] |
| مقاله ۲۰۲۶ | نام، جراحی اردبیل و نویسنده مسئول | تأییدشده؛ خطای ارجاع قالبی جدا ثبت شد [S18–S20] |
| مقاله ۲۰۱۳ | Pooyan، دستیار جراحی کرمان؛ سازگار با تماس تاریخی کرمان | تأیید محدود؛ پیش از افزودن از پزشک تأیید بگیرید [S21,S22] |
| اینستاگرام | لینک تجاری با نشانی و تلفن همخوان | تأیید محدود؛ مالکیت رسمی احراز نشد [S05,S24] |
| همکاری ایمپلنت اختصاصی | شرکت نام پزشک را همراه لینک پروفایل آورده | تأیید محدود؛ شاهد ذی‌نفع [S23] |

## نتایج کنارگذاشته‌شده

همایون سیگاری در گزارش دوره اندو و پیام‌های انجمن، شخص دیگری است؛ نام کوچک و نقش متفاوت دارد و هیچ مسئولیت شعبه یا هیئت‌مدیره از او به پویان منتقل نشد [S06,S07]. در جستجوی گسترده Crossref نتایج Mohamad-Hoseyn Sigari در بینایی ماشین، Naseh Sigari در ریه، Cyrus Sigari در فناوری و Dario Sigari در باستان‌شناسی ظاهر شدند؛ نام کوچک/رشته متفاوت است و حذف شدند. ORCID 0000-0003-4788-3296 در مقاله ۲۰۱۹ متعلق به Vahid Khalili است [S17]. نتایج وب درباره پویان اصغری یا کاربرد عمومی کلمه سیگاری صرفاً تطبیق واژه‌اند. فرد دوم با دقیقاً همین نام و تخصص شناسایی نشد؛ این جمله اثبات نبود فرد هم‌نام نیست.

## مرز استنباط

وابستگی مقاله نشان‌دهنده دانشگاه صادرکننده مدرک نیست. تخصص جراحی، مدرک ارائه همه عمل‌های آن رشته نیست. نقش علمی رویداد عضویت هیئت‌علمی فعلی را ثابت نمی‌کند. داده‌های کرمان در پروفایل رسمی فاقد تاریخ تماس‌اند؛ برای استخدام جاری یا معرفی محل عمل استفاده نشدند. دانشگاه اردبیل در متن ناشر به معنای «دانشگاه علوم پزشکی اردبیل» است؛ با دانشگاه محقق اردبیلی که وابستگی هم‌نویسنده است مخلوط نشود.
'''
(R/'identity-verification.md').write_text(identity,encoding='utf-8')

media=[]
def med(id,subject,url,date,owner,rights,status,notes):media.append(dict(media_id=id,subject=subject,source_url=url,date=date,owner=owner,reuse_permission=rights,verification_status=status,notes=notes))
for name in ['doctor-hero.webp','doctor-hero-small.webp','story-start.webp','story-end.webp','doctor-turn-flow.mp4']:
    med('M'+str(len(media)+1).zfill(2),'تصویر معرفی/روایت نمایشی پزشک',str(ROOT/'modern/public/assets'/name),'نامعلوم؛ فایل‌ها در پروژه موجود','تأمین‌کننده پروژه؛ صاحب حقوق قطعی نامعلوم','مدرک اجازه بازنشر بررسی‌شدنی در پروژه یافت نشد','نیازمند تأیید پزشک','README منشأ عکس ChatGPT و ویدئوی پیوست کاربر را بیان می‌کند؛ سند درمان یا اتاق عمل واقعی نیست.')
med('M06','عکس پروفایل رسمی',sources[0]['url'],'نامعلوم','صاحب عکس/سازمان نظام پزشکی؛ تعیین دقیق نشده','مجوز یافت نشد','نیازمند تأیید پزشک','وجود عمومی عکس اجازه دانلود/بازنشر نیست.')
med('M07','تصاویر سخنرانی اندو ۱۳۹۶',sources[5]['url'],'۱۳۹۶/۰۲/۲۱','عکاس/انجمن؛ تعیین دقیق نشده','مجوز عمومی بازنشر یافت نشد','نیازمند تأیید پزشک','صفحه دارای تصویر؛ برای استفاده فایل اصلی و اجازه صاحب اثر لازم است.')
med('M08','مصاحبه ویدئویی دبیر کنگره شانزدهم','https://t.me/IranianGDA/12066','۱۴۰۳؛ روز انتشار نامعلوم','انجمن/تولیدکننده ویدئو','نیازمند اجازه','نیازمند تأیید پزشک','متن همراه خوانده شد؛ ویدئوی 25:23 در پیش‌نمایش نیازمند تلگرام بود و تماشا نشد.')
med('M09','ویدئوی معرفی سخنران کنگره هفدهم','https://t.me/IranianGDA/12907','۱۴۰۴؛ روز انتشار نامعلوم','انجمن/تولیدکننده','نیازمند اجازه','نیازمند تأیید پزشک','پیش‌نمایش 0:34؛ محتوا تماشا نشد؛ نمونه درمان نیست.')
med('M10','تصویر/گزارش کارگاه عفونت','https://t.me/Ardcomdent/1172','۱۴۰۴/۰۲/۱۵ تاریخ رویداد','کمیته/عکاس','نیازمند اجازه','نیازمند تأیید پزشک','فقط صفحه و گزارش بررسی شد؛ هویت همه افراد تصویر بررسی نشده.')
med('M11','رسانه بازسازی مندیبل',sources[22]['url'],'تاریخ نسبی 1y Edited','Farin Roshaan/عکاس/دارنده پرونده','رضایت بیمار و اجازه صاحب اثر یافت نشد','نیازمند تأیید پزشک','برای نمونه‌کار یا ادعای نتیجه قابل بازنشر نیست؛ داده بیمار استخراج نشد.')
med('M12','اشکال مقاله ۲۰۱۹',sources[15]['url'],'2019-12-30','نویسندگان/نشریه','مجوز ناشر باید برای هر شکل کنترل شود','تأیید محدود','رسانه پژوهشی، نه نمونه‌کار تبلیغاتی؛ فعلاً فقط لینک.')
med('M13','اشکال مقاله ۲۰۲۶',sources[18]['url'],'2026-02-28','نویسندگان/نشریه','CC BY-SA 4.0 در PDF؛ انتساب و اشتراک همانند و حقوق اشخاص/منابع ثالث باید رعایت شود','تأیید محدود','مجوز مقاله معادل رضایت تبلیغاتی بیمار نیست؛ سایت تغییری نکرد.')
med('M14','اشکال مقاله شکستگی بینی ۲۰۱۶','https://johoe.kmu.ac.ir/article_84849_a69334eb2833436632141fed5619955e.pdf','2016 (Summer)','نویسندگان/نشریه و اشخاص موضوع تصویر','اجازه مشخص بازنشر تبلیغاتی یافت نشد','نیازمند تأیید پزشک','PDF ناشر خوانده شد؛ تصاویر پژوهشی را نمونه‌کار شخصی پزشک یا رضایت بیمار برای تبلیغ تلقی نکنید.')
med('M15','سرنخ ارائه intralock در Prezi','https://prezi.com/p/dym_anh1swto/intralock/','نامعلوم؛ تاریخ نتیجه جستجو تأیید نشده','حساب vahid khalili؛ مالکیت احراز نشده','نامعلوم؛ اجازه بازنشر یافت نشد','یافت‌نشده','فقط پوسته صفحه باز شد؛ محتوای ارائه خوانده نشد و سند سابقه جدید محسوب نشد [S33].')
med('M16','تصویر پروفایل نامزد Clubhouse','https://clubhousedb.com/user/pouyan_sigari','نامعلوم','دارنده حساب/صاحب عکس؛ انتساب قطعی احراز نشده','مجوز یافت نشد','نیازمند تأیید پزشک','فقط سرنخ تاریخی در آینه غیررسمی؛ برای معرفی رسمی و بازنشر مناسب نیست [S36].')
with (R/'media-inventory.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(media[0]));w.writeheader();w.writerows(media)

proposed='''# متن پیشنهادی فارسی برای سایت

این فایل پیش‌نویس تألیفی است؛ نقل‌قول مستقیم نیست. شناسه‌ها به sources.csv ارجاع دارند. بخش «قابل استفاده» بر پایه شواهد مشخص نوشته شده و بخش مشروط بدون پاسخ پزشک نباید منتشر شود. همه متن‌ها در پوشه تحقیق باقی مانده‌اند.

## خانه — معرفی قابل استفاده

دکتر پویان سیگاری، متخصص جراحی دهان، فک و صورت، شماره نظام پزشکی ۱۳۰۸۶۶. [S01]

برای شناخت سوابق آموزشی و پژوهش‌های دکتر سیگاری، بخش‌های درباره پزشک و پژوهش‌ها را ببینید. [S06,S15,S18]

شعار پیشنهادی تألیفی: «آشنایی روشن‌تر، گفت‌وگوی آگاهانه‌تر». این جمله پیشنهاد نگارشی است و آمار کیفیت یا نتیجه درمان نیست.

## درباره پزشک — مدارک و مسیر علمی

مدارک ثبت‌شده در نظام پزشکی شامل دکترای حرفه‌ای دندانپزشکی و تخصص جراحی دهان، فک و صورت است. مدرک مرتبط با پروانه، بورد (دانشنامه) این تخصص ثبت شده است. [S01]

در گزارش سال ۱۳۹۶ دوره اندو، عنوان استادیار دانشکده دندانپزشکی اردبیل برای ایشان آمده است. این سابقه تاریخی است. [S06]

در مقاله منتشرشده در سال ۲۰۲۶، وابستگی نویسنده به گروه جراحی دهان، فک و صورت دانشگاه علوم پزشکی اردبیل ذکر شده است. [S18,S19]

دانشگاه محل اخذ مدرک، تاریخ فراغت از تحصیل، مرتبه علمی امروز و مسئولیت‌های بیمارستانی فعلی تا دریافت سند از پزشک به متن اضافه نشوند.

## سوابق — ردیف‌های قابل استناد

| زمان | متن پیشنهادی | منبع |
|---|---|---|
| ۱۳۹۶/۰۲/۲۱ | تدریس اصول جراحی‌های اندودانتیکس در دوره جامع اندو اردبیل | S06 |
| ۱۴۰۲/۰۵/۲۰ | معرفی به‌عنوان دبیر علمی برنامه ضایعات پاتولوژیک دهان، فک و صورت | S07 |
| ۱۴۰۳/۰۵/۱۲ | معرفی برای سخنرانی اصول کلی جراحی ارتوگناتیک در برنامه 219652 | S08 |
| کنگره ۱۴۰۳/۰۹/۰۶–۰۹ | معرفی در نقش دبیر مشاور علمی تخصصی جراحی دهان، فک و صورت کنگره شانزدهم | S09 |
| ۱۴۰۴/۰۲/۱۵ | گزارش تدریس کارگاه عفونت‌های ادنتوژنیک در دانشکده دندانپزشکی اردبیل؛ انتشار مشروط به تأیید اصالت کانال | S10 |
| کنگره ۱۴۰۴/۰۸/۲۷–۳۰ | معرفی به‌عنوان سخنران کنگره هفدهم | S11 |
| ۱۴۰۴/۰۸/۲۸؛ پنل ۱۶–۱۷:۳۰ | درج نام در پنل جراحی «دندانپزشکی ایمن»، سالن فردوسی؛ موضوع اختصاصی سخنرانی تفکیک نشده | S34 |
| ۱۴۰۴/۰۸/۳۰؛ پنل ۱۱–۱۳ | معرفی برای سخنرانی «کامپلیکیشن‌های مرتبط با جراحی ایمپلنت و سینوس ماگزیلاری»، سالن مولوی | S35 |
| برنامه ۱۴۰۵/۰۵/۳۰ | معرفی برای سخنرانی اصول جراحی و تجویز ارتوگناتیک | S12 |

اعلان رویداد را با «برگزاری قطعی سخنرانی» جایگزین نکنید.

## حوزه‌های فعالیت — تفکیک سابقه از خدمات فعلی

متن قابل استفاده: «حوزه تخصص ثبت‌شده دکتر سیگاری جراحی دهان، فک و صورت است.» [S01]

متن سابقه پژوهشی: «مقاله سال ۲۰۱۹، سابقه انجام درمان ایمپلنت در مطب ایشان در اردبیل را توصیف می‌کند.» [S16]

شش کارت فعلی برای انتشار به‌عنوان خدمات روز باید جداگانه تأیید شوند: جراحی فک و صورت، شکستگی/دررفتگی فک، ایمپلنت، ارتوگناتیک، بینی/پلک، بازسازی با ایمپلنت اختصاصی. شواهد و درجه تأیید هر یک در جدول ممیزی آمده است. تا آن زمان از تبدیل عنوان سخنرانی یا موضوع مقاله به وعده ارائه خدمت خودداری شود. متن موقت تألیفی: «برای اطلاع از امکان بررسی مشکل خود و هماهنگی مراجعه، با مطب تماس بگیرید.»

## پژوهش‌ها — معرفی کوتاه

سه پژوهش فعلی و یک مقاله نامزدِ تازه‌یافته در publications.json آمده‌اند. انتساب هر سه مقالهٔ ۲۰۱۶، ۲۰۱۹ و ۲۰۲۶ از متن ناشران تطبیق داده شده؛ نامزد ۲۰۱۳ با تأیید محدود ثبت شده است. خلاصه‌ها تألیفی‌اند و به معنی توصیه بالینی نیستند.

'''
for p in pubs:
    proposed+=f"### {p['id']} — {p['title']}\n\n{'; '.join(p['authors'])}. {p['journal']}. {p['publication_date']};{p['volume']}({p['issue']}):{p['pages']}."+(f" DOI: {p['doi']}." if p['doi'] else ' DOI یافت نشد.')+f" [{', '.join(p['source_ids'])}]\n\n{p['abstract_summary_fa']} وضعیت انتساب: {p['attribution_status']}. خلاصه نیازمند بازبینی پزشک است.\n\n"
proposed+='''## تماس — متن آماده

نشانی ثبت‌شده مطب: اردبیل، سرچشمه، کوچه وکیل، ساختمان شیخ‌الرئیس، طبقه دوم. [S01]

تلفن درج‌شده: ۰۴۵۳۳۲۳۵۰۰۰. برای اطلاع از زمان پذیرش و شیوه نوبت‌گیری، پیش از مراجعه تماس بگیرید. [S01,S02]

ساعات پذیرش، بیمه و پین نقشه پس از تأیید مطب افزوده شوند. لینک Instagram تا تأیید مالک با عنوان «حساب رسمی» نمایش داده نشود. تلفن/نشانی کرمان به‌عنوان محل کار امروز وارد نشود.

## پرسش‌های متداول

**چگونه برای مراجعه هماهنگ کنم؟** با شماره درج‌شده مطب تماس بگیرید و زمان و مدارک لازم برای مراجعه را بپرسید. [S02؛ تأیید محدود فرایند]

**چه چیزهایی برای گفت‌وگو با جراح آماده کنم؟** پیش‌نویس عمومی، نیازمند بازبینی پزشک: فهرست داروهای مصرفی و پرسش‌های خود را آماده کنید. مدارک تصویربرداری قبلی مرتبط را هنگام هماهنگی با مطب مطرح کنید. [S26؛ بخش تصویربرداری پیشنهاد اجرایی تحریریه است]

**آیا باید دارو یا خوردن و آشامیدن را پیش از عمل تغییر دهم؟** پیش‌نویس عمومی، نیازمند بازبینی پزشک: دستور آمادگی به نوع اقدام وابسته است؛ دستور اختصاصی جراح را دریافت کنید. این وب‌سایت برنامه شخصی قطع دارو یا ناشتا ماندن تعیین نمی‌کند. [S26]

**پیگیری بعدی چگونه است؟** نیازمند تأیید پزشک: مسیر تماس و زمان مراجعه پیگیری را از تیم درمان دریافت کنید. زمان ثابت و شماره ویژه فوریت‌ها هنوز تأیید نشده است.

## وبلاگ — پیش‌نویس جایگزین دو مقاله موجود

### پیش از نخستین جلسه مشاوره

نویسنده: تحریریه وب‌سایت. وضعیت: نیازمند بازبینی پزشک؛ تاریخ انتشار و نام بازبین فقط پس از انجام واقعی درج شود.

برای هماهنگی مراجعه، با شماره مطب تماس بگیرید. [S02] فهرست داروها و پرسش‌های خود را آماده کنید و درباره دستورهای لازم پیش از هر اقدام از جراح توضیح بگیرید. [S26] درباره همراه داشتن تصویرها و پرونده قبلی، از مطب راهنمایی بخواهید. این بخش پیشنهاد اجرایی تحریریه است و دستور ویژه دکتر محسوب نمی‌شود.

### چگونه رکورد مقاله را پیدا کنیم؟

نویسنده: تحریریه وب‌سایت؛ راهنمای پژوهش، بدون ادعای تألیف پزشک.

عنوان انگلیسی مقاله را در PubMed جستجو کنید. نام خانوادگی و حروف اول نام نویسنده، نام نشریه و سال نیز برای محدود کردن نتیجه قابل استفاده‌اند. برای دسترسی به متن کامل، پیوندهای رکورد را بررسی کنید. [S25] یافتن یک نام یکسان به‌تنهایی انتساب اثر را ثابت نمی‌کند؛ وابستگی و ترتیب نویسندگان را نیز تطبیق دهید. این جمله آخر روش تحریریه برای این تحقیق است.

## SEO پیشنهادی

| مسیر | عنوان | توضیح پیشنهادی | پشتوانه |
|---|---|---|---|
| / | دکتر پویان سیگاری؛ جراحی دهان، فک و صورت | معرفی، سوابق آموزشی، پژوهش‌ها و اطلاعات مطب در اردبیل | S01,S06,S15,S18 |
| /about/ | درباره دکتر پویان سیگاری | مدارک ثبت‌شده و مسیر علمی به روایت منابع تاریخ‌دار | S01,S06 |
| /expertise/ | تخصص و زمینه‌های فعالیت | آشنایی با تخصص ثبت‌شده و سوابق مرتبط؛ جزئیات خدمات پس از تأیید پزشک | S01,S16 |
| /publications/ | پژوهش‌ها و مقالات | مشخصات و پیوند منابع پژوهشی همراه با وضعیت احراز انتساب | S13,S15,S18,S21 |
| /contact/ | تماس با مطب | نشانی ثبت‌شده مطب اردبیل و شماره تماس برای هماهنگی مراجعه | S01,S02 |

برای Person، name/jobTitle/telephone/address از داده تأییدشده استفاده شود؛ sameAs و تصویر تا تعیین مالکیت مشروط هستند. دامنه، canonical و URL عمومی را مالک پروژه باید تعیین کند. این متن پیشنهاد است و هیچ داده ساختاریافته یا سورسی تغییر نکرده است.
'''
(R/'proposed-site-content-fa.md').write_text(proposed,encoding='utf-8')

questions='''# کمبودها و پرسش‌های اولویت‌دار

## P0 — پیش از معرفی عمومی خدمات و رسانه

1. کدام‌یک از شش کارت خدمات همین حالا توسط شما ارائه می‌شوند؟ برای هر مورد نام اقدام، محل انجام، دامنه پذیرش و یک منبع قابل انتشار بدهید؛ به‌ویژه بینی، پلک، شکستگی/دررفتگی و بازسازی اختصاصی.
2. آیا مطب سرچشمه و تلفن ۰۴۵۳۳۲۳۵۰۰۰ همچنان فعال است؟ روزها/ساعات پذیرش، شیوه نوبت‌دهی و شماره مجاز تماس پیگیری کدام است؟ تماس پژوهشگر با مطب انجام نشده است.
3. آیا dr.pouyansigari حساب تحت مدیریت شماست و اجازه دارید آن را به سایت پیوند دهید؟ پین دقیق/Place ID مطب چیست؟
4. برای تصاویر چهره و ویدئوی فعلی، نام صاحب اثر و اجازه انتشار نسخه ویرایش‌شده چیست؟ برای نمونه‌کار بیمار، رضایت مشخص انتشار عمومی و اجازه صاحب فایل موجود است؟

## P1 — رزومه و پژوهش

5. دانشگاه و سال اخذ مدرک عمومی، تخصص و بورد را با رزومه یا دانشنامه تأیید کنید. مقاله ۲۰۱۳ فقط محل دستیاری کرمان را ذکر می‌کند؛ سال پایان از آن قابل استخراج نیست.
6. سمت دانشگاهی فعلی، نام دقیق گروه/دانشگاه و تاریخ حکم چیست؟ استادیاری ۱۳۹۶ و وابستگی مقاله ۲۰۲۶ به‌تنهایی پاسخ نیستند.
7. وابستگی کنونی بیمارستانی و وضعیت ردیف‌های قدیمی کرمان در نظام پزشکی چیست؟ نام بیمارستان محل جراحی امروز را فقط با تأیید مشخص درج می‌کنیم.
8. آیا مقاله PMID 24082984 با نام Pooyan Sigari متعلق به شماست؟ آیا DOI مقاله بینی ۲۰۱۶، توضیح تاریخ‌های ناسازگار History ناشر یا فهرست پژوهش‌های کامل/ORCID دارید؟ پیوند ناشر بازیابی شده است. ORCID وحید خلیلی به شما منتسب نشده است.
9. برای مقاله ۲۰۲۶، آیا ناشر خطای عنوان بخش Citation را اصلاح کرده یا اطلاعیه تصحیح دارد؟ دامنه صفحات PDF 85–97 است؛ Crossref فقط 85 ثبت کرده است.
10. کدام برنامه‌ها واقعاً با حضور/سخنرانی شما برگزار شده‌اند؟ برای اعلان‌های ۱۴۰۲، ۱۴۰۳، ۱۴۰۴ و ۱۴۰۵ در صورت امکان گواهی یا گزارش برگزاری معرفی کنید.
11. چه کسی دو متن وبلاگ و FAQ پزشکی را بازبینی می‌کند؟ نام، تاریخ و نسخه تأییدشده باید پس از بازبینی ثبت شود.

## P2 — تکمیل تجربه مراجعه و نشر

12. مدرک رتبه بورد، سال و جایگاه دقیق چیست؟ جایزه، فلوشیپ و عضویت علمی دیگری که مایل به انتشارید چه سندی دارد؟
13. بیمه‌ها، نحوه اعلام هزینه، شرایط دسترس‌پذیری ساختمان، آسانسور، تعطیلات و زبان‌های پاسخگویی چیست؟
14. دامنه HTTPS مورد تأیید مالک پروژه چیست؟ وبلاگ در کد فعلی route ندارد؛ درباره فعال‌سازی آن تصمیم جدا لازم است. مأموریت حاضر تغییر سایت نیست.
15. اجازه بازنشر عکس‌های انجمن، مصاحبه‌ها و رسانه شرکت همکار را چه کسی صادر می‌کند؟ مجوز مقاله، رضایت تبلیغاتی بیمار را جایگزین نمی‌کند.

«یافت نشد» اثبات نادرستی ادعا نیست. برای موارد ناپایدار، زمان تأیید و مسئول پاسخ نیز ثبت شود. پرسش‌ها فقط در این فایل آماده‌اند؛ هیچ پیام یا تماس بیرونی ارسال نشده است.
'''
(R/'missing-and-questions.md').write_text(questions,encoding='utf-8')

counts=collections.Counter(x['status'] for x in coverage)
report=f'''# گزارش تحقیق درباره دکتر پویان سیگاری

تاریخ پایان بررسی: {DATE}، تهران. دامنه: اطلاعات عمومی حرفه‌ای متناسب با نیاز سورس سایت. ادعای استخراج همه اطلاعات اینترنت مطرح نمی‌شود.

## نتیجه اصلی

پروفایل رسمی، هویت، تخصص، بورد، مجوز اردبیل و نشانی مطب را پشتیبانی می‌کند [S01]. پژوهش‌های ۲۰۱۹ و ۲۰۲۶ با تطبیق هویت در متن ناشر قابل انتساب‌اند [S15–S20]. مقاله بینی ۲۰۱۶ پس از پیگیری آرشیو، در صفحه و PDF ناشر خوانده و انتساب آن تأیید شد [S31,S32]. مقاله ۲۰۱۳ با املای Pooyan و دستیاری کرمان نامزد مرتبط تازه است، با تأیید محدود [S21,S22].

سوابق آموزشی تاریخ‌دار موجودند؛ رتبه و استخدام علمی امروز، تاریخ تحصیل، ساعات مطب و فهرست قطعی خدمات فعلی هنوز حل نشده‌اند. بازنشر رسانه و استفاده تبلیغاتی از داده بیمار به مجوز مشخص نیاز دارد. محتوای پیشنهادی در فایل جدا و بدون تغییر سایت ذخیره شد.

## تعارض‌ها و خطاهای قابل اقدام

| موضوع | شواهد | تصمیم |
|---|---|---|
| شهر کرمان در جستجوی رسمی در برابر مطب اردبیل | جدول جستجو شهر کرمان نشان داد؛ پروفایل مجوز اردبیل و هر دو ردیف تماس را دارد [S01] | تعارض ظاهری حل‌شده برای شهر مجوز؛ وضعیت فعالیت کرمان نامعلوم |
| منبع مسئولیت کنگره ۱۴۰۳ | لینک 11904 برای وبینار مرداد است [S08]؛ مصاحبه 12066 مسئولیت کنگره آذر را دارد [S09] | ردیف‌ها در پیشنهاد تفکیک شدند؛ کد سایت تغییر نکرد |
| عنوان ارجاع مقاله ۲۰۲۶ | Citation صفحه اول عنوان مقاله آناناس/موش دارد، ولی عنوان اصلی/DOI و فهرست ناشر درباره دندان نیش است [S18–S20] | خطای قالبی ناشر در این گزارش ثبت شد؛ عنوان اصلی حفظ؛ تصحیح رسمی یافت نشد |
| صفحه مقاله ۲۰۲۶ | Crossref:85، PDF:85–97 [S19,S20] | بازه PDF برای استناد؛ داده خام Crossref هم حفظ شد |
| تاریخ نشر مقاله ۲۰۲۶ | چاپ ۲۸ فوریه؛ ایجاد رکورد DOI در ۲۵ ژوئن [S19,S20] | تاریخ ایجاد DOI با انتشار مخلوط نشد |
| مشخصات مقاله ۲۰۱۶ | ناشر و PDF اصلی:148–153 و سیگاری نفر سوم؛ برخی منابع ثانویه متفاوت‌اند [S31,S32] | مشخصات اصلی تأیید شد |
| تاریخ‌های مقاله ۲۰۱۶ | History ناشر دریافت ۲۰۱۶، پذیرش ۲۰۱۹ و بازنگری ۲۰۲۶ دارد؛ PDF دریافت ۲۰۱۵ و پذیرش ۲۰۱۶ دارد [S31,S32] | سال انتشار ۲۰۱۶ از شماره/استناد حفظ شد؛ روز دقیق نشر نامعلوم و تاریخ‌های History استفاده نشدند |
| ادعای رتبه و عنوان علمی جاری | سایت تجاری از رتبه برتر/استادیاری امروز می‌گوید [S05] | بدون سند و تاریخ قابل انتشار نیست |
| ساعات مطب | ای‌طب برنامه بدون تاریخ و روز مخدوش دارد [S04] | ساعت قطعی ارائه نشد |
| صفحات وبلاگ و SEO | README صفحات و Article schema را توصیف می‌کند؛ کد فقط پنج route دارد [L01] | نیاز فنی جدا ثبت شد؛ محتوا آماده ولی منتشر نشده |

این اختلاف‌ها در سطح فیلد تعیین‌تکلیف شده‌اند؛ تاریخچه دریافت/پذیرش مقاله ۲۰۱۶ با وضعیت «متعارض» ثبت شده است. موردی به عنوان هویت متعارض حل‌نشده باقی نماند. «تأییدشده» برای متن رویداد یعنی اعلان/گزارش در منبع وجود دارد، نه اینکه هر حضور با سند مستقل اثبات شده باشد.

## روش و ردیابی

مطابق deep-research اصلی ByteDance: اکتشاف فارسی/انگلیسی، بررسی نیاز واقعی سورس، تعمیق هویت/دانشگاهی/مطب/مقاله/رسانه، دنبال کردن منبع اصلی، سپس تلفیق. نصب با Python پیش‌فرض به دلیل alias ویندوز شروع نشد؛ با Python بسته Codex موفق شد. فایل اصلی خوانده شد و skill نصب‌شده برای نوبت بعد در دسترس است [S29]. هیچ زیرعاملی به کار نرفت؛ مهارت نیازی به واگذاری نداشت.

جستجوهای نام با پویان سیگاری، پويان سيگاري، Pouyan Sigari، Pooyan Sigari، Sigari P؛ جستجوهای دامنه arums.ac.ir، irimc.org، ناشران، PubMed، Crossref و ORCID؛ جستجوهای بورد/تحصیلات/بیمارستان/ساعت/بینی/پلک/رویداد ۱۴۰۵ بررسی شدند. خلاصه موتور جستجو صرفاً سرنخ بود. برای S06 وقتی ابزار وب خطا داد، HTML مستقیم دریافت و متن مربوط خوانده شد. S01 از فرم واقعی و سپس لینک پروفایل رسمی احراز شد. PDF ۲۰۲۶ استخراج و صفحه اول تصویری کنترل شد.

## ثبت دورهای تحقیق و معیار توقف

| دور | پرسش‌ها/روش | نتیجه |
|---|---|---|
| ۱ | نام فارسی/انگلیسی، README، همه داده‌ها و missing.ts | نیازها، دایرکتوری‌ها، سه مقاله و سرنخ‌های انجمن |
| ۲ | فرم نظام پزشکی 130866، ناشر/DOAJ، برنامه‌های انجمن، تماس | پروفایل رسمی؛ مدارک و مجوز؛ تفکیک وبینار/کنگره |
| ۳ | Crossref/PubMed/ORCID، Pooyan، متن کامل و منابع همکار | مقاله نامزد ۲۰۱۳؛ متن ناشر ۲۰۱۹/۲۰۲۶؛ اعلان ۱۴۰۵؛ خطاهای فراداده |
| ۴ | رفع دسترسی S06، تأیید متن PDF، جستجوی تحصیل/سمت جاری و هفدهم | S06 مستقیم خوانده شد؛ دانشگاه فارغ‌التحصیلی و مرتبه امروز احراز نشد |
| پایانی قبلی ۱ | «پویان سیگاری» ساعات مطب؛ dr.pouyansigari جراحی؛ بورد فارغ؛ Pouyan Sigari ORCID | شاهد معتبر مؤثر تازه اضافه نشد؛ نتایج همان منابع یا نامرتبط |
| پایانی قبلی ۲ | نام و ۱۴۰۵؛ Pooyan و Kerman degree؛ پلک/ساعت؛ نام در arums.ac.ir | یافته مؤثر تازه اضافه نشد؛ بازگشت به مقاله ۲۰۱۳، کانال شناخته‌شده و نتایج نامرتبط |

پیگیری پس از ازسرگیری: آرشیو اصلی ناشر در مرورگر باز شد و مقاله ۲۰۱۶ و PDF آن تأیید شدند [S31,S32]؛ بنابراین دو دور پایانی قبلی به‌تنهایی معیار پایان نماندند. صفحه نویسنده همان ناشر فقط یک مقاله فهرست کرد (https://johoe.kmu.ac.ir/?_action=article&_au=Pouyan++Sigari&au=582962). نتایج خام دورهای پایانی در evidence/resumed-final-rounds.json ذخیره شده‌اند.

| دور نهایی | عبارت‌ها و روش | نتیجه |
|---|---|---|
| پایانی پس از پیگیری ۱ | Pouyan Sigari 84849 DOI؛ نام فارسی و دانشگاه/بورد؛ Ardabil professor hospital 2026؛ dr.pouyansigari ساعات | اطلاعات معتبر مؤثر تازه به نیازها اضافه نشد؛ ارائه Prezi فقط سرنخ جستجو بود و پس از بازکردن صفحه متن آن در دسترس نبود [S33] |
| پایانی پس از پیگیری ۲ | نام فارسی در arums.ac.ir؛ املای عربی و بیمارستان/ساعات؛ Pooyan Kerman ORCID؛ rhinoplasty/blepharoplasty/office hours | یافته معتبر مؤثر تازه اضافه نشد؛ نتایج نامرتبط یا بازگشت به منابع قبلی |

معیار توقف پس از بررسی و تعیین وضعیت تمام فیلدهای جدول و دو دور هدفمند متوالی بدون یافته مؤثر تازه اعمال شد. این توقف به معنی نبود اطلاعات دیگر یا تضمین کامل بودن نمایه‌های وب نیست. هفت PDF برنامه کنگره هفدهم از پیوندهای HTML دریافت شدند؛ پس از نرمال‌سازی حروف دو ردیف نام پزشک پیدا و صفحات مربوط تصویری کنترل شد [S34,S35]. این یافته‌ها دو دور جستجوی پایانی بعدی را لازم کردند؛ نتایج در evidence/post-program-final-rounds.json ثبت شده‌اند. دو دور هدفمند پس از برنامه نیز اطلاعات معتبر مؤثر تازه اضافه نکردند: دور۱ نام+کامپلیکیشن/سینوس/دندانپزشکی ایمن و congress2026؛ دور۲ تحصیلات، پذیرش۱۴۰۵ و ORCID/current. یک حساب نامزد در آینه غیررسمی Clubhouse پیدا و صفحه آن خوانده شد [S36]؛ به علت فقدان اتصال رسمی فقط سرنخ تاریخی ثبت شد و هیچ حساب رسمی، خدمت یا سابقه معتبر تازه از آن استنباط نشد.

## محدودیت‌ها

Prezi فقط پوسته صفحه را بازگرداند و متن ارائه از آن استخراج نشد [S33]. DOAJ به 403 رسید؛ صفحه ناشر مقاله بینی ابتدا خطا داد اما از پیمایش واقعی آرشیو در مرورگر، لینک درست article_84849.html و PDF بازیابی و خوانده شدند. خطای گواهی Python دور زده نشد. اینستاگرام خوانده نشد؛ LinkedIn پروفایل شخص به 999 رسید ولی متن شرکت همکار قابل خواندن بود. صفحه PubMed یک بار 429 داشت و XML رسمی دریافت شد. Crossref تک‌رکورد DOI ۲۰۱۳ 404 داد؛ DOI از PMC/PubMed حفظ شد. ORCID دقیق Pouyan نتیجه صفر داشت؛ این نبود ORCID را ثابت نمی‌کند. دسترسی دانشگاه/بیمارستان برای حکم فعلی نتیجه معتبر قابل انتساب نداد. تماس تلفنی، ورود به حساب‌ها، رزرو نوبت یا ارسال پیام انجام نشد. مستقل بودن دایرکتوری‌ها احراز نشده؛ آنها چند تأیید مستقل شمرده نشدند. بعضی تلگرام‌ها متن چند پیام را نشان می‌دهند؛ URL پیام دقیق در sources.csv آمده است. صدای ویدئوها پیاده‌سازی یا بازبینی نشد.

## پوشش کمی

{len(coverage)} فیلد شناسایی‌شده بررسی و دارای وضعیت شد (پوشش تعیین‌تکلیف ۱۰۰٪). این درصد نشان‌دهنده درصد حقایق تأییدشده یا آماده انتشار نیست. شمار وضعیت‌ها: '''+'؛ '.join(f'{s}: {counts[s]}' for s in STATUS)+f'''. {len(sources)} رکورد منبع/ممیزی و {len(media)} رکورد رسانه ثبت شد. سه مقاله موجود جداگانه و یک نامزد اضافی دارای مشخصات و وضعیت انتساب‌اند.

## جدول نهایی پوشش بخش‌ها

'''
groups=collections.defaultdict(list)
for x in coverage:groups[x['section']].append(x)
report+='| بخش | فیلدهای بررسی‌شده | تأییدشده | باقی‌مانده اصلی |\n|---|---:|---:|---|\n'
for k,v in groups.items():report+=f"| {k} | {len(v)} | {sum(x['status']=='تأییدشده' for x in v)} | "+'؛ '.join(dict.fromkeys(x['status'] for x in v if x['status']!='تأییدشده'))+" |\n"
report+='\nجدول تک‌تک فیلدها با مقدار فعلی، مقدار یافته‌شده، اولویت، منبع و نقص باقی‌مانده در site-content-audit.md و coverage.json قرار دارد. جزئیات هر ادعا در findings.json است.\n\n## فایل‌های تحویل\n\n'+ '\n'.join('- '+n for n in ['site-content-audit.md','identity-verification.md','sources.csv','findings.json','research-report-fa.md','proposed-site-content-fa.md','publications.json','media-inventory.csv','missing-and-questions.md'])+'\n\nپیوست‌های کمکی: coverage.json، evidence/، اسکریپت تولید و validation.json. فایل‌های اجرایی سایت در طول تحقیق تغییر نکردند؛ هش baseline در پایان تطبیق می‌شود.\n'
(R/'research-report-fa.md').write_text(report,encoding='utf-8')
print(json.dumps(dict(sources=len(sources),findings=len(findings),publications=len(pubs),media=len(media),statuses=counts),ensure_ascii=False))
