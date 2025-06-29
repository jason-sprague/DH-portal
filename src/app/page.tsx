
import './globals.css';
import { signIn } from "@/auth";
import { Button } from '@/components/ui/button';
import Link from 'next/link'
import Image from "next/image";
export default async function Home() {
    return (
      <main>
        <div className="header">
          <div className="logo">
          <Image alt="dykstra hamel logo" src="/dykstra-hamel-logo.svg" width={300} height={50} />
          </div>
        </div>
        <div className="flex flex-wrap gap-10 items-center justify-center"> 
          <div className="card sign-up">
          <h2 className="text-3xl">New Member</h2>
          <Link href="/request-info" className="text-white text-[16px]">
            <Button className="button text-[16px]">
                Get Access
            </Button>
            </Link>
          </div>

          <div className="card sign-up">
            <h2 className="text-3xl">Current Member</h2>
            <form
              action={async () => {
                "use server"
                await signIn("google", { callbackUrl: "/dashboard" })
              }}
            >
              <button className="button" type="submit">Login with Google</button>
            </form>

            <form
              action={async () => {
                "use server"
                await signIn("facebook", { callbackUrl: "/dashboard" })
              }}
            >
              <button className="button" type="submit">Login with Facebook</button>
            </form>

            <form
              action={async (formData) => {
                "use server"
                await signIn("resend", formData)
              }}
            >
              <input type="email" name="email" placeholder="Enter your email" />
              <button type="submit">Send Magic Link</button>
            </form>
          </div>

        </div>
      </main>
    );
  }