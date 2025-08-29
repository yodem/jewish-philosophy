import React, { ReactElement } from 'react';
import { Person, WithContext, Organization, WebSite, BreadcrumbList, Article, VideoObject, ImageObject, QAPage, CreativeWorkSeries, Book, ItemList } from 'schema-dts';

export type Schema = Person | WithContext<Organization> | WithContext<WebSite> | WithContext<BreadcrumbList> | WithContext<Article> | WithContext<VideoObject> | WithContext<ImageObject> | WithContext<QAPage> | WithContext<CreativeWorkSeries> | WithContext<Book> | WithContext<ItemList>;

export function JsonLd({ data }: { data: Schema }): ReactElement {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) }
  });
}
