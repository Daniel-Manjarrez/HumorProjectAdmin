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
        // To prevent 42883 errors when users type partial strings like "2025" into a datetime filter,
        // we check if it can be parsed as a valid date.
        // If it's just a year "2025", new Date("2025") is valid.
        const dateVal = new Date(value);
        if (!isNaN(dateVal.getTime())) {
           // It's a valid date string. Let's do a loose bounds check for that day/year.
           // For simplicity in a generic filter, we just use gte (greater than or equal).
           // This means searching "2025-01-01" will show everything AFTER that date.
           query = query.gte(col.key, dateVal.toISOString());
        }
      } else if (col.type === 'number') {
        // Exact match for numbers (IDs, counts)
        if (!isNaN(Number(value))) {
          query = query.eq(col.key, Number(value));
        }
      } else {
        // Text search (UUIDs don't work with ILIKE in Postgres, must use EQ or cast)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(value)) {
          query = query.eq(col.key, value);
        } else {
          query = query.ilike(col.key, `%${value}%`);
        }
      }
    }
  });

  // Sort
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Fetch Resource Error:", error);
    throw error;
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;
  const hasNextPage = page < totalPages;

  return { data, totalPages, hasNextPage, page };
}
