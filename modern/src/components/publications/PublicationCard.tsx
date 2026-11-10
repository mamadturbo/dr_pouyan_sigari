import type {Publication} from '@/types/content';
import {Icon} from '@/components/ui/Icon';

export function PublicationCard({item, compact = false}: {item: Publication; compact?: boolean}) {
  return (
    <article className="research-card">
      <div className="research-card-body">
        <div className="paper-heading">
          <span className="paper-icon"><Icon name={item.icon}/></span>
          <div>
            <span className="paper-tag">{item.category} / {item.year.toLocaleString('fa-IR', {useGrouping: false})}</span>
            <h3>{item.title}</h3>
          </div>
        </div>
        <span className="paper-english" lang="en" dir="ltr">{item.englishTitle}</span>
        {!compact && <>
          <p className="publication-authors" lang="en" dir="ltr">{item.authors.join('; ')}</p>
          <p className="publication-citation" lang="en" dir="ltr">
            {item.journal}. <time dateTime={item.publicationDate ?? String(item.year)}>{item.publicationDate ?? item.year}</time>
            {'; '}{item.volume}({item.issue}):{item.pages}.
          </p>
        </>}
        <div className="paper-actions">
          <a className="text-link" href={item.publicationUrl} target="_blank" rel="noopener noreferrer">
            مشاهدهٔ مقاله در ناشر <Icon name="external"/>
          </a>
          {!compact && item.doi && <a className="text-link" href={'https://doi.org/' + item.doi} lang="en" dir="ltr" target="_blank" rel="noopener noreferrer">DOI: {item.doi}</a>}
        </div>
      </div>
      <div className="paper-art" aria-hidden="true"><span className="art-year" dir="ltr">{item.year}</span></div>
    </article>
  );
}
