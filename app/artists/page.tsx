import BackButton from "@/components/BackButton";
import Card from "@/components/Card";
import { topArtist } from "@/utils/topArtists";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Top Artists • Okv-Tunes",
  description:
    "Discover and stream the latest and trending music on Okv Tunes. Enjoy ad-free listening with top hits from popular artists like Arijit Singh, Neha Kakkar, Justin Bieber, Diljit Dosanjh and more",
};

export const dynamic = "force-static";
export const revalidate = false;

const TopArtists = () => {
  return (
    <div className="inner-container flex flex-col gap-6">
      <BackButton />

      <h2 className="text-lg sm:text-2xl font-semibold truncate">
        Popular Artists
      </h2>
      <div className="max-[426px]:grid justify-center grid-cols-2 gap-4 flex flex-wrap items-center">
        {topArtist.map((artist) => (
          <Card
            key={artist.artistid}
            id={artist.artistid}
            title={artist.name}
            imageUrl={artist.image}
            type="artist"
          />
        ))}
      </div>

      <p className="text-neutral-300 text-center">
        {`“ If you cannot find your favorite artists, try using the search bar. ”`}
      </p>
    </div>
  );
};

export default TopArtists;
