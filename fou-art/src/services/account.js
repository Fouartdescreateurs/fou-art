import { supabase } from "../lib/supabase";

const currentTable = "account_test";

export async function linkUserAndAccount(user_id, account_id) {
  return await supabase
    .from(currentTable)
    .update({
      user_id: user_id,
    })
    .eq("id", account_id)
    .select()
    .single();
}

export async function countAllAccount(account, search = null) {
  if (!account) {
    console.error("Aucun compte fourni");
    return 0;
  }

  let query = supabase
    .from(currentTable)
    .select("*", { count: "exact", head: true })
    .order("created_at", { ascending: false });

  if (search) {
    const safeSearch = search.trim().replace(/[%,()]/g, "");

    query = query.or(`name.ilike.%${safeSearch}%,role.ilike.%${safeSearch}%`);
  }

  const { count, error } = await query.neq("id", account?.id);

  if (error) {
    console.error("Erreur comptage compte :", error);
    return 0;
  }

  return count || 0;
}

export async function getAccounts(
  account,
  page = 1,
  pageSize = 9,
  search = null,
) {
  if (!account) {
    console.error("Aucun compte fourni");
    return 0;
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(currentTable)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    const safeSearch = search.trim().replace(/[%,()]/g, "");

    query = query.or(`name.ilike.%${safeSearch}%,role.ilike.%${safeSearch}%`);
  }
  const { data, error } = await query.neq("id", account?.id).range(from, to);

  if (error) {
    console.error("Erreur récupération compte :", error);
    return [];
  }

  return data || [];
}

export async function updateAccount(projectData, account_id) {
  return await supabase
    .from(currentTable)
    .update(projectData)
    .eq("id", account_id)
    .select()
    .single();
}

export async function deleteAccount(account_id) {
  const { error } = await supabase
    .from(currentTable)
    .delete()
    .eq("id", account_id);

  if (error) {
    return { error };
  }
}

export async function persistAccount(data) {
    return await supabase
        .from(currentTable)
        .insert(data)
        .select()
        .single();
}
