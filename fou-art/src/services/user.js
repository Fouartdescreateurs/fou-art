import { supabase } from "../lib/supabase";

const currentTable = "account_test";

export async function getCurrentAccount() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Erreur récupération utilisateur :", userError);
    return null;
  }

  if (!user) {
    console.log("Aucun utilisateur connecté");
    return null;
  }

  const { data: account, error: accountError } = await supabase
    .from(currentTable)
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (accountError) {
    console.error("Erreur récupération account :", accountError);
    return null;
  }

  return account;
}