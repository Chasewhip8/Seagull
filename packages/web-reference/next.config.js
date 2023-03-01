const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    loader: 'custom',
    disableStaticImages: true
  },
  trailingSlash: true,
  webpack: (config, { webpack }) => {
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
      resolve: {
        ...config.resolve,
        fallback: {
          assert: require.resolve('assert'),
          buffer: require.resolve('buffer'),
          fs: false
        },
      },
    };
  }
}

module.exports = withPlugins([
  [optimizedImages, {
    handleImages: ['png', 'svg'],
    optimizeImagesInDev: true
  }]
], nextConfig);
