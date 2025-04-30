import { getPlaylists } from "@/utils/api";
import Link from "next/link";
import React from "react";
import Card from "./Card";
import { topArtist } from "@/utils/topArtists";

type Props = {
  id?: string;
  title: string;
  type: "song" | "artist";
};

const CardCollection = async ({ type, id, title }: Props) => {
  const playlist = type === "song" ? await getPlaylists({ id: id }) : null;

  const urlSlug =
    type == "song"
      ? `/playlist/${encodeURIComponent(
          title.replaceAll(" ", "-").toLowerCase()
        )}-${id}`
      : "/artists";

  return (
    <div
      className={`flex-col gap-4 ${
        type === "song" && !playlist?.data.songs.length ? "hidden" : "flex"
      } `}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold truncate">{title}</h2>
        <Link
          href={`${urlSlug}`}
          className="text-sm font-medium text-neutral-200 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="flex items-center gap-4 p-1.5 overflow-x-auto">
        {type === "song"
          ? playlist?.data.songs.map((song) => (
              <Card
                key={song.id}
                id={song.id}
                title={song.name}
                imageUrl={
                  song.image.find((item) => item.quality === "500x500")?.url ??
                  "/logo-circle.svg"
                }
                artist={song.artists.primary[0].name}
                album={song.album.name.replaceAll("&quot;", '"')}
                audioUrl={
                  song.downloadUrl.find((item) => item.quality === "320kbps")
                    ?.url ?? ""
                }
                type="song"
              />
            ))
          : topArtist
              .slice(0, 10)
              .map((artist) => (
                <Card
                  key={artist.artistid}
                  id={artist.artistid}
                  title={artist.name}
                  imageUrl={artist.image}
                  type="artist"
                />
              ))}
      </div>
    </div>
  );
};

export default CardCollection;
