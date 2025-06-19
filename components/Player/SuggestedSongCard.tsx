"use client";
import secondsToTime from "@/utils/secondsToTime";
import React, { MouseEvent } from "react";
import ImageWithFallback from "../ImageWithFallback";
import { useGlobalContext } from "@/app/GlobalContex";
import { TSong } from "@/utils/api.d";
import MovableIcon from "@/public/icons/movable.svg";
import PlayIcon from "@/public/icons/play.svg";
import { useDraggableList } from "@/utils/hook/useDraggableList";
import DeleteIcon from "@/public/icons/delete.svg";
import { secureURL } from "@/utils/server";

type Props = {
  song: TSong;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  handleSongRemoval: (e: MouseEvent<HTMLButtonElement>, id: string) => void;
};

const SuggestedSongCard = ({
  song,
  index,
  moveRow,
  handleSongRemoval,
}: Props) => {
  const { currentSong, setGlobalState } = useGlobalContext();

  const { collectedDropProps, ref: songDivRef } = useDraggableList({
    index,
    type: "suggest-song",
    onMove: moveRow,
  });

  const handleUpdateState = (song: TSong) => {
    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        id: song.id,
        artist: song.artists.primary[0].name,
        title: song.name,
        album: song.album.name.replaceAll("&quot;", '"'),
        imageUrl:
          song.image.find((item) => item.quality === "500x500")?.url ?? "",
        audioUrl: secureURL(
          song.downloadUrl.find((item) => item.quality === "320kbps")?.url ?? ""
        ),
        isMaximise: true,
        isRefetchSuggestion: false,
      },
    }));
  };
  return (
    <div
      ref={songDivRef}
      data-handler-id={collectedDropProps.handlerId}
      className="flex items-center gap-2 p-2 relative cursor-pointer rounded-md hover:bg-secondary"
      onClick={() => handleUpdateState(song)}
    >
      <span>
        <MovableIcon className="w-4 h-4 cursor-move" />
      </span>
      <ImageWithFallback
        src={
          song.image.find((item) => item.quality === "500x500")?.url ??
          "/logo-circle.svg"
        }
        id={song.id}
        alt={song.name + "okv tunes"}
        width={50}
        height={50}
        className="w-[50px] h-[50px] object-cover rounded-md"
      />
      {currentSong.id === song.id ? (
        <PlayIcon className="absolute left-11 w-5 h-5 p-1 rounded-full bg-action animate-spin" />
      ) : null}
      <p className="truncate w-80">{song.name.replaceAll("&quot;", '"')}</p>
      <small className="text-neutral-400">{secondsToTime(song.duration)}</small>
      <button
        type="button"
        title="Remove"
        className="rounded-full bg-action cursor-pointer "
        onClick={(e) => handleSongRemoval(e, song.id)}
      >
        <DeleteIcon className="w-5 h-5 p-0.5" />
      </button>
    </div>
  );
};

export default SuggestedSongCard;
