import { getSongs } from "@/utils/api";
import BackButton from "@/components/BackButton";
import ImageWithFallback from "@/components/ImageWithFallback";
import PlayAllSongs from "@/components/PlayAllSongs";
import SongsCollection from "@/components/SongsCollection";
import Link from "next/link";

export const revalidate = 864000;
export const dynamic = "force-static";

type Props = {
  params: Promise<{ id: string }>;
};

const SongInfo = async ({ params }: Props) => {
  const paramRes = await params;
  const id = paramRes.id;

  const song = await getSongs({
    id: id,
  });

  const {
    name,
    image,
    releaseDate,
    album,
    label,
    language,
    copyright,
    artists,
  } = song.data[0];

  const urlSlug = (path: string, title: string, id: string) =>
    `/${path}/${encodeURIComponent(
      title.replaceAll(" ", "-").toLowerCase()
    )}-${id}`;

  return (
    <div className="inner-container flex flex-col gap-6">
      <BackButton />
      <div className="flex gap-4 flex-col flex-wrap sm:flex-row items-center ">
        <div className="w-[200px] h-[200px]">
          <ImageWithFallback
            id={id}
            src={
              image.find((item) => item.quality === "500x500")?.url ??
              "/logo-circle.svg"
            }
            alt={name + " -okv tunes"}
            width={200}
            height={200}
            className="w-full h-full object-cover rounded-md "
          />
        </div>
        <div className="flex flex-col items-center sm:items-start gap-2 w-full max-w-sm">
          <h1 className="capitalize text-xl sm:text-2xl font-bold text-center sm:text-start">
            {name}
          </h1>

          {
            <PlayAllSongs
              firstSong={song.data[0]}
              suggestionSongIds={song.data.slice(1, 16).map((item) => item.id)}
            />
          }
        </div>
      </div>

      <div className="flex flex-col gap-4 my-4">
        <SongsCollection song={song.data[0]} index={0} isReordering={false} />
      </div>

      <div className="">
        <h2 className="text-lg font-bold">More details</h2>
        <div className="flex flex-col sm:flex-row gap-4 text-neutral-400 my-2">
          <div className="flex flex-col gap-2">
            <p>ReleaseAt: {releaseDate} </p>
            <p>Language: {language} </p>
            <p>Lable: {label}</p>
            <p>Copyright: {copyright}</p>
            <p>
              Album:{" "}
              <Link
                href={urlSlug("album", album.name, album.id)}
                className="underline underline-offset-4"
              >
                {album.name}
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p>Artists info:</p>
            {artists.all.map((artist, index) => (
              <div key={index}>
                <Link
                  href={urlSlug("artists", artist.name, artist.id)}
                  className="underline underline-offset-4"
                >
                  {artist.name}
                </Link>
                <small className="text-neutral-400 pl-1">: {artist.role}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongInfo;
