import { supabase } from "@/lib/supabase";

async function createAdminUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "admin",
    },
  });

  if (error) {
    console.error("Error creating user:", error);
    return { success: false, error };
  }

  return { success: true, data };
}

(async () => {
  const x = await createAdminUser("enrico@albusdente.com.br", "Rugbylife1");

  return console.log(x);
})();
