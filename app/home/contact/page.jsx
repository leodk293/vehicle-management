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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-[1fr_1.4fr] rounded-2xl overflow-hidden border border-white/10">

        {/* Sidebar */}
        <div className="relative bg-neutral-900 px-8 py-10 flex flex-col gap-8 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-amber-500/10 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-amber-500/5 pointer-events-none" />

          {/* Heading */}
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-amber-500 font-medium mb-2">
              Get in touch
            </p>
            <h2 className="text-2xl font-serif text-white leading-snug font-normal">
              Let&apos;s talk about your project
            </h2>
          </div>

          <p className="relative z-10 text-sm text-white/40 leading-relaxed -mt-4">
            Have a question or want to work together? Fill out the form and
            we&apos;ll get back to you within 24 hours.
          </p>

          {/* Contact info */}
          <div className="relative z-10 flex flex-col gap-5 mt-auto">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ),
                label: "Phone",
                value: "+1 (555) 234-5678",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                label: "Email",
                value: "hello@yourcompany.com",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                label: "Location",
                value: "Marrakech, Morocco",
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/30 mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm text-white/80">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form side */}
        <div className="bg-neutral-950 px-8 py-10 flex flex-col gap-5">
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  required
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="What's this about?"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
                Message
              </label>
              <textarea
                name="message"
                placeholder="Tell us more about your project..."
                rows={5}
                required
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Send message
              </button>

              {result && (
                <span
                  className={`text-sm ${
                    result.toLowerCase().includes("success")
                      ? "text-emerald-400"
                      : result === "Sending...."
                      ? "text-white/40"
                      : "text-red-400"
                  }`}
                >
                  {result}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}