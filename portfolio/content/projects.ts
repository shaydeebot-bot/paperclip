import { Project } from '@/lib/types'

export const projects: Project[] = [
  {
    id: 'ecommerce-dashboard',
    title: 'E-Commerce Dashboard',
    description:
      'Real-time analytics dashboard for an online retailer with inventory management, sales tracking, and customer insights.',
    longDescription:
      'A comprehensive dashboard built for a mid-size e-commerce company processing over 10,000 orders monthly. Features include real-time sales analytics, inventory alerts, customer segmentation, and automated reporting.',
    image: '/images/projects/ecommerce.svg',
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Chart.js'],
    category: 'web',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    featured: true,
    order: 1,
  },
  {
    id: 'fitness-tracker',
    title: 'FitTrack Mobile',
    description:
      'Cross-platform fitness tracking app with workout logging, progress visualization, and social challenges.',
    image: '/images/projects/fitness.svg',
    tags: ['React Native', 'Expo', 'Firebase', 'Redux'],
    category: 'mobile',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    featured: true,
    order: 2,
  },
  {
    id: 'brand-identity',
    title: 'Nexus Brand Identity',
    description:
      'Complete brand identity system for a fintech startup including logo, color palette, typography, and design guidelines.',
    image: '/images/projects/brand.svg',
    tags: ['Figma', 'Illustrator', 'Brand Strategy'],
    category: 'design',
    featured: true,
    order: 3,
  },
  {
    id: 'saas-platform',
    title: 'CloudSync Platform',
    description:
      'Multi-tenant SaaS platform for team collaboration with real-time document editing and project management.',
    image: '/images/projects/saas.svg',
    tags: ['Next.js', 'Prisma', 'Tailwind', 'WebSocket', 'AWS'],
    category: 'web',
    githubUrl: 'https://github.com',
    featured: false,
    order: 4,
  },
  {
    id: 'recipe-app',
    title: 'CookBook App',
    description:
      'Recipe discovery app with AI-powered meal planning, grocery list generation, and dietary preference filtering.',
    image: '/images/projects/recipe.svg',
    tags: ['Flutter', 'Dart', 'OpenAI API', 'Supabase'],
    category: 'mobile',
    liveUrl: 'https://example.com',
    featured: false,
    order: 5,
  },
  {
    id: 'portfolio-theme',
    title: 'Minimal Portfolio Theme',
    description:
      'Open-source portfolio theme for developers with dark mode, blog engine, and project showcase. 500+ GitHub stars.',
    image: '/images/projects/theme.svg',
    tags: ['Figma', 'UI/UX', 'Design System', 'Accessibility'],
    category: 'design',
    githubUrl: 'https://github.com',
    featured: false,
    order: 6,
  },
]
