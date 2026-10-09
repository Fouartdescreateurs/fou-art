import { supabase } from "../lib/supabase";

const currentTable = "question_test";

export async function getAllQuestion() {
  const { data, error } = await supabase
    .from(currentTable)
    .select("*");

  if (error) {
    console.error(
      "Erreur récupération questions :",
      error,
    );

    return [];
  }

  return data || [];
}

export async function addQuestions(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const questionsToInsert = data.map((question) => ({
    title: question.value,
  }));

  console.log(
    "Questions à insérer :",
    questionsToInsert,
  );

  const { data: insertedData, error } = await supabase
    .from(currentTable)
    .insert(questionsToInsert)
    .select();

  if (error) {
    console.error(
      "Erreur ajout questions :",
      error,
    );

    return error;
  }

  return insertedData;
}

export async function updateQuestions(data) {
  if (!data || data.length === 0) {
    return null;
  }

  for (const question of data) {
    const { error } = await supabase
      .from(currentTable)
      .update({
        title: question.title,
      })
      .eq("id", question.id);

    if (error) {
      console.error(
        `Erreur modification question ${question.id} :`,
        error,
      );

      return error;
    }
  }

  return null;
}

export async function deleteQuestions(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const ids = data.map((question) => question.id);

  const { error } = await supabase
    .from(currentTable)
    .delete()
    .in("id", ids);

  if (error) {
    console.error(
      "Erreur suppression questions :",
      error,
    );

    return error;
  }

  return null;
}