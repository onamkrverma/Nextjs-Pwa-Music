"use client";
import { useGlobalContext } from "@/app/GlobalContex";
import AlbumIcon from "@/public/icons/album.svg";
import PlaylistIcon from "@/public/icons/playlist.svg";
import PlaylistPlayIcon from "@/public/icons/playlist-play.svg";
import DeleteIcon from "@/public/icons/delete.svg";
import MovableIcon from "@/public/icons/movable.svg";
import SaveIcon from "@/public/icons/save.svg";
import MusicIcon from "@/public/icons/music.svg";
import ThreeDotsIcon from "@/public/icons/three-dots.svg";
import { deleteUserPlaylistSongs } from "@/utils/api";
import { TSong } from "@/utils/api.d";
import { useDraggableList } from "@/utils/hook/useDraggableList";
import secondsToTime from "@/utils/secondsToTime";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import ImageWithFallback from "./ImageWithFallback";
import Popup from "./Player/Popup";
import { mutate } from "swr";
import { secureURL } from "@/utils/server";

const LikeDislike = dynamic(() => import("./LikeDislike"), { ssr: false });

type Props = {
  song: TSong;
  playlistId?: string;
  index: number;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  isReordering?: boolean;
  type?: "public" | "private";
};

const SongsCollection = ({
  song,
  playlistId,
  index,
  type,
  moveRow,
  isReordering,
}: Props) => {
  const { setGlobalState, currentSong, authToken, session } =
    useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();
  const moreInfoRef = useRef<HTMLDivElement>(null);

  const [isMoreBtnClick, setIsMoreBtnClick] = useState(false);
  const [isPlaylistPopup, setIsPlaylistPopup] = useState(false);

  const { collectedDropProps, ref: songDivRef } = useDraggableList({
    index,
    type: "song",
    onMove: moveRow,
  });

  const { id, album, artists, downloadUrl, image, name, duration } = song;

  const artistName = artists.all.map((artist) => artist.name).join(" , ");
  const albumName = album.name.replaceAll("&quot;", '"');
  const imageUrl =
    image.find((item) => item.quality === "500x500")?.url ?? "logo-circle.svg";
  const audioUrl = secureURL(
    downloadUrl.find((item) => item.quality === "320kbps")?.url ?? ""
  );

  const handleUpdateState = () => {
    if (isMoreBtnClick) return;
    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        id,
        artist: artistName,
        title: name,
        imageUrl,
        album: albumName,
        audioUrl,
        isMaximise: !session ? false : true,
        isRefetchSuggestion: true,
      },
    }));
    if (!session) {
      return router.push(
        `/login?next=${pathname}${
          pathname === "/search" ? location.search : ""
        }`
      );
    }
  };

  const handleRemoveSongs = async (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    try {
      if (!session || !authToken || !playlistId) return;
      const userId = session?.user?.id ?? "";

      const res = await deleteUserPlaylistSongs({
        authToken,
        userId,
        playlistSongIds: [song.id],
        playlistId,
      });
      setGlobalState((prev) => ({
        ...prev,
        alertMessage: {
          isAlertVisible: true,
          message: res?.message ?? "Success",
        },
      }));
      setIsMoreBtnClick(false);
    } catch (error) {
      if (error instanceof Error)
        setGlobalState((prev) => ({
          ...prev,
          alertMessage: { isAlertVisible: true, message: error.message },
        }));
    }
  };

  const handlePlayNext = async () => {
    if (currentSong.playNextSongId === id) {
      return setGlobalState((prev) => ({
        ...prev,
        alertMessage: {
          isAlertVisible: true,
          message: "Song already added to Play Next",
        },
      }));
    }
    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        ...currentSong,
        playNextSongId: id,
        addToQueueSongId:
          currentSong.addToQueueSongId !== id
            ? currentSong.addToQueueSongId
            : "",
      },
    }));
    setIsMoreBtnClick(false);
    await mutate(`/play-next-songs?id=${id}`);
  };

  const handleAddToQueue = async () => {
    if (currentSong.addToQueueSongId === id) {
      return setGlobalState((prev) => ({
        ...prev,
        alertMessage: {
          isAlertVisible: true,
          message: "Song already added to Queue",
        },
      }));
    }
    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        ...currentSong,
        addToQueueSongId: id,
        playNextSongId:
          currentSong.playNextSongId !== id ? currentSong.playNextSongId : "",
      },
    }));
    setIsMoreBtnClick(false);
    await mutate(`/add-to-queue?id=${id}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        moreInfoRef.current &&
        !moreInfoRef.current.contains(e.target as Node)
      ) {
        setIsMoreBtnClick(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={isReordering ? songDivRef : undefined}
        draggable={isReordering}
        data-handler-id={collectedDropProps.handlerId}
        onClick={!isReordering ? handleUpdateState : undefined}
        className={`flex items-center justify-between sm:gap-4 p-2 ${
          isReordering ? "cursor-move" : "cursor-pointer"
        } hover:bg-secondary relative rounded-md`}
      >
        <div>
          {isReordering ? (
            <MovableIcon className="w-5 h-5 cursor-move" />
          ) : (
            <span className="text-neutral-400 text-sm">{index + 1}</span>
          )}
        </div>
        <ImageWithFallback
          id={id}
          src={imageUrl}
          alt={name + "-okv tunes"}
          width={50}
          height={50}
          className="w-[50px] h-[50px] object-cover rounded-md"
        />
        <div className="song-title-wrapper w-16 sm:w-20 lg:w-full">
          <p className="truncate text-start w-full max-w-[90%]">
            {name.replaceAll("&quot;", '"')}
          </p>
          <small className="truncate w-full text-neutral-400 block sm:hidden">
            {artistName.slice(0, 30)}
          </small>
        </div>
        <small className="truncate w-60 text-neutral-400 hidden sm:block">
          {artistName}
        </small>
        <small className="truncate w-60 text-neutral-400 hidden sm:block">
          {albumName}
        </small>
        <LikeDislike songId={id} />
        <small className="text-neutral-400">{secondsToTime(duration)}</small>
        <button
          type="button"
          title="more"
          className=""
          onClick={(e) => {
            e.stopPropagation();
            setIsMoreBtnClick(!isMoreBtnClick);
          }}
        >
          <ThreeDotsIcon className="w-6 h-6" />
        </button>
        <div
          className={`absolute top-[5%] right-12 bg-neutral-800 border flex-col  p-2 rounded-md z-[5] ${
            isMoreBtnClick ? "flex" : "hidden"
          } `}
          ref={moreInfoRef}
        >
          <button
            type="button"
            className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
            onClick={handlePlayNext}
          >
            <PlaylistPlayIcon className="w-4 h-4" />
            Play next
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
            onClick={handleAddToQueue}
          >
            <PlaylistIcon className="w-4 h-4" />
            Add to queue
          </button>
          {!pathname.includes("/album") ? (
            <Link
              href={`/album/${encodeURIComponent(
                album.name.replaceAll(" ", "-").toLowerCase()
              )}-${album.id}`}
              className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
            >
              <AlbumIcon className="w-4 h-4" />
              Go to album
            </Link>
          ) : null}
          <Link
            href={`/song/${id}`}
            className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
          >
            <MusicIcon className="w-4 h-4" />
            Go to song
          </Link>

          {playlistId && type === "private" ? (
            <button
              type="button"
              className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
              onClick={handleRemoveSongs}
            >
              <DeleteIcon className="w-4 h-4" />
              Remove from playlist
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1 text-xs rounded-md p-2 hover:bg-secondary"
              onClick={(event) => {
                event.stopPropagation();
                setIsPlaylistPopup(true);
              }}
            >
              <SaveIcon className="w-4 h-4" />
              Add to playlist
            </button>
          )}
        </div>
      </div>
      {isPlaylistPopup ? (
        <Popup
          isPopup={isPlaylistPopup}
          setIsPopup={setIsPlaylistPopup}
          id={song.id}
          variant="add-playlist"
        />
      ) : null}
    </>
  );
};

export default SongsCollection;
