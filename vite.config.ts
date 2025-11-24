import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from "url";
import { resolve, dirname } from "node:path";
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
export default defineConfig({
  plugins: [
    vue(),
 vueI18n({
    include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
  })
  ],
    define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __VUE_I18N_PROD_DEVTOOLS__: false,
     'process.env': {}
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
})
