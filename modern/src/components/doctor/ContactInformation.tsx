import {doctor} from '@/content/data/doctor';
import {Icon} from '@/components/ui/Icon';
import {PageIntro} from '@/components/layout/PageIntro';

const call = 'tel:' + doctor.telephone;

export function ContactInformation({page = false}: {page?: boolean}) {
  const description = 'برای اطلاع از زمان پذیرش و شیوهٔ نوبت‌گیری، پیش از مراجعه با مطب تماس بگیرید.';
  const callButton = <a className="button" href={call}><Icon name="phone"/> تماس با مطب <Icon name="arrow"/></a>;

  return (
    <section className="contact-section" id="contact" aria-labelledby={page ? undefined : 'contact-title'}>
      <div className="container contact-grid">
        {page
          ? <PageIntro title="قدم اول، یک تماس با ماست." description={description} label="تماس با مطب" path="/contact/">{callButton}</PageIntro>
          : <div className="contact-copy">
              <p className="eyebrow">ارتباط با مطب</p>
              <h2 className="section-title" id="contact-title">قدم اول،<br/> یک تماس با ماست.</h2>
              <p>{description}</p>
              {callButton}
            </div>}
        <div className="contact-details">
          <a className="contact-phone" href={call}>
            <span className="contact-icon"><Icon name="phone"/></span>
            <span><small>تلفن مطب</small><strong dir="ltr">{doctor.displayPhone}</strong></span>
            <span className="contact-call-label">تماس <Icon name="arrow"/></span>
          </a>
          <div className="contact-location">
            <div className="contact-address">
              <span className="contact-icon"><Icon name="pin"/></span>
              <div>
                <h3>نشانی ثبت‌شدهٔ مطب</h3>
                <p>{doctor.address}</p>
                <a className="text-link" href={doctor.mapSearch} target="_blank" rel="noopener noreferrer">
                  جست‌وجوی نشانی روی نقشه <Icon name="external"/>
                </a>
              </div>
            </div>
            <p className="clinic-hours">ساعات حضور: برای اطلاع از ساعات پذیرش روز، با مطب تماس بگیرید.</p>
            <a className="contact-social" href={doctor.profileUrl} target="_blank" rel="noopener noreferrer">
              پروفایل نظام پزشکی <Icon name="external"/>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
