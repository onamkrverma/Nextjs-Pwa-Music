'use client';
import { getPlaylists } from '@/utils/api';
import Link from 'next/link';
import React from 'react';
import Card from './Card';
import { topArtist } from '@/utils/topArtists';
import { secureURL } from '@/utils/server';
import useSWR from 'swr';

type Props = {
  id?: string;
  title: string;
  type: 'song' | 'artist';
  length?: number;
};

const CardCollection = ({ type, id, title, length }: Props) => {
  const playlistFetcher = () =>
    type === 'song' ? getPlaylists({ id: id }) : null;

  const { data: playlist, isLoading } = useSWR(
    type === 'song' ? `/playlist?id=${id}` : null,
    playlistFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const urlSlug =
    type == 'song'
      ? `/playlist/${encodeURIComponent(
          title.replaceAll(' ', '-').toLowerCase()
        )}-${id}`
      : '/artists';

  return (
    <div
      className={`flex-col gap-4 ${
        type === 'song' && !playlist?.data.songs.length ? 'hidden' : 'flex'
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
        {type === 'song'
          ? !isLoading
            ? playlist?.data.songs.map((song) => (
                <Card
                  key={song.id}
                  id={song.id}
                  title={song.name}
                  imageUrl={
                    song.image.find((item) => item.quality === '500x500')
                      ?.url ?? '/logo-circle.svg'
                  }
                  artist={song.artists.primary[0].name}
                  album={song.album.name.replaceAll('&quot;', '"')}
                  audioUrl={secureURL(
                    song.downloadUrl.find((item) => item.quality === '320kbps')
                      ?.url ?? ''
                  )}
                  type="song"
                />
              ))
            : // loading skeleton
              Array(length)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 w-[150px] sm:w-[180px] rounded-md cursor-not-allowed animate-pulse"
                  >
                    <div className="w-[150px] sm:w-[180px] relative">
                      <div className="w-full h-[180px] bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                      <span className="hidden group-hover:flex transition-colors duration-500 absolute top-0 w-full h-full items-center justify-center backdrop-brightness-50 rounded-md">
                        <div className="w-8 h-8 bg-gray-400 rounded-full z-[1]"></div>
                        <span className="absolute w-14 h-14 rounded-full bg-gray-400/80 transition-transform duration-500 scale-100"></span>
                      </span>
                    </div>
                    <p className="w-full px-2 pb-2 text-center">
                      <span className="block h-4 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mx-auto"></span>
                    </p>
                  </div>
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
