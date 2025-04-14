import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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