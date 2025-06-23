'use server';

import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type FormState = {
  message: string;
  success: boolean;
};

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.message?.[0] || 'Invalid input.',
      success: false,
    };
  }

  const { name, email, message } = validatedFields.data;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL; 

  if (!webhookUrl) {
    console.error('Webhook URL is not set in environment variables.');
    return { message: 'Server configuration error.', success: false };
  }

  //Create the simple JSON payload that Slack expects
  //We will need to adjust this if we want to send diff data in the slack workflow
  const webhookPayload = {
    email: email,
    message: message,
    name: name,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return { message: 'Message sent successfully!', success: true };
  } catch (error) {
    console.error('Error sending message to webhook:', error);
    return { message: 'Failed to send message.', success: false };
  }
}