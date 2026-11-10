const emptyPortrait = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

export function DoctorStory(){
  return (<section className="story-section section-space" id="about" aria-label="آشنایی با پزشک">
    <div className="story-scroll container">
      <div className="story-card">
        <div className="story-visual">
          <div className="orbit orbit-one" aria-hidden="true"></div><div className="orbit orbit-two" aria-hidden="true"></div><div className="orbit-line" aria-hidden="true"></div>
          <div className="frame-stage"><img className="story-poster" src={emptyPortrait} width="522" height="784" alt="تصویر نمایشی دکتر سیگاری با لباس رسمی" /><video id="doctor-sequence" width="522" height="784" muted playsInline preload="none" disablePictureInPicture aria-label="ویدئوی نمایشی چرخش دکتر سیگاری و تغییر از لباس رسمی به لباس جراحی"></video></div>
        </div>
        <div className="story-content">
          <div className="story-state story-academic">
            <p className="eyebrow">دکتر سیگاری <span className="slash">/</span> مسیر علمی</p>
            <h2 id="story-title">پشت هر تصمیم،<br /> دانش و تجربه<span className="accent-dot">.</span></h2>
            <p className="section-description">مسیر پزشکی با یادگیری آغاز می‌شود؛<br /> و با آموزش، پژوهش و تبادل تجربه ادامه می‌یابد.</p>
            <div className="story-facts"><p><span>سابقهٔ دانشگاهی</span>معرفی به‌عنوان استادیار بخش جراحی دهان، فک و صورت دانشگاه علوم پزشکی اردبیل در منابع ۲۰۱۶ و ۱۳۹۶.</p><p><span>فعالیت علمی و آموزشی</span>تدریس دوره‌های تخصصی و معرفی در مسئولیت‌های علمی کنگره‌های دندانپزشکی.</p></div>
            <a className="text-link" href="/about/#experience">بیشتر دربارهٔ مسیر علمی<svg className="icon"><use href="#i-arrow"/></svg></a>
          </div>
          <div className="story-state story-surgical" inert={true} aria-hidden="true">
            <p className="eyebrow">دکتر سیگاری <span className="slash">/</span> تخصص جراحی</p>
            <h2>از دانش،<br /> تا دقت در عمل<span className="accent-dot">.</span></h2>
            <p className="section-description">آشنایی با تخصص ثبت‌شدهٔ پزشک<br /> و سوابق پژوهشی و آموزشی مرتبط.</p>
            <div className="story-facts"><p><span>جراحی دهان، فک و صورت</span>تخصص و بورد (دانشنامه) جراحی دهان، فک و صورت در نظام پزشکی ثبت شده است.</p><p><span>اطلاعات مطب</span>برای اطلاع از زمان پذیرش و شیوهٔ مراجعه، با مطب تماس بگیرید.</p></div>
            <a className="text-link" href="/expertise/">آشنایی با تخصص<svg className="icon"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </div>
    </div>
    <div className="story-static container">
      <article aria-labelledby="academic-profile-title"><picture className="story-static-portrait"><source media="(min-width: 768px) and (min-height: 501px)" srcSet="/assets/story-start.webp" /><img src={emptyPortrait} alt="تصویر نمایشی دکتر سیگاری با لباس رسمی" width="522" height="784" loading="lazy" /></picture><div><p className="eyebrow">۰۱ / مسیر علمی</p><h2 id="academic-profile-title">پشت هر تصمیم، دانش و تجربه</h2><p>مسیر پزشکی با یادگیری آغاز می‌شود؛ و با آموزش، پژوهش و تبادل تجربه ادامه می‌یابد.</p><dl className="profile-facts"><div><dt>سابقهٔ دانشگاهی</dt><dd>معرفی به‌عنوان استادیار بخش جراحی دهان، فک و صورت دانشگاه علوم پزشکی اردبیل در منابع ۲۰۱۶ و ۱۳۹۶.</dd></div><div><dt>فعالیت علمی و آموزشی</dt><dd>تدریس دوره‌های تخصصی و معرفی در مسئولیت‌های علمی کنگره‌های دندانپزشکی.</dd></div></dl><a className="text-link" href="/about/#experience">مشاهدهٔ سوابق<svg className="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div></article>
      <article aria-labelledby="surgical-profile-title"><picture className="story-static-portrait"><source media="(min-width: 768px) and (min-height: 501px)" srcSet="/assets/story-end.webp" /><img src={emptyPortrait} alt="تصویر نمایشی دکتر سیگاری با لباس جراحی" width="522" height="784" loading="lazy" /></picture><div><p className="eyebrow">۰۲ / تخصص جراحی</p><h2 id="surgical-profile-title">از دانش، تا دقت در عمل</h2><p>آشنایی با تخصص ثبت‌شدهٔ پزشک و سوابق پژوهشی و آموزشی مرتبط.</p><dl className="profile-facts"><div><dt>جراحی دهان، فک و صورت</dt><dd>تخصص و بورد (دانشنامه) جراحی دهان، فک و صورت در نظام پزشکی ثبت شده است.</dd></div><div><dt>اطلاعات مطب</dt><dd>برای اطلاع از زمان پذیرش و شیوهٔ مراجعه، با مطب تماس بگیرید.</dd></div></dl><a className="text-link" href="/expertise/">تخصص و سوابق مرتبط<svg className="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div></article>
    </div>
  </section>);
}
