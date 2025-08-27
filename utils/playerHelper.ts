import { TplayerState } from "@/components/Player";
import { RefObject, SetStateAction } from "react";
import ReactPlayer from "react-player";
import { TSong } from "./api.d";
import { TGlobalState } from "@/app/GlobalContex";

type TMediaSession = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  playerState: TplayerState;
  setPlayerState: (value: SetStateAction<TplayerState>) => void;
  playerRef: RefObject<ReactPlayer | null>;
  getCurrentSongIndex: (songs: TSong[], id: string) => number;
  suggestedSongs: TSong[];
  handlePrev: () => void;
  handleNext: () => void;
};

export const mediaSession = ({
  id,
  title,
  artist,
  imageUrl,
  playerState,
  setPlayerState,
  playerRef,
  getCurrentSongIndex,
  suggestedSongs,
  handleNext,
  handlePrev,
}: TMediaSession) => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      album: artist,
      artwork: [
        {
          src: imageUrl,
          sizes: "96x96",
          type: "image/jpg",
        },
        {
          src: imageUrl,
          sizes: "128x128",
          type: "image/jpg",
        },
        {
          src: imageUrl,
          sizes: "192x192",
          type: "image/jpg",
        },
        {
          src: imageUrl,
          sizes: "256x256",
          type: "image/jpg",
        },
        {
          src: imageUrl,
          sizes: "384x384",
          type: "image/jpg",
        },
        {
          src: imageUrl,
          sizes: "512x512",
          type: "image/jpg",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      setPlayerState({ ...playerState, playing: true });
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      setPlayerState({ ...playerState, playing: false });
    });

    navigator.mediaSession.setActionHandler("seekbackward", () => {
      playerRef.current?.seekTo(playerState.played - 10);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      playerRef.current?.seekTo(playerState.played + 10);
    });

    const currentSongIndex = getCurrentSongIndex(suggestedSongs, id);

    if (currentSongIndex > 0) {
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrev();
      });
    } else {
      // Unset the "previoustrack" action handler at the end of a list.
      navigator.mediaSession.setActionHandler("previoustrack", null);
    }

    if (currentSongIndex !== suggestedSongs.length - 1) {
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNext();
      });
    } else {
      // Unset the "nexttrack" action handler at the end of a playlist.
      navigator.mediaSession.setActionHandler("nexttrack", null);
    }
  }
};

// share song

type THanldeShare = {
  title: string;
  artist: string;
  id: string;
  setGlobalState: (value: SetStateAction<TGlobalState>) => void;
};

export const handleShare = async ({
  title,
  artist,
  id,
  setGlobalState,
}: THanldeShare) => {
  if (!navigator.share) {
    setGlobalState((prev) => ({
      ...prev,
      alertMessage: {
        isAlertVisible: true,
        message: "Sharing is not supported on this browser",
      },
    }));
    return;
  }

  const shareMessage = `Listen to "${title}" by ${artist} on Okv Tunes:\n${window.location.origin}/song/${id}`;

  try {
    await navigator.share({
      title: `Listen to "${title}" by ${artist} on Okv Tunes`,
      text: shareMessage,
      url: `${window.location.origin}/song/${id}`,
    });
  } catch (error) {
    setGlobalState((prev) => ({
      ...prev,
      alertMessage: {
        isAlertVisible: true,
        message: "Sharing failed",
      },
    }));
  }
};
