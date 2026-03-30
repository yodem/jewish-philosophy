import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

interface OGImageConfig {
  title: string;
  subtitle?: string;
  description?: string;
  categories?: string[];
  fallbackText: string;
  fallbackBg: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  descriptionColor?: string;
}

export function createTextOGImage(config: OGImageConfig): React.ReactElement {
  const {
    title,
    subtitle,
    description,
    categories,
    background,
    primaryColor,
    secondaryColor,
    textColor,
    descriptionColor = secondaryColor,
  } = config;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        direction: 'rtl',
        fontFamily: 'system-ui, sans-serif',
        flexDirection: 'column',
        padding: 40,
        textAlign: 'center',
      }}
    >
      {subtitle && (
        <div style={{ fontSize: 14, color: primaryColor, marginBottom: 8 }}>
          {subtitle}
        </div>
      )}
      <div
        style={{
          fontSize: 42,
          fontWeight: 'bold',
          color: textColor,
          lineHeight: 1.2,
          marginBottom: description ? 16 : 0,
          maxWidth: '100%',
        }}
      >
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 20, color: descriptionColor, lineHeight: 1.4, marginBottom: 16 }}>
          {description}
        </div>
      )}
      {categories && categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((category) => (
            <span
              key={category}
              style={{
                fontSize: 14,
                padding: '6px 12px',
                background: secondaryColor,
                color: textColor,
                borderRadius: 6,
              }}
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function createFallback(text: string, background: string): React.ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color: 'white',
        fontSize: 32,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {text}
    </div>
  );
}

export async function generateOGImageResponse(element: React.ReactElement) {
  const rubikRegular = fetch(
    new URL('./Rubik-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const rubikBold = fetch(
    new URL('./Rubik-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const [regularFont, boldFont] = await Promise.all([rubikRegular, rubikBold]);

  return new ImageResponse(element, {
    ...OG_SIZE,
    fonts: [
      {
        name: 'Rubik',
        data: regularFont,
        style: 'normal',
        weight: 400,
      },
      {
        name: 'Rubik',
        data: boldFont,
        style: 'normal',
        weight: 700,
      },
    ],
  });
}
