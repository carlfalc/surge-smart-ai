import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, ChevronDown, Send, Zap, ArrowLeft, Mail, Book, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    title: "Getting Started",
    icon: Book,
    items: [
      { q: "How do I set up my account?", a: "After signing up, complete the onboarding flow to set your city, preferred platforms, and shift preferences. The AI will start learning your patterns immediately." },
      { q: "Which platforms does TaxiFlow support?", a: "We support Uber, Lyft, and Ola across Auckland, Wellington, Sydney, Melbourne, and Brisbane." },
      { q: "How accurate are surge predictions?", a: "Our AI achieves 85-92% accuracy for 30-minute predictions. Accuracy improves over time as we collect more data from your city." },
    ],
  },
  {
    title: "Billing & Plans",
    icon: HelpCircle,
    items: [
      { q: "Can I cancel my subscription?", a: "Yes, cancel anytime from your Settings page. You'll retain access until the end of your billing period." },
      { q: "Is there a free trial?", a: "Yes! Pro Driver comes with a 7-day free trial. No credit card required for the Basic plan." },
      { q: "How does the Fleet Manager plan work?", a: "Fleet Manager includes up to 10 driver seats with centralized analytics. Contact us for custom fleet sizes." },
    ],
  },
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Help Center</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Search */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-4">How can we help?</h1>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search help articles..." className="pl-10" />
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="space-y-8 mb-16">
          {faqCategories.map((cat) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <cat.icon className="h-5 w-5 text-primary" />
                {cat.title}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div key={item.q} className="glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="text-sm font-medium pr-4">{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openFaq === item.q ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === item.q && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          className="glass rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Support
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Can't find what you're looking for? Send us a message.</p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="your@email.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Describe your issue..." rows={4} value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} />
            </div>
            <Button variant="hero">Send Message</Button>
          </form>
        </motion.div>
      </div>

      {/* Chat widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <motion.div
            className="glass rounded-2xl w-80 h-96 flex flex-col overflow-hidden shadow-glow"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <div className="gradient-primary p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-foreground">AI Support</span>
              <button onClick={() => setChatOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-muted/50 rounded-lg p-3 text-sm mb-2">
                Hi! I'm TaxiFlow's AI assistant. How can I help you today?
              </div>
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="text-sm"
              />
              <Button variant="hero" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            variant="hero"
            size="icon"
            className="h-14 w-14 rounded-full shadow-glow"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Help;
