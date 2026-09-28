import { car } from './car';
import { city } from './city';
import { post } from './post';
import { servicePage } from './service';
import { homePage, siteSettings } from './settings';
import { faqItem, hero, richText, seo, titledText } from './shared';

export const schemaTypes = [seo, hero, faqItem, titledText, richText, car, siteSettings, homePage, city, servicePage, post];

/** Documents that exist exactly once; the Studio desk opens them directly. */
export const singletons = ['siteSettings', 'homePage'];
