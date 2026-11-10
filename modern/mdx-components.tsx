import type { MDXComponents } from 'mdx/types';
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {a:({href,children,...props})=><a {...props} href={href} {...(href?.startsWith('https://')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}</a>,...components};
}
