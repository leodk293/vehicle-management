import { createClient } from "./supabase/client";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error(error.message);
    return null;
  }
  return data.session;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function syncUserToDatabase(user: User) {
  const { error } = await supabase.from("clients").upsert({
    id: user.id,
    email: user.email,
    nom: user.user_metadata.full_name?.split(" ").slice(1).join(" ") || "",
    prenom: user.user_metadata.full_name?.split(" ")[0] || "",
    client_avatar: user.user_metadata.avatar_url,
  });

  if (error) console.error("Error syncing user:", error.message);
}
