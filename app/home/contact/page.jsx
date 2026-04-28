"use client";
import React from "react";

export default function ContactPage() {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-800 flex flex-col md:flex-row gap-10">
      {/* Left side: Form */}
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-bold mb-2 text-indigo-400">Contact Us</h2>
        <p className="mb-6 text-zinc-300 text-sm">
          We&apos;d love to hear from you! Please fill out the form below.
        </p>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-semibold text-zinc-200"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-semibold text-zinc-200"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block mb-1 text-sm font-semibold text-zinc-200"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              required
              rows={5}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Type your message here..."
            />
          </div>
          <button
            type="submit"
            className="font-semibold bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-lg px-6 py-2 mt-2 transition-shadow shadow-lg hover:shadow-xl focus:outline-none"
          >
            Submit Form
          </button>
        </form>
        <span
          className={`block mt-6 text-center text-base font-medium ${
            result.includes("Success")
              ? "text-green-400"
              : result
                ? "text-red-400"
                : "text-white"
          }`}
        >
          {result}
        </span>
      </div>
      {/* Right side: Contact Info */}
      <div className="flex-1 min-w-0 mt-10 md:mt-0 flex flex-col justify-center">
        <div className="bg-zinc-800 rounded-xl p-6 gap-4 flex flex-col shadow-lg border border-zinc-700">
          <h3 className="text-xl font-semibold mb-3 text-indigo-300">
            Our Contact Info
          </h3>
          <div className="flex items-center gap-3 text-zinc-200">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="text-indigo-400"
            >
              <path d="M2.003 5.884L10 10.882l7.997-4.998A2 2 0 0 0 16 4H4a2 2 0 0 0-1.997 1.884z" />
              <path d="M18 8.118l-8 5-8-5V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.118z" />
            </svg>
            <span className="select-all">hello@locomote-vehicles.com</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-200 mt-1">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="text-indigo-400"
            >
              <path d="M17.707 13.293a1 1 0 0 0-1.414 0l-2.829 2.829c-2.63-1.427-4.86-3.657-6.288-6.288l2.83-2.83a1 1 0 0 0 0-1.414L6.586 3.293a1 1 0 0 0-1.414 0l-1.878 1.878c-.526.526-.816 1.25-.816 2.003 0 7.18 5.82 13 13 13 .753 0 1.477-.29 2.003-.817l1.878-1.877a1 1 0 0 0 0-1.415l-2.252-2.252z" />
            </svg>
            <span className="select-all">+1 (800) 555-LOCO</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-200 mt-1">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="text-indigo-400"
            >
              <path d="M10 2C5.031 2 1 6.031 1 11c0 2.959 2.302 5.363 5.105 5.927V17l1.636-1.406a8.954 8.954 0 0 0 2.259.279 8.92 8.92 0 0 0 2.26-.279L13.895 17v-1.073C16.698 16.362 19 13.959 19 11c0-4.969-4.031-9-9-9z" />
            </svg>
            <span>1234 Main St, Suite 100, Metropolis, USA</span>
          </div>
          <div className="mt-6">
            <span className="font-medium text-zinc-400 text-sm">
              Office Hours: Mon-Fri 9:00am - 5:00pm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
