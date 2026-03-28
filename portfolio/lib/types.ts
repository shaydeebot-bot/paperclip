export type ProjectCategory = 'web' | 'mobile' | 'design' | 'other'

export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  image: string
  tags: string[]
  category: ProjectCategory
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
}

export interface BlogPostFrontmatter {
  title: string
  date: string
  excerpt: string
  tags: string[]
  coverImage?: string
  published: boolean
  readingTime?: number
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string
  content: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar?: string
  quote: string
  rating?: number
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}
