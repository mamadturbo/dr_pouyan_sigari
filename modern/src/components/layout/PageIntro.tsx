import Link from 'next/link';
import type {ReactNode} from 'react';
import {JsonLd} from '@/components/ui/JsonLd';
import {absolute} from '@/lib/seo';

type PageIntroProps = {
  title: string;
  description: string;
  path: string;
  parent?: {href: string; title: string};
  label?: string;
  children?: ReactNode;
};

export function PageIntro({title, description, path, parent, label, children}: PageIntroProps) {
  const article = path.startsWith('/blog/') && path !== '/blog/';
  const ancestor = parent ?? (article ? {href: '/blog/', title: 'مقالات'} : undefined);
  const crumbs = [
    {name: 'خانه', path: '/'},
    ...(ancestor ? [{name: ancestor.title, path: ancestor.href}] : []),
    {name: label ?? title, path},
  ];

  return (
    <div className={'page-intro container' + (article ? ' page-intro-article' : '')}>
      <nav aria-label="مسیر صفحه" className="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 && <span aria-hidden="true"> / </span>}
            {index === crumbs.length - 1
              ? <span aria-current="page">{crumb.name}</span>
              : <Link prefetch={false} href={crumb.path}>{crumb.name}</Link>}
          </span>
        ))}
      </nav>
      <div className="intro-composition">
        <div>
          {label && <p className="eyebrow">{label}</p>}
          <h1>{title}</h1>
          <p className="intro-description">{description}</p>
          {children && <div className="intro-actions">{children}</div>}
        </div>
        {!article && <div className="intro-signature" aria-hidden="true">
          <span className="brand-mark">PS<span>✳</span></span>
          <span>دکتر پویان سیگاری</span>
          <span>جراحی دهان، فک و صورت</span>
        </div>}
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem', position: index + 1, name: crumb.name, item: absolute(crumb.path),
        })),
      }}/>
    </div>
  );
}
