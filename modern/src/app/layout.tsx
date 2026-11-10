import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { IconSprite } from '@/components/ui/Icon';
import './globals.css';
import '../styles/refinements.css';
import '../styles/portfolio.css';
import '../styles/hero.css';
import '../styles/experience-cards.css';
import '../styles/responsive.css';
import '../styles/information-architecture.css';
import '../styles/clinic-editorial.css';
import '../styles/clinic-motion.css';
import {PageMotion} from '@/components/animations/PageMotion';
const vazirmatn=localFont({src:'../styles/fonts/Vazirmatn.woff2',variable:'--font-vazirmatn',weight:'100 900',display:'swap'});
export const metadata:Metadata={title:{default:'دکتر پویان سیگاری',template:'%s | دکتر پویان سیگاری'},icons:{icon:'/assets/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#004d3e'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl" className={vazirmatn.variable}><body id="top"><a className="skip-link" href="#main">رفتن به محتوای اصلی</a><IconSprite/><SiteHeader/><div id="page-shell">{children}<SiteFooter/></div><PageMotion/></body></html>;}

