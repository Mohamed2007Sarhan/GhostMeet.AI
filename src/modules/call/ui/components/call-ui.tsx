import { EventTypes, StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!call) {
      setError("Call object not available. Please check your setup.");
      return;
    }

    if (!call.id) {
      setError("Call ID is missing. Please check if the meeting is properly created.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      console.log("Attempting to join call:", call.id, "State:", call.state.callingState);

      const state = call.state.callingState;

      if (state === "left" || state === "offline" || state === "idle") {
        console.log("Call is idle/offline/left, attempting to join...");
        await call.join();
        console.log("Successfully joined call");
        setShow("call");
      } else if (state === "joined") {
        console.log("Already joined. Switching to call screen.");
        setShow("call");
      } else {
        console.log("Unknown or intermediate state. Trying to join anyway...");
        try {
          await call.join();
          setShow("call");
        } catch (joinError) {
          console.error("Join failed, forcing view to call screen anyway:", joinError);
          setShow("call");
        }
      }
    } catch (err) {
      console.error("❌ Failed to join call:", err);

      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("not found")) {
          setError("This meeting has expired or doesn't exist. Please check the meeting ID.");
        } else if (msg.includes("unauthorized")) {
          setError("Authentication error. Please check your API keys or token.");
        } else {
          setError(`Unexpected error: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred while trying to join the call.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!call) return;

    try {
      console.log("Leaving call:", call.id, "Current state:", call.state.callingState);

      const state = call.state.callingState;

      if (state === "left" || state === "offline") {
        console.log("Already left/offline.");
        setShow("ended");
        return;
      }

      if (state === "joined" || state === "joining") {
        await call.leave();
        console.log("Successfully left the call.");
      }

      setShow("ended");
    } catch (err) {
      console.error("Error while leaving call:", err);
      setShow("ended");
    }
  };

  // Listen for call state changes
  useEffect(() => {
    if (!call) return;

    const handleCallStateChange = () => {
      console.log("Call state changed:", call.state.callingState);

      const state = call.state.callingState;

      if (state === "left" || state === "offline") {
        setShow("ended");
      } else if (state === "joined") {
        setShow("call");
      }
    };

    const eventName = "call.state.changed" as unknown as EventTypes;

    call.on(eventName, handleCallStateChange);
    handleCallStateChange(); // handle initial state

    return () => {
      call.off(eventName, handleCallStateChange);
    };
  }, [call]);

  // UI error screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
        <div className="flex flex-col items-center justify-center gap-y-6 p-10 rounded-lg shadow-sm bg-background">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium text-red-600">Error</h6>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setShow("lobby");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} isJoining={isJoining} />}
      {show === "call" && (
        <CallActive onLeave={handleLeave} meetingName={meetingName} />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
