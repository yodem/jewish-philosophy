import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    cta: Schema.Attribute.Component<'elements.link', false>;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface BlocksInfoBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_info_blocks';
  info: {
    displayName: 'infoBlock';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    cta: Schema.Attribute.Component<'elements.link', false>;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    reversed: Schema.Attribute.Boolean;
  };
}

export interface BlocksSubscribe extends Struct.ComponentSchema {
  collectionName: 'components_blocks_subscribes';
  info: {
    displayName: 'subscribe';
  };
  attributes: {
    buttonText: Schema.Attribute.String;
    content: Schema.Attribute.Text;
    headline: Schema.Attribute.String;
    placeholder: Schema.Attribute.String;
  };
}

export interface BlocksYoutubeLink extends Struct.ComponentSchema {
  collectionName: 'components_blocks_youtube_links';
  info: {
    displayName: 'YoutubeLink';
  };
  attributes: {
    link: Schema.Attribute.String;
  };
}

export interface ElementsLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    nestedLinks: Schema.Attribute.Component<'elements.nested-link', true>;
    text: Schema.Attribute.String;
  };
}

export interface ElementsLogo extends Struct.ComponentSchema {
  collectionName: 'components_elements_logos';
  info: {
    displayName: 'Logo';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files'>;
    logoText: Schema.Attribute.String;
  };
}

export interface ElementsNestedLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_nested_links';
  info: {
    displayName: 'Nested Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface ElementsTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_elements_team_members';
  info: {
    description: 'A team member profile for the About page';
    displayName: 'Team Member';
  };
  attributes: {
    bio: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    position: Schema.Attribute.String;
    socialLinks: Schema.Attribute.Component<'elements.link', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
        },
        number
      >;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    copyright: Schema.Attribute.String;
    links: Schema.Attribute.Component<'elements.link', true>;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    cta: Schema.Attribute.Component<'elements.link', false>;
    logo: Schema.Attribute.Component<'elements.logo', false>;
    navigation: Schema.Attribute.Component<'elements.link', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.hero-section': BlocksHeroSection;
      'blocks.info-block': BlocksInfoBlock;
      'blocks.subscribe': BlocksSubscribe;
      'blocks.youtube-link': BlocksYoutubeLink;
      'elements.link': ElementsLink;
      'elements.logo': ElementsLogo;
      'elements.nested-link': ElementsNestedLink;
      'elements.team-member': ElementsTeamMember;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
    }
  }
}
