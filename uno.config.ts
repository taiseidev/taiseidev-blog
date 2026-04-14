import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'bg-main': 'bg-hex-fafaf7 dark:bg-hex-1a1916',
      'text-main': 'text-hex-2b2a28 dark:text-hex-d6d3cc',
      'text-muted': 'text-hex-8a8780 dark:text-hex-7a7770',
      'text-link': 'text-hex-2b2a28 dark:text-hex-d6d3cc',
      'border-main': 'border-hex-e5e2da dark:border-hex-2a2825',
    },
    {
      'text-title': 'text-link text-3xl font-400 tracking-tight',
      'nav-link': 'text-link opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-pointer',
      'prose-link': 'text-link cursor-pointer border-b-1 !border-opacity-30 hover:!border-opacity-100 border-neutral-500 transition-border-color duration-200 decoration-none',
    },
    {
      hairline: 'border-t border-solid border-main !border-op-70',
    },
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.1,
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        serif: ['Noto Serif JP:400,500', 'Source Serif Pro:400'],
        sans: 'Noto Sans JP:400',
        mono: 'DM Mono:400',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: [
    'i-simple-icons-github',
    'i-simple-icons-x',
    'i-ri-github-line',
    'i-ri-twitter-x-line',
  ],
})
