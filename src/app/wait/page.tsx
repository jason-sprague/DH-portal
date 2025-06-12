'use client'
import { signOut } from 'next-auth/react';

export default function Wait() {
    return(

        <div className="flex flex-col items-center justify-center min-h-screen w-screen p-4 gap-4">
            <h1 className="text-3xl">Oh, Snap!</h1>
            <p>Please wait until we finish setting up your company in our onboarding process. If you think this is a mistake, too bad.</p>
            <button
                onClick={() => signOut()}
                style={{
                padding: '10px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                width: '150px',
                height: '50px',
                borderRadius: '5px',
                cursor: 'pointer',
                }}>
                Sign Out
            </button>
        </div>
    )
}