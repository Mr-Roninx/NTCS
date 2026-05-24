import { supabase } from './supabase';

export const certificateService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from('certificates').insert([payload]);
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('certificates').update(payload).eq('id', id);
    if (error) throw error;
    return data;
  },

  async delete(certNo) {
    const { error } = await supabase.from('certificates').delete().eq('cert_no', certNo);
    if (error) throw error;
    return true;
  }
};