import createMDX from '@next/mdx';
const withMDX = createMDX({ extension: /\.mdx$/ });
export default withMDX({
  output: 'export', trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  reactStrictMode: true,
});
