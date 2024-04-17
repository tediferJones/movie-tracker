import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Movie Tracker',
    // short_name: 'Movie',
    description: 'A movie tracker app',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      // {
      //   src: '/android-chrome-192x192.png',
      //   sizes: '192x192',
      //   type: 'image/png'
      // },
      // {
      //   src: '/android-chrome-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png'
      // }
    ],
  }
}
