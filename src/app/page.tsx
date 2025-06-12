
import './globals.css';
import { signIn } from "@/auth";
import Image from "next/image";
export default async function Home() {
    return (
      <main>
        <div className="header">
          <div className="logo">
          <Image alt="dykstra hamel logo" src="/dykstra-hamel-logo.svg" width={300} height={50} />
          </div>
        </div>
        <div className="card sign-up">
        <h1 className="text-3xl">DH Portal</h1>
        <form
          action={async () => {
            "use server"
            await signIn("google", { callbackUrl: "/dashboard" })
          }}
        >
          <button className="button" type="submit">Login</button>
        </form>
        </div>
      </main>
    );
  }