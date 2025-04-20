import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a fully mocked Supabase client for static exports or when env vars are missing
const createMockClient = (): SupabaseClient => {
  console.warn('Using mock Supabase client - no actual database operations will be performed');

  const mockStorage = {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => {
        console.log(`Mock: Uploading ${file.name} to ${bucket}/${path}`);
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage-url.com/${bucket}/${path}` } };
      }
    })
  };

  return {
    from: (table: string) => ({
      select: (columns?: string) => {
        console.log(`Mock: SELECT ${columns || '*'} FROM ${table}`);
        return { 
          order: () => ({ data: [], error: null }),
          eq: () => ({ data: null, error: null }),
          single: () => ({ data: null, error: null }),
          data: [], 
          error: null 
        };
      },
      insert: (values: any[]) => {
        console.log(`Mock: INSERT INTO ${table}`, values);
        return { 
          select: () => ({ single: () => ({ data: values[0], error: null }) }),
          data: values[0], 
          error: null 
        };
      },
      update: (values: any) => {
        console.log(`Mock: UPDATE ${table}`, values);
        return { 
          eq: () => ({ 
            select: () => ({ single: () => ({ data: values, error: null }) }),
            data: values, 
            error: null 
          }) 
        };
      },
      delete: () => {
        console.log(`Mock: DELETE FROM ${table}`);
        return { 
          eq: () => ({ data: null, error: null }) 
        };
      },
    }),
    storage: mockStorage,
    auth: {
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as SupabaseClient;
};

// Initialize Supabase client or mock
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Missing Supabase environment variables, using mock client');
  }
  supabase = createMockClient();
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = createMockClient();
  }
}

// Export the initialized supabase client
export { supabase };

// Helper types for your database schema
export type ContactForm = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type CareerApplication = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  position_applied: string;
  cover_letter?: string;
  resume_url: string;
};

export type Client = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
};

// Zod schema for client validation
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
});

// Helper functions for client operations
export const clientOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Client[];
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  async create(client: Omit<Client, 'id' | 'created_at'>) {
    // Validate the client data before insertion
    const validatedData = clientSchema.parse(client);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([validatedData])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('A client with this email already exists');
      }
      throw error;
    }
    
    return data as Client;
  },

  async update(id: number, client: Partial<Omit<Client, 'id' | 'created_at'>>) {
    // Validate the update data
    const validatedData = clientSchema.partial().parse(client);
    
    const { data, error } = await supabase
      .from('clients')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('A client with this email already exists');
      }
      throw error;
    }
    
    return data as Client;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};