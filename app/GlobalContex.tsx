"use client";
import { getLikedSongs, getToken } from "@/utils/api";
import ls from "localstorage-slim";
import { Session } from "next-auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type TCurrentSong = {
  id: string;
  title: string;
  imageUrl: string;
  artist: string;
  audioUrl: string;
  isMaximise: boolean;
  album: string;
  isRefetchSuggestion: boolean;
  volume?: number;
  suggestionSongIds?: string[];
  playNextSongId?: string;
  addToQueueSongId?: string;
};

type TAlertMessage = {
  isAlertVisible: boolean;
  message: string;
};

export type TGlobalState = {
  currentSong: TCurrentSong;
  likedSongsIds: string[];
  alertMessage?: TAlertMessage;
  session?: Session | null;
  authToken?: string | null;
};
export const defaultState: TGlobalState = {
  currentSong: {
    id: "",
    title: "",
    imageUrl: "",
    artist: "",
    audioUrl: "",
    album: "",
    isMaximise: false,
    isRefetchSuggestion: false,
    volume: 1.0,
  },
  likedSongsIds: [],
  alertMessage: {
    isAlertVisible: false,
    message: "",
  },
  session: null,
};
type TGlobalContext = {
  currentSong: TCurrentSong;
  likedSongsIds: string[];
  alertMessage?: TAlertMessage;
  session?: Session | null;
  authToken?: string | null;
  setGlobalState: React.Dispatch<React.SetStateAction<TGlobalState>>;
};

type TGlobalProviderProps = {
  children: ReactNode;
  value?: TGlobalState;
};

export const GlobalContext = createContext<TGlobalContext | null>(null);

export const GlobalContextProvider = ({
  children,
  value,
}: TGlobalProviderProps) => {
  const [globalState, setGlobalState] = useState(value || defaultState);

  const getUserSession = async () => {
    const res = await fetch(`/api/auth/session`);

    const session: Session | null = await res.json();

    const authToken = (await getToken()).authToken;
    if (!session || !authToken) return;
    setGlobalState((prev) => ({
      ...prev,
      session: session,
      authToken: authToken,
    }));

    if (!session.user?.id) return;
    const likedSongsIds = await getLikedSongs({
      authToken,
      userId: session.user.id,
    });

    if (!likedSongsIds) return;
    setGlobalState((prev) => ({
      ...prev,
      likedSongsIds: likedSongsIds,
    }));
  };

  useEffect(() => {
    getUserSession();
  }, []);

  useEffect(() => {
    const localCurrentSongInfo: TCurrentSong | null = ls.get("currentSong", {
      decrypt: true,
    });
    const currentSongInfo: TCurrentSong = localCurrentSongInfo
      ? localCurrentSongInfo
      : defaultState.currentSong;

    localCurrentSongInfo
      ? setGlobalState({
          currentSong: currentSongInfo,
          likedSongsIds: [],
          alertMessage: defaultState.alertMessage,
        })
      : null;
  }, []);

  useEffect(() => {
    if (globalState.alertMessage?.isAlertVisible) {
      const timer = setTimeout(() => {
        setGlobalState((prev) => ({
          ...prev,
          alertMessage: { isAlertVisible: false, message: "" },
        }));
      }, 3000);

      return () => clearTimeout(timer); // Cleanup to avoid memory leaks
    }
  }, [globalState.alertMessage]);

  return (
    <GlobalContext.Provider value={{ ...globalState, setGlobalState }}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === null) {
    throw new Error("Something went wrong!");
  }
  return context;
};
