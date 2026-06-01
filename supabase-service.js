import { createClient } from "@supabase/supabase-js";

export function createSupabaseService({ url, anonKey }) {
  const supabase = createClient(url, anonKey);

  return {
    async getMedia() {
      return supabase.from("media").select("*").order("created_at", { ascending: false });
    },

    async createMedia(row) {
      return supabase.from("media").insert(row).select().single();
    },

    async updateMedia(id, row) {
      return supabase.from("media").update(row).eq("id", id).select().single();
    },

    async deleteMedia(id) {
      return supabase.from("media").delete().eq("id", id);
    },

    async bulkImportMedia(rows) {
      return supabase.from("media").insert(rows).select();
    },

    async searchMedia(term) {
      return supabase.from("media").select("*").or(`title.ilike.%${term}%,subject.ilike.%${term}%,category.ilike.%${term}%`);
    },

    async getRecentMedia(limit = 12) {
      return supabase.from("media").select("*").order("created_at", { ascending: false }).limit(limit);
    },

    async getRecentlyUpdatedMedia(limit = 12) {
      return supabase.from("media").select("*").order("updated_at", { ascending: false }).limit(limit);
    }
  };
}
