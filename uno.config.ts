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
      'bg-main': 'bg-hex-0f0e0c',
      'text-main': 'text-hex-e0dcd3',
      'text-muted': 'text-hex-8d897e',
      'text-link': 'text-hex-e0dcd3',
      'border-main': 'border-hex-282521',
    },
    {
      'eyebrow': 'font-display text-xs tracking-[0.35em] uppercase text-muted',
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
        display: 'Jost:200,300,400',
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  safelist: ['i-simple-icons-instagram', 'i-ri-instagram-line', 'i-simple-icons-x', 'i-ri-twitter-x-line'],
})
