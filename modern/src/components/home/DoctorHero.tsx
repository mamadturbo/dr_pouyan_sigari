import { ArrowLeft, Images, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';
import { doctor } from '@/content/data/doctor';

export function DoctorHero() {
  return (
    <section className="hero-reference" id="introduction" aria-labelledby="hero-title">
      <svg className="hero-reference-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hero-portrait-curve" clipPathUnits="objectBoundingBox">
            <path d="M0 0H.9C.98 .28 1.01 .69 .84 1H0Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="hero-reference-visual">
        <div className="hero-reference-arc" aria-hidden="true" />
        <picture className="hero-reference-portrait">
          {/* Select an inline source before the browser preload scanner can fetch the portrait on phones. */}
          <source media="(max-width: 767px), (max-width: 1024px) and (max-height: 500px)" srcSet="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
          <source media="(width: 768px) and (min-height: 501px)" srcSet="/assets/doctor-hero-small.webp" />
          <img src="/assets/doctor-hero.webp" width="1400" height="933"
            alt="دکتر پویان سیگاری، متخصص جراحی دهان، فک و صورت" fetchPriority="high" />
        </picture>
      </div>
      <div className="hero-reference-leaves" aria-hidden="true" />
      <div className="hero-reference-copy">
        <p className="hero-reference-motto">دانش، دقت، تجربه</p>
        <h1 id="hero-title">دکتر پویان سیگاری</h1>
        <p className="hero-reference-specialty">متخصص جراحی دهان، فک و صورت</p>
        <p className="hero-reference-description">دارای بورد تخصصی<br />جراحی دهان، فک و صورت</p>
        <div className="hero-reference-actions">
          <Link prefetch={false} className="hero-reference-button hero-reference-button-primary" href="/gallery/">
            <Images aria-hidden="true" />مشاهده نمونه‌کارها
          </Link>
          <Link prefetch={false} className="hero-reference-button hero-reference-button-secondary" href="/expertise/">
            آشنایی با خدمات<ArrowLeft aria-hidden="true" />
          </Link>
        </div>
        <div className="hero-reference-meta">
          <span><MapPin aria-hidden="true" />اردبیل</span>
          <span><FileText aria-hidden="true" /><span>شمارهٔ نظام پزشکی {doctor.license}</span></span>
        </div>
      </div>
    </section>
  );
}
