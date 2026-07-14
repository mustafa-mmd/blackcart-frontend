export type SocialBrand = 'facebook' | 'instagram' | 'tiktok' | 'whatsapp'

interface StoreSocialLink {
  brand: SocialBrand
  name: string
  username: string
  label: string
  href: string
}

export const STORE_SOCIAL_LINKS: readonly StoreSocialLink[] = [
  {
    brand: 'facebook',
    name: 'Facebook',
    username: 'BlackCart.store',
    label: 'BlackCart.store on Facebook',
    href: 'https://www.facebook.com/share/18ryxiWJsx/',
  },
  {
    brand: 'tiktok',
    name: 'TikTok',
    username: 'blackcart.store',
    label: 'blackcart.store on TikTok',
    href: 'https://www.tiktok.com/@blackcart.store?_r=1&_t=ZS-980Tn3zBR3A',
  },
  {
    brand: 'instagram',
    name: 'Instagram',
    username: 'blackcart.store',
    label: 'blackcart.store on Instagram',
    href: 'https://www.instagram.com/blackcart.store?igsh=ZHgyYXFhendvcTE0',
  },
  {
    brand: 'whatsapp',
    name: 'WhatsApp',
    username: '+92 314 696 5599',
    label: 'BlackCart.store on WhatsApp',
    href: 'https://wa.me/923146965599',
  },
] as const
