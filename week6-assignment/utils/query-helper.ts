import { SupabaseClient } from '@supabase/supabase-js';
import { ColumnDef } from '@/components/ResourceManager';

export async function fetchResource(
  supabase: SupabaseClient,
  tableName: string,
  searchParams: { [key: string]: string | undefined },
  columns: ColumnDef[]
) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Sort
  const sortBy = searchParams.sort_by || 'id'; // Default to ID if no created_at
  const sortOrder = searchParams.sort_order === 'asc';

  let query = supabase.from(tableName).select('*', { count: 'exact' });

  // Dynamic Filters
  columns.forEach(col => {
    const value = searchParams[col.key];
    if (value) {
      if (col.type === 'boolean') {
        query = query.eq(col.key, value === 'true');
      } else if (col.type === 'datetime') {
        query = query.ilike(col.key, `${value}%`);
      } else if (col.type === 'number') {
        // Exact match for numbers (IDs, counts)
        query = query.eq(col.key, value);
      } else {
        // Text search
        query = query.ilike(col.key, `%${value}%`);
      }
    }
  });

  // Sort
  // Check if sort column exists in definition to avoid errors, or assume client sent valid one
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const hasNextPage = page < totalPages;

  return { data, totalPages, hasNextPage, page };
}
