import { Link } from "react-router-dom";
import { Hand, Radio, Mic, ArrowRight, Users, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const modes = [
  {
    title: "Sign Language",
    description: "Real-time hand gesture recognition using your webcam and AI vision processing",
    icon: Hand,
    path: "/sign-language",
    colorClass: "bg-sign-language",
    textClass: "text-sign-language",
  },
  {
    title: "Morse Code",
    description: "Tap-based input with real-time decoding, audio feedback, and text-to-speech output",
    icon: Radio,
    path: "/morse-code",
    colorClass: "bg-morse-code",
    textClass: "text-morse-code",
  },
  {
    title: "Lip Reading",
    description: "AI-powered lip movement analysis from webcam feed for speech interpretation",
    icon: Mic,
    path: "/lip-reading",
    colorClass: "bg-lip-reading",
    textClass: "text-lip-reading",
  },
];

const stats = [
  { value: "85%", label: "Improved Communication", icon: Users, description: "Users report better daily interactions" },
  { value: "70%", label: "Increased Independence", icon: TrendingUp, description: "Greater autonomy in conversations" },
  { value: "3×", label: "Faster Expression", icon: Zap, description: "Compared to traditional methods" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lip-reading/5" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-morse-code opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-morse-code" />
              </span>
              Multimodal Assistive Communication
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
              Breaking Communication{" "}
              <span className="bg-gradient-to-r from-sign-language via-morse-code to-lip-reading bg-clip-text text-transparent">
                Barriers
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              MMACS combines sign language recognition, Morse code input, and lip reading 
              into one powerful platform — empowering individuals with diverse communication needs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/sign-language">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mode Cards */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Three Communication Modes</h2>
            <p className="text-muted-foreground">Choose the mode that works best for you</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modes.map((mode, i) => (
              <motion.div key={mode.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={mode.path} className="group block">
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${mode.colorClass}`}>
                        <mode.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{mode.title}</h3>
                      <p className="mb-4 text-sm text-muted-foreground">{mode.description}</p>
                      <span className={`inline-flex items-center text-sm font-medium ${mode.textClass} group-hover:gap-2 transition-all`}>
                        Try it now <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-card py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Measurable Impact</h2>
            <p className="text-muted-foreground">Real outcomes from assistive communication technology</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mb-1 text-4xl font-extrabold text-primary">{stat.value}</div>
                  <div className="mb-1 text-lg font-semibold">{stat.label}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>MMACS — Multimodal Assistive Communication System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
