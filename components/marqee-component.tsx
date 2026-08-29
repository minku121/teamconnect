import { cn } from "@/lib/utils";
import Marquee from "./ui/marquee";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Sarah Jenkins",
    username: "@sarahj",
    body: "Hosting our annual summit was incredibly smooth. The instant certificates saved us days of manual work.",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "David Chen",
    username: "@david_c",
    body: "The stream quality is fantastic. My attendees loved the real-time chat and engagement features.",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Marcus",
    username: "@marcus_dev",
    body: "Issuing certificates used to be a nightmare. Now it's literally one click after the event ends.",
    img: "https://avatar.vercel.sh/marcus",
  },
  {
    name: "Elena",
    username: "@elena_codes",
    body: "As an attendee, getting my completion certificate immediately after the workshop was super satisfying.",
    img: "https://avatar.vercel.sh/elena",
  },
  {
    name: "Alex",
    username: "@alex_startup",
    body: "Finally, a platform that doesn't overcomplicate virtual events. Exactly what we needed.",
    img: "https://avatar.vercel.sh/alex",
  },
  {
    name: "Rachel",
    username: "@rachel_tech",
    body: "The best platform for hosting developer workshops. The latency is practically non-existent.",
    img: "https://avatar.vercel.sh/rachel",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-transparent hover:bg-opacity-35",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-transparent dark:hover:bg-opacity-35",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent md:shadow-xl">
      <div className="absolute  z-10 inset-y-0 left-0 w-2/5 bg-gradient-to-r from-white  dark:from-black to-transparent  pointer-events-none"></div>
      <div className="absolute z-10 inset-y-0 right-0 w-2/5 bg-gradient-to-l from-white   dark:from-black to-transparent pointer-events-none"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}

          
        </Marquee>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </motion.div>
    </div>
  );
}
