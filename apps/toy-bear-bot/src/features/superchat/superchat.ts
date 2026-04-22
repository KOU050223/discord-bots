import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const DPI = 2;
const YEN = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

const COLORS: [number, { bg: string; text: string; name: string }][] = [
  [10000, { bg: '#e62117', text: '#fff', name: 'rgba(255,255,255,0.7)' }],
  [5000, { bg: '#e91e63', text: '#fff', name: 'rgba(255,255,255,0.7)' }],
  [2000, { bg: '#f57c00', text: 'rgba(255,255,255,0.87)', name: 'rgba(255,255,255,0.7)' }],
  [1000, { bg: '#ffca28', text: 'rgba(0,0,0,0.87)', name: 'rgba(0,0,0,0.54)' }],
  [500, { bg: '#1de9b6', text: '#000', name: 'rgba(0,0,0,0.54)' }],
  [200, { bg: '#00e5ff', text: '#000', name: 'rgba(0,0,0,0.7)' }],
  [100, { bg: '#1e88e5', text: '#fff', name: 'rgba(255,255,255,0.7)' }],
];

export interface Props {
  price: number;
  name: string;
  iconSrc?: string;
  message?: string;
}

// satori が受け付ける React-element-like のプレーンオブジェクトを組み立てる簡易ヘルパー。
// JSX を避けることで tsconfig の jsx 設定・React 依存を不要にしている。
type SatoriNode =
  | string
  | number
  | null
  | undefined
  | false
  | { type: string; props: { children?: SatoriNode | SatoriNode[]; style?: Record<string, unknown>; [key: string]: unknown } };

function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: SatoriNode[]
): SatoriNode {
  const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  const finalChildren = flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat;
  return { type, props: { ...(props ?? {}), children: finalChildren } };
}

function toDataUri(buf: ArrayBuffer, type: string): string {
  return `data:${type};base64,${Buffer.from(buf).toString('base64')}`;
}

const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(input: string | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFont(text: string, weight: number): Promise<ArrayBuffer> {
  const url = new URL('https://fonts.googleapis.com/css2');
  url.searchParams.set('family', `Noto Sans JP:wght@${weight}`);
  url.searchParams.set('text', text);

  const cssRes = await fetchWithTimeout(url, { headers: { 'User-Agent': 'satori' } });
  if (!cssRes.ok) throw new Error(`fetchFont css fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();
  const fontUrl = css.match(/src: url\((?<u>https:\/\/[^)]+)\)/u)?.groups?.u;
  if (!fontUrl) throw new Error('fetchFont: Font URL not found');
  const fontRes = await fetchWithTimeout(fontUrl);
  if (!fontRes.ok) throw new Error(`fetchFont font fetch failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

async function fetchIcon(src?: string): Promise<string | undefined> {
  if (!src) return undefined;
  try {
    const res = await fetchWithTimeout(src);
    if (!res.ok) return undefined;
    return toDataUri(await res.arrayBuffer(), res.headers.get('content-type') ?? 'image/png');
  } catch {
    return undefined;
  }
}

async function loadEmoji(segment: string): Promise<string> {
  const str = segment.indexOf('\u200D') === -1 ? segment.replace(/\uFE0F/g, '') : segment;
  const code = [...str].map((c) => c.codePointAt(0)!.toString(16)).join('-');
  try {
    const res = await fetchWithTimeout(
      `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`
    );
    if (!res.ok) return segment;
    return toDataUri(await res.arrayBuffer(), 'image/svg+xml');
  } catch {
    return segment;
  }
}

export async function generateImage({ price, name, iconSrc: rawIcon, message }: Props): Promise<Uint8Array> {
  const [fontNormal, fontBold, iconSrc] = await Promise.all([
    fetchFont(`x${message ?? ''}`, 400),
    fetchFont(`${name}￥${price},`, 500),
    fetchIcon(rawIcon),
  ]);

  const color = (COLORS.find(([t]) => price >= t) ?? COLORS.at(-1)!)[1];

  const iconNode = iconSrc
    ? h('img', {
        src: iconSrc,
        width: 32 * DPI,
        height: 32 * DPI,
        style: {
          width: `${32 * DPI}px`,
          height: `${32 * DPI}px`,
          borderRadius: '50%',
          marginRight: `${16 * DPI}px`,
        },
      })
    : h('span', {
        style: {
          width: `${32 * DPI}px`,
          height: `${32 * DPI}px`,
          borderRadius: '50%',
          marginRight: `${16 * DPI}px`,
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
      });

  const headerRow = h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: `${8 * DPI}px ${16 * DPI}px`,
        fontWeight: 500,
      },
    },
    iconNode,
    h(
      'div',
      { style: { display: 'flex' } },
      h('span', { style: { color: color.name, fontSize: `${14 * DPI}px` } }, name),
      h('span', { style: { paddingLeft: `${8 * DPI}px` } }, YEN.format(price))
    )
  );

  const messageRow = message
    ? h(
        'div',
        {
          style: {
            padding: `${8 * DPI}px ${16 * DPI}px`,
            paddingTop: '0',
            wordBreak: 'break-word',
          },
        },
        message
      )
    : null;

  const root = h(
    'div',
    {
      lang: 'ja-JP',
      style: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${12 * DPI}px`,
        backgroundColor: color.bg,
        color: color.text,
        fontSize: `${15 * DPI}px`,
        fontFamily: "'Noto Sans JP'",
      },
    },
    headerRow,
    messageRow
  );

  const svg = await satori(root as Parameters<typeof satori>[0], {
    width: 368 * DPI,
    height: 1000 * DPI,
    fonts: [
      { name: 'Noto Sans JP', data: fontNormal, weight: 400, style: 'normal' },
      { name: 'Noto Sans JP', data: fontBold, weight: 500, style: 'normal' },
    ],
    loadAdditionalAsset: async (code, segment) =>
      code === 'emoji' ? loadEmoji(segment) : segment,
  });

  const resvg = new Resvg(svg, { background: 'transparent' });
  const bbox = resvg.innerBBox();
  if (bbox) resvg.cropByBBox(bbox);
  return resvg.render().asPng();
}
