/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://chessticks.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/admin/*', '/_next/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/']
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/']
      }
    ],
    additionalSitemaps: [
      'https://chessticks.vercel.app/sitemap.xml',
    ],
    additionalPaths: async (config) => [
      await config.transform(config, '/'),
    ]
  },
  changefreq: 'weekly',
  priority: 1.0,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    const customConfig = {
      loc: path,
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    }

    // Home page gets highest priority
    if (path === '/') {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    }

    return customConfig
  },
  additionalPaths: async (config) => {
    const result = []

    // Add any additional static paths here
    const additionalPaths = [
      '/',
    ]

    for (const path of additionalPaths) {
      result.push(
        await config.transform(config, path)
      )
    }

    return result
  }
}
