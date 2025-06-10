
import './globals.css';
import { signIn } from "@/auth";

export default async function Home() {
    return (
      <main>
            <form
      action={async () => {
        "use server"
        await signIn("google", { callbackUrl: "/dashboard" })
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>
      </main>
    );
  }