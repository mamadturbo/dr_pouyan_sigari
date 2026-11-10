import Link from 'next/link';
import {services} from '@/content/data/services';
import {Icon} from '@/components/ui/Icon';

const labels: Record<string, string> = {
  tooth: 'حوزهٔ تخصصی',
  implant: 'پژوهش علمی',
  profile: 'آموزش تخصصی',
};

export function ExpertiseGrid() {
  return (
    <div className="service-grid">
      {services.map((item, index) => (
        <article className={'service-card' + (index === 0 ? ' service-card-featured' : '')} key={item.slug}>
          <div className="service-card-top"><Icon name={item.icon}/></div>
          <div className="service-card-copy">
            <span className="service-kicker">{labels[item.icon]}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Link prefetch={false} className="text-link" href={'/expertise/' + item.slug + '/'} aria-label={'آشنایی با ' + item.title}>
              اطلاعات و مسیر مراجعه <Icon name="arrow"/>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
