/**
 * TileNotes Supabase API Helper
 * Direct API interactions with Supabase
 */

class SupabaseAPI {
  constructor(url, serviceRoleKey) {
    this.url = url;
    this.serviceRoleKey = serviceRoleKey;
    this.headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    };
  }

  async executeSQL(sql) {
    const response = await fetch(`${this.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SQL execution failed: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createStorageBucket(bucketId, options = {}) {
    const bucketConfig = {
      id: bucketId,
      name: bucketId,
      public: true,
      file_size_limit: 52428800, // 50MB
      allowed_mime_types: ['image/*', 'audio/*', 'application/pdf', 'text/*'],
      ...options
    };

    const response = await fetch(`${this.url}/storage/v1/bucket`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(bucketConfig)
    });

    if (response.status === 409) {
      return { success: true, message: 'Bucket already exists' };
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bucket creation failed: ${response.status} - ${error}`);
    }

    return { success: true, message: 'Bucket created successfully' };
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.url}/rest/v1/`, {
        method: 'GET',
        headers: this.headers
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getTables() {
    const sql = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    return this.executeSQL(sql);
  }

  async insertSampleData() {
    const sql = `
      -- Insert sample data only if tables are empty
      INSERT INTO tags (id, user_id, name, color, is_ai_generated)
      SELECT 
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        unnest(ARRAY['work', 'personal', 'ideas', 'important']),
        unnest(ARRAY['#3B82F6', '#10B981', '#F59E0B', '#EF4444']),
        unnest(ARRAY[false, false, true, true])
      WHERE NOT EXISTS (SELECT 1 FROM tags LIMIT 1);
    `;
    
    return this.executeSQL(sql);
  }
}

module.exports = SupabaseAPI;
