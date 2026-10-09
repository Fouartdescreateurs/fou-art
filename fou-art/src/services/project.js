import { supabase } from "../lib/supabase";

const currentTable = "project_test";

export async function getAllProjects() {
  const { data, error } = await supabase.from(currentTable).select(`*`);

  if (error) {
    console.log(error);
    return [];
  }
  return data || [];
}

export async function countAllProject(search = null) {

  let query = supabase
    .from(currentTable)
    .select("*", { count: "exact", head: true })
    .order("project_number", { ascending: false });

  if (search) {
    const safeSearch = search.trim().replace(/[%,()]/g, "");

    query = query.or(
      `owner.ilike.%${safeSearch}%,project_name.ilike.%${safeSearch}%`,
    );
  }

  const { count, error } = await query;

  if (error) {
    console.error("Erreur comptage projets :", error);
    return 0;
  }

  return count || 0;
}

export async function countRestreintProject(search = null) {

  let query = supabase
    .from(currentTable)
    .select("*", { count: "exact", head: true })
    .order("project_number", { ascending: false })
    .eq("show_to_restreint", true);

  if (search) {
    const safeSearch = search.trim().replace(/[%,()]/g, "");

    query = query.or(
      `owner.ilike.%${safeSearch}%,project_name.ilike.%${safeSearch}%`,
    );
  }

  const { count, error } = await query;

  if (error) {
    console.error("Erreur comptage projets :", error);
    return 0;
  }

  return count || 0;
}

export async function getProjects(page = 1, pageSize = 10, search = null) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(currentTable)
    .select("*", { count: "exact" })
    .order("project_number", { ascending: false });

  if (search) {
    const safeSearch = search.trim().replace(/[%,()]/g, "");

    query = query.or(
      `owner.ilike.%${safeSearch}%,project_name.ilike.%${safeSearch}%`,
    );
  }
  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("Erreur récupération projets :", error);
    return [];
  }

  return data || [];
}

export async function getProjectsForRestreint(
  page = 1,
  pageSize = 10,
  search = null,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(currentTable)
    .select("*")
    .eq("show_to_restreint", true)
    .order("project_number", { ascending: false });

  if (search) {
    query = query.or(`owner.ilike.%${search}%,project_name.ilike.%${search}%`);
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    console.error("Erreur récupération projets restreints :", error);

    return [];
  }

  return data || [];
}

export async function getAllProjectsForRestreint() {
  const { data, error } = await supabase
    .from(currentTable)
    .select(`*`)
    .eq("show_to_restreint", true);

  if (error) {
    console.log(error);
    return [];
  }
  return data || [];
}

export async function getProjectById(project_id) {
  return await supabase
    .from(currentTable)
    .select(`*`)
    .eq("id", project_id)
    .single();
}

export async function persistProject(data) {
  return await supabase.from(currentTable).insert(data);
}

export async function getLastNumProject() {
  const { data, error } = await supabase
    .from(currentTable)
    .select("*")
    .order("project_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateProject(projectData, project_id) {
  return await supabase
    .from(currentTable)
    .update(projectData)
    .eq("id", project_id)
    .select()
    .single();
}

export async function deleteProject(project_id) {
  const { error } = await supabase
    .from(currentTable)
    .delete()
    .eq("id", project_id);

  if (error) {
    return { error };
  }
}
