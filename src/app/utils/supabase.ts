import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xsuauybjzhipyigoveko.supabase.co'
const supabaseAnonKey = 'sb_publishable_KjXZvXMsyURjamzp4b5MtA_3GfvF-91'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    console.log('🔐 Intentando iniciar sesión...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('🔐 Resultado de inicio de sesión:', { data, error })
    return { data, error }
  },
  
  signUp: async (email: string, password: string) => {
    console.log('📝 Intentando registrar usuario...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    console.log('📝 Resultado de registro:', { data, error })
    return { data, error }
  },
  
  signOut: async () => {
    console.log('🚪 Intentando cerrar sesión...')
    const { error } = await supabase.auth.signOut()
    console.log('🚪 Resultado de cierre de sesión:', { error })
    return { error }
  },
  
  getCurrentUser: async () => {
    console.log('👤 Consultando usuario actual...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Resultado de usuario actual:', { user })
    return user
  },
  
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    console.log('🔄 Escuchando cambios de estado de autenticación...')
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Products
  getProducts: async () => {
    console.log('🔍 Consultando productos en Supabase...')
    const { data, error } = await supabase.from('products').select('*')
    console.log('📦 Resultado de productos:', { data, error })
    return { data, error }
  },
  
  getProduct: async (id: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    return { data, error }
  },
  
  createProduct: async (product: any) => {
    const { data, error } = await supabase.from('products').insert(product).select()
    return { data, error }
  },
  
  updateProduct: async (id: string, product: any) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select()
    return { data, error }
  },
  
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    return { error }
  },
  
  // Pages
  getPages: async () => {
    console.log('📄 Consultando páginas en Supabase...')
    const { data, error } = await supabase.from('pages').select('*')
    console.log('📄 Resultado de páginas:', { data, error })
    return { data, error }
  },
  
  getPage: async (id: string) => {
    const { data, error } = await supabase.from('pages').select('*').eq('id', id).single()
    return { data, error }
  },
  
  createPage: async (page: any) => {
    const { data, error } = await supabase.from('pages').insert(page).select()
    return { data, error }
  },
  
  updatePage: async (id: string, page: any) => {
    const { data, error } = await supabase.from('pages').update(page).eq('id', id).select()
    return { data, error }
  },
  
  deletePage: async (id: string) => {
    const { error } = await supabase.from('pages').delete().eq('id', id)
    return { error }
  },
  
  // Members
  getMembers: async () => {
    console.log('👥 Consultando miembros en Supabase...')
    const { data, error } = await supabase.from('members').select('*')
    console.log('👥 Resultado de miembros:', { data, error })
    return { data, error }
  },
  
  getMember: async (id: string) => {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single()
    return { data, error }
  },
  
  createMember: async (member: any) => {
    const { data, error } = await supabase.from('members').insert(member).select()
    return { data, error }
  },
  
  updateMember: async (id: string, member: any) => {
    const { data, error } = await supabase.from('members').update(member).eq('id', id).select()
    return { data, error }
  },
  
  deleteMember: async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id)
    return { error }
  },
  
  // Blog Posts
  getBlogPosts: async () => {
    console.log('📝 Consultando posts de blog en Supabase...')
    const { data, error } = await supabase.from('blog_posts').select('*')
    console.log('📝 Resultado de posts de blog:', { data, error })
    return { data, error }
  },
  
  getBlogPost: async (id: string) => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    return { data, error }
  },
  
  createBlogPost: async (post: any) => {
    const { data, error } = await supabase.from('blog_posts').insert(post).select()
    return { data, error }
  },
  
  updateBlogPost: async (id: string, post: any) => {
    const { data, error } = await supabase.from('blog_posts').update(post).eq('id', id).select()
    return { data, error }
  },
  
  deleteBlogPost: async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    return { error }
  },
  
  // Categories
  getCategories: async () => {
    console.log('🏷️ Consultando categorías en Supabase...')
    const { data, error } = await supabase.from('categories').select('*')
    console.log('🏷️ Resultado de categorías:', { data, error })
    return { data, error }
  },
  
  getCategory: async (id: string) => {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
    return { data, error }
  },
  
  createCategory: async (category: any) => {
    const { data, error } = await supabase.from('categories').insert(category).select()
    return { data, error }
  },
  
  updateCategory: async (id: string, category: any) => {
    const { data, error } = await supabase.from('categories').update(category).eq('id', id).select()
    return { data, error }
  },
  
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    return { error }
  }
}