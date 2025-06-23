import ContactForm from "@/components/ContactForm/ContactForm"

export default function RequestInfoPage() {
  return (
    <div className="flex flex-col items-center justify-center mx-auto h-screen p-4">
        <h1>We are excited to get you access to the coolest club in the world!</h1>
        <h2 className="text-2xl mb-4">Please fill out the form below to request access.</h2>
      <ContactForm />
    </div>
  );
}