import { supabase } from "@/lib/supabase";

async function fetchProfessionals() {
  return (await supabase.from("profissionais").select("id, login, nome")).data;
}

async function parsedArray(): Promise<
  { id: string; login: string; senha: string }[] | void
> {
  const professionals = await fetchProfessionals();

  const parsed = professionals?.map((prof) => {
    // const firstDigits = prof.sindicato?.slice(0, 4);
    // const idLastDigits = prof.id.slice(-4);

    const firstLetter = prof.nome.slice(0, 1);
    const id_numbers = prof.id.slice(0, 5);
    const senha = `${firstLetter}${id_numbers}`;

    return { id: prof.id, login: prof.login, senha };
  });

  if (!parsed) return;
  return parsed;
}
async function createUserWithUsername(username: string, password: string) {
  const fakeEmail = `${username}@albusdente.com.br`;

  const { data, error } = await supabase.auth.admin.createUser({
    email: fakeEmail,
    password: password,
    email_confirm: true,
    user_metadata: { username: username },
  });

  if (error) {
    console.error("Error creating user:", error);
    return { success: false, error };
  }

  return { success: true, data };
}
(async () => {
  const array = await parsedArray();
  if (!array) return;
  array.forEach(async ({ id, login, senha }) => {
    const create = await createUserWithUsername(login, senha);
    if (!create.success) return console.log("Error creating user");
    await supabase.from("profissionais").update({ login, senha }).eq("id", id);
  });
})();
