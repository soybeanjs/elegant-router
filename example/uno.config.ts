import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';
import { presetSoybeanUI } from '@soybean-ui/unocss-preset';

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.vue($|\?)/, /.*\/soy-ui.*\.js/]
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetWind3({ dark: 'class' }),
    presetSoybeanUI({
      color: 'default'
    })
  ]
});
