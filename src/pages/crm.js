import { useState } from "react";

const contacts = [
  {
    id: 1,
    name: "Ahmad Rizal",
    phone: "601136228183",
    tag: "Estate",
    draft: "Hi Ahmad, just following up on the estate situation we discussed. Have you had a chance to review the documents? Please let me know if you need any clarification.",
  },
  {
    id: 2,
    name: "Siti Nora",
    phone: "601112345678",
    tag: "Meeting",
    draft: "Hi Siti, a friendly reminder that we have a meeting tomorrow at 10am in Subang Jaya. Please let me know if you need to reschedule.",
  },
  {
    id: 3,
    name: "David Tan",
    phone: "601198765432",
    tag: "Policy Renewal",
    draft: "Hi David, your policy is due for renewal next month. I'd like to schedule a call to go through your options. When would be a good time for you?",
  },
];

export default function CRM() {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  function selectContact(contact) {
    setSelected(contact);
    setMessage(contact.draft);
  }

  function openWhatsApp() {
    if (!selected || !message.trim()) return;
    const url = `https://wa.me/${selected.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Contact list */}
      <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Contacts</h1>
          <p className="text-xs text-gray-400 mt-0.5">Click to compose a message</p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {contacts.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => selectContact(c)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selected?.id === c.id ? "bg-green-50 border-l-4 border-green-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {c.tag}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">+{c.phone}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Compose area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!selected ? (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">Select a contact to compose a message</p>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <div className="mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{selected.name}</span>
                <span className="text-sm text-gray-400">+{selected.phone}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Message</div>
              <textarea
                className="w-full h-48 px-4 py-3 text-sm text-gray-800 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openWhatsApp}
                disabled={!message.trim()}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Open in WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
