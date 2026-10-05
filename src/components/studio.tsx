import { useEffect } from "react";
import { loadSongs } from "@/lib/songs";
import { useStudio } from "@/lib/studio";
import { GalleryScreen } from "@/components/screens/gallery";
import { HomeScreen } from "@/components/screens/home";
import { PieceScreen } from "@/components/screens/piece";
import { SetupScreen, SplashScreen } from "@/components/screens/setup";
import { BookScreen, ReaderScreen, TempoScreen, TunerScreen } from "@/components/screens/songbook";
import { StageScreen } from "@/components/screens/stage";

export function Studio() {
  const screen = useStudio((state) => state.stack[state.stack.length - 1] ?? { name: "home" as const });
  const setSongs = useStudio((state) => state.setSongs);

  useEffect(() => {
    setSongs(loadSongs());
  }, [setSongs]);

  if (screen.name === "gallery") return <GalleryScreen />;
  if (screen.name === "setup") return <SetupScreen />;
  if (screen.name === "splash") return <SplashScreen config={screen.config} />;
  if (screen.name === "stage") return <StageScreen config={screen.config} />;
  if (screen.name === "piece") return <PieceScreen id={screen.id} />;
  if (screen.name === "book") return <BookScreen />;
  if (screen.name === "read") return <ReaderScreen id={screen.id} />;
  if (screen.name === "tuner") return <TunerScreen />;
  if (screen.name === "tempo") return <TempoScreen />;
  return <HomeScreen />;
}
