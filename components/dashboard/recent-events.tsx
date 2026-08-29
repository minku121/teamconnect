import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentEvents({ type, events = [] }: { type: "joined" | "created", events?: any[] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent events found.</p>;
  }

  return (
    <div className="space-y-8">
      {events.map((event, index) => (
        <div className="flex items-center" key={index}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/event-${index + 1}.png`} alt="Event" />
            <AvatarFallback>{event.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{event.name}</p>
            <p className="text-sm text-muted-foreground">
              {type === "joined" ? (
                `Organized by ${event.organizer}`
              ) : (
                `${event.maxParticipants || 0} Participants`
              )}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {new Date(event.date).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}

