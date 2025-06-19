"use client";
import { useGlobalContext } from "@/app/GlobalContex";
import ImageWithFallback from "@/components/ImageWithFallback";
import CaretUpIcon from "@/public/icons/caret-up.svg";
import DownloadIcon from "@/public/icons/download.svg";
import InfoIcon from "@/public/icons/info.svg";
import ThreeDotsIcon from "@/public/icons/three-dots.svg";
import { getDownloadAudio, getSongs, getSuggestedSongs } from "@/utils/api";
import { TSong } from "@/utils/api.d";
import useWindowDimensions from "@/utils/hook/useWindowDimensions";
import ls from "localstorage-slim";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import useSWR, { mutate } from "swr";
import MiniPlayer from "./MiniPlayer";
import Popup from "./Popup";
import SuggestedSongs from "./SuggestedSongs";
import { secureURL } from "@/utils/server";

export type TplayerState = {
  url: string;
  playing: boolean;
  controls: boolean;
  volume: number;
  muted: boolean;
  played: number;
  loaded?: number;
  autoPlay: boolean;
  loop: boolean;
};

const Plalyer = () => {
  const { currentSong, setGlobalState, session } = useGlobalContext();
  const {
    id,
    imageUrl,
    title,
    isMaximise,
    artist,
    audioUrl,
    isRefetchSuggestion,
    volume,
    suggestionSongIds,
  } = currentSong;
  const [playerState, setPlayerState] = useState<TplayerState>({
    url: "",
    playing: false,
    controls: false,
    volume: volume ?? 1.0,
    muted: false,
    loop: false,
    played: 0, // in seconds
    loaded: 0,
    autoPlay: false,
  });
  const playerRef = useRef<ReactPlayer>(null);
  const [isMoreBtnClick, setIsMoreBtnClick] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pathName = usePathname();
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [suggestedSongs, setSuggestedSongs] = useState<TSong[]>([]);

  const { height: screenHeight } = useWindowDimensions();

  currentSong.id
    ? ls.set(
        "currentSong",
        { ...currentSong, volume: playerState.volume },
        { encrypt: true }
      )
    : null;

  useEffect(() => {
    document.body.style.overflow = isMaximise ? "hidden" : "auto";
  }, [isMaximise]);

  const dataFetcher = () =>
    suggestionSongIds?.length
      ? getSongs({ id: suggestionSongIds })
      : getSuggestedSongs({ id: id, limit: 20 });
  const {
    data: suggestedSongsData,
    isLoading,
    error,
  } = useSWR(id || suggestionSongIds ? "/suggested-songs" : null, dataFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (!isRefetchSuggestion) return;
    mutate("/suggested-songs");
  }, [isRefetchSuggestion]);

  useEffect(() => {
    if (suggestedSongsData?.success) {
      setSuggestedSongs(suggestedSongsData.data);
    }
  }, [suggestedSongsData]);

  const getCurrentSongIndex = (songs: TSong[], id: string) => {
    return songs.findIndex((item) => item.id === id);
  };

  const updateNextPrevTrack = (type: "prev" | "next") => {
    const currentSongIndex = getCurrentSongIndex(suggestedSongs, id);

    const updatorValue = type === "prev" ? -1 : 1;
    let updateSongIndex = currentSongIndex + updatorValue;
    if (currentSongIndex === -1) {
      updateSongIndex = 0;
    }
    // disable next click on last song
    if (updateSongIndex === suggestedSongs.length) return;
    const nextSong = suggestedSongs[updateSongIndex];

    if (!nextSong) return;

    const {
      id: nextId,
      name: nextTitle,
      artists,
      image,
      downloadUrl,
      album,
    } = nextSong;
    const nextArtist = artists.primary[0].name;
    const albumName = album.name.replaceAll("&quot;", '"');

    const nextImageUrl =
      image.find((item) => item.quality === "500x500")?.url ?? "";
    const nextAudioUrl = secureURL(
      downloadUrl.find((item) => item.quality === "320kbps")?.url ?? ""
    );

    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        id: nextId,
        title: nextTitle,
        artist: nextArtist,
        album: albumName,
        imageUrl: nextImageUrl,
        audioUrl: nextAudioUrl,
        isRefetchSuggestion: false,
        isMaximise: currentSong.isMaximise,
      },
    }));
  };

  const handleNext = () => {
    updateNextPrevTrack("next");
    setPlayerState({ ...playerState, autoPlay: true, playing: true });
  };

  const handlePrev = () => {
    updateNextPrevTrack("prev");
  };

  useEffect(() => {
    setGlobalState((prev) => ({
      ...prev,
      currentSong: { ...currentSong, isRefetchSuggestion: false },
    }));

    // set url on songs changes
    setPlayerState((prev) => ({
      ...prev,
      url: audioUrl,
    }));

    if (suggestedSongs.length) {
      const currentSongIndex = getCurrentSongIndex(suggestedSongs, id);

      // set auto play false on last song
      setPlayerState((prev) => ({
        ...prev,
        autoPlay:
          currentSongIndex === suggestedSongs.length - 1
            ? false
            : playerState.autoPlay,
      }));
    }

    // eslint-disable-next-line
  }, [audioUrl]);

  // media session
  useEffect(() => {
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

    // eslint-disable-next-line
  }, [currentSong, playerState]);

  // minimise player on router change
  useEffect(() => {
    setGlobalState((prev) => ({
      ...prev,
      currentSong: { ...currentSong, isMaximise: false },
    }));
    setIsPopup(false);
    // eslint-disable-next-line
  }, [pathName]);

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        moreBtnRef.current &&
        !moreBtnRef.current.contains(e.target as Node)
      ) {
        setIsMoreBtnClick(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    setGlobalState((prev) => ({
      ...prev,
      alertMessage: {
        isAlertVisible: true,
        message: "Downloading... Please wait😊",
      },
    }));
    const { audioUrl, title, album, artist } = currentSong;
    const audioId = audioUrl.match(/com\/(.*)\.mp4/)?.[1] ?? "";
    getDownloadAudio({ audioId: audioId, album, artists: artist, title });
    setTimeout(() => {
      setGlobalState((prev) => ({
        ...prev,
        alertMessage: { isAlertVisible: false, message: "" },
      }));
      setIsDownloading(false);
    }, 30 * 1000);
  };

  return (
    <div>
      {session && id ? (
        <>
          <div
            className={`!mt-0 fixed top-0 right-0 left-0 bg-primary flex gap-4 sm:justify-evenly sm:!pt-0 flex-col md:flex-row items-center h-full z-[11] transition-transform duration-700 ${
              isMaximise ? "translate-y-0" : "translate-y-[150%]"
            } ${screenHeight > 850 ? "!pt-40" : "!pt-20"}`}
          >
            <div className="w-full flex justify-between items-center absolute top-3 px-4">
              <button
                type="button"
                title={isMaximise ? "minimise" : "maximise"}
                className={`transition-transform ${
                  isMaximise ? "rotate-180" : "rotate-0"
                }`}
                onClick={() =>
                  setGlobalState((prev) => ({
                    ...prev,
                    currentSong: {
                      ...currentSong,
                      isMaximise: !currentSong.isMaximise,
                    },
                  }))
                }
              >
                <CaretUpIcon className={`w-6 h-6 `} />
              </button>
              <button
                type="button"
                title="more"
                className=""
                onClick={() => setIsMoreBtnClick(!isMoreBtnClick)}
                ref={moreBtnRef}
              >
                <ThreeDotsIcon className={`w-6 h-6 `} />
              </button>
            </div>

            <div
              className={` absolute top-0 right-10 z-10 bg-secondary flex flex-col gap-2 p-2 px-3 rounded-md transition-transform duration-500 ${
                isMoreBtnClick ? "translate-y-8" : "-translate-y-full"
              } `}
            >
              <button
                type="button"
                className="flex items-center gap-1 p-1 rounded-lg hover:bg-neutral-800"
                onClick={() => setIsPopup(true)}
              >
                <InfoIcon className="w-4 h-4" />
                Info
              </button>
              <button
                type="button"
                className="flex items-center gap-1 p-1 rounded-lg hover:bg-neutral-800 disabled:bg-gray-600"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </button>
            </div>

            <div
              className={`absolute w-full h-full blur-[650px] -z-10 pointer-events-none ${
                !isMaximise ? "hidden" : "block"
              }`}
            >
              <ImageWithFallback
                id={currentSong.id}
                src={imageUrl}
                fallbackSrc={"/logo-circle.svg"}
                alt={title + " okv tunes"}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
            <ReactPlayer
              ref={playerRef}
              onPlay={() => setPlayerState({ ...playerState, playing: true })}
              onPause={() => setPlayerState({ ...playerState, playing: false })}
              onEnded={() => (playerState.autoPlay ? handleNext() : null)}
              onProgress={(state) =>
                setPlayerState({
                  ...playerState,
                  played: state.playedSeconds,
                })
              }
              {...playerState}
              className="hidden"
            />
            <div
              className={`flex flex-col items-center ${
                screenHeight > 850 ? "gap-12" : "gap-4"
              }`}
            >
              {/* song poster */}
              <div
                className={`sm:w-[150px] md:w-[250px] lg:w-[350px] ${
                  screenHeight > 640
                    ? "w-[80%]"
                    : screenHeight > 850
                    ? "w-11/12"
                    : "w-9/12"
                }`}
              >
                <ImageWithFallback
                  id={currentSong.id}
                  src={imageUrl}
                  fallbackSrc={"/logo-circle.svg"}
                  alt={title + " okv tunes"}
                  width={350}
                  height={350}
                  className="w-full h-auto  object-cover rounded-lg"
                />
              </div>
              <div className="flex sm:hidden flex-col items-center w-full max-w-60">
                <p className="truncate text-2xl w-full text-center">
                  {title?.replaceAll("&quot;", '"')}
                </p>
                <small className="truncate text-neutral-300 w-full text-center">
                  {artist}
                </small>
              </div>
            </div>
            {/* upcomming tracks */}
            <SuggestedSongs
              suggestedSongs={suggestedSongs}
              setSuggestedSongs={setSuggestedSongs}
              isLoading={isLoading}
              playerState={playerState}
              setPlayerState={setPlayerState}
              error={error}
            />
          </div>
          <MiniPlayer
            playerRef={playerRef}
            playerState={playerState}
            setPlayerState={setPlayerState}
            handleNext={handleNext}
            handlePrev={handlePrev}
          />
          {isPopup ? (
            <Popup
              isPopup={isPopup}
              setIsPopup={setIsPopup}
              id={id}
              variant="song-info"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default Plalyer;
