import {faq} from '@/content/data/faq';
import {Icon} from '@/components/ui/Icon';

export function FAQ() {
  return (
    <div className="faq-list">
      {faq.map((item, index) => (
        <details className="faq-item" name="clinic-faq" key={item.question}>
          <summary>
            <span>{item.question}</span>
            <span className="faq-controls" aria-hidden="true">
              <span className="faq-index">{String(index + 1).padStart(2, '0').replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])}</span>
              <span className="faq-toggle"/>
            </span>
          </summary>
          <div className="faq-answer">{item.answer}</div>
        </details>
      ))}
      <p className="faq-hint"><Icon name="chat"/> برای مشاهدهٔ پاسخ، پرسش موردنظر را انتخاب کنید.</p>
    </div>
  );
}
