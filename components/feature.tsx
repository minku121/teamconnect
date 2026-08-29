import {
    Users,
    Calendar,
    MessageCircle,
    Trophy,
    Target,
    Bell,
    Code2,
    GitBranch,
    Lightbulb,
    Rocket,
    BookOpen,
    Sparkles,
  } from "lucide-react";
  
  const features = [
    {
      Icon: Users,
      name: "Create Events",
      description: "Schedule, manage, and promote your events seamlessly.",
      href: "/events",
      cta: "Host an Event",
      color: 'purple',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="80" stroke="currentColor" fill="none" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" fill="none" />
        </svg>
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
      Icon: Code2,
      name: "Live Broadcasting",
      description: "Stream video to hundreds of attendees with ultra-low latency.",
      href: "/stream",
      cta: "Start Streaming",
      color: 'violet',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50,150 L150,50" stroke="currentColor" strokeWidth="2" />
          <path d="M50,50 L150,150" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
      Icon: GitBranch,
      name: "Audience Engagement",
      description: "Keep your audience engaged with real-time chat and interactions.",
      href: "/chat",
      cta: "Start Chatting",
      color: 'blue',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="50,150 100,50 150,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="50,50 100,150 150,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Lightbulb,
      name: "Automatic Certificates",
      description: "Issue customizable certificates to attendees instantly after the event concludes.",
      href: "/certificates",
      cta: "Issue Certificates",
      color: 'amber',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="50" y="50" width="100" height="100" stroke="currentColor" fill="none" />
          <circle cx="100" cy="100" r="30" stroke="currentColor" fill="none" />
        </svg>
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Rocket,
      name: "Secure Access",
      description: "Protect your streams with built-in authentication and role-based access.",
      href: "/security",
      cta: "View Security",
      color: 'emerald',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50,150 L100,50 L150,150" stroke="currentColor" fill="none" />
          <path d="M75,100 L125,100" stroke="currentColor" fill="none" />
        </svg>
      ),
      className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
    {
      Icon: Sparkles,
      name: "Email Reminders",
      description: "Keep attendees in the loop with automated email reminders and updates.",
      href: "/emails",
      cta: "Setup Reminders",
      color: 'rose',
      background: (
        <svg
          className="absolute -right-20 -top-20 opacity-10"
          width="200"
          height="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="60" stroke="currentColor" fill="none" />
          <circle cx="100" cy="100" r="30" stroke="currentColor" fill="none" />
          <circle cx="100" cy="100" r="10" stroke="currentColor" fill="none" />
        </svg>
      ),
      className: "lg:col-start-4 lg:col-end-4 lg:row-start-1 lg:row-end-3",
    },
  ];
  
  export default features;
  