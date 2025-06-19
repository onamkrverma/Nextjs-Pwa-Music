"use client";
import { useGlobalContext } from "@/app/GlobalContex";
import PlayIcon from "@/public/icons/play.svg";
import { TSong } from "@/utils/api.d";
import { secureURL } from "@/utils/server";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  firstSong: TSong;
  suggestionSongIds: string[];
};

const PlayAllSongs = ({ firstSong, suggestionSongIds }: Props) => {
  const { setGlobalState, session } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();

  const { id, artists, downloadUrl, image, name, album } = firstSong;

  const artistName = artists.all.map((artist) => artist.name).join(" , ");
  const albumName = album.name.replaceAll("&quot;", '"');

  const imageUrl =
    image.find((item) => item.quality === "500x500")?.url ?? "logo-circle.svg";
  const audioUrl = secureURL(
    downloadUrl.find((item) => item.quality === "320kbps")?.url ?? ""
  );

  const handleUpdateState = () => {
    setGlobalState((prev) => ({
      ...prev,
      currentSong: {
        id,
        artist: artistName,
        title: name,
        imageUrl,
        audioUrl,
        album: albumName,
        isMaximise: !session ? false : true,
        isRefetchSuggestion: true,
        suggestionSongIds: suggestionSongIds,
        isPlayAll: true,
      },
    }));
    if (!session) {
      return router.push(`/login?next=${pathname}`);
    }
  };

  return (
    <button
      title="play all"
      type="button"
      onClick={handleUpdateState}
      className="group flex items-center justify-center w-14 h-14 border bg-action hover:bg-neutral-800 rounded-full"
    >
      <PlayIcon className="w-6 h-6" />
    </button>
  );
};

export default PlayAllSongs;
