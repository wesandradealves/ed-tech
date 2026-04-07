import { defineConfig } from 'vite';
import { minify as minifyHtml } from 'html-minifier-terser';

const htmlMinifyOptions = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
};

export default defineConfig({
  build: {
    target: 'es2019',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
  },
  plugins: [
    {
      name: 'html-minify-output',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml: {
        order: 'post',
        async handler(html) {
          return minifyHtml(html, htmlMinifyOptions);
        },
      },
    },
  ],
});
