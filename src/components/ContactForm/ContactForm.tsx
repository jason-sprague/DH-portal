'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type FormState } from '@/app/actions';
import { Button } from '../ui/button';
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const initialState: FormState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form if the submission was successful
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card className="flex flex-col max-w-lg mx-auto my-12 bg-gray-800 text-white w-10/12">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>
          <SubmitButton />
          {state.message && (
            <p className={`mt-4 text-sm ${state.success ? 'text-green-400' : 'text-red-400'}`}>
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}