import { createClient } from "./supabase/client";

const supabase = createClient();

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

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error(error.message);
        return null;
    }
    return data.session;
}
