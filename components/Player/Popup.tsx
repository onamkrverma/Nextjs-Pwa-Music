"use client";
import { useGlobalContext } from "@/app/GlobalContex";
import CrossIcon from "@/public/icons/cross.svg";
import MicIcon from "@/public/icons/mic.svg";
import {
  createUserPlaylist,
  getSongs,
  getUserAllPlaylist,
  updateUserPlaylistSongs,
} from "@/utils/api";
import Link from "next/link";
import React, { ChangeEvent, useRef, useState } from "react";
import useSWR from "swr";
import Input from "../Input";
import Loading from "../Loading";

type Props = {
  isPopup: boolean;
  setIsPopup: React.Dispatch<React.SetStateAction<boolean>>;
  id?: string; // song id or playlist id
  playlistTitle?: string;
  playlistVisibility?: "private" | "public";
  variant: "song-info" | "add-playlist" | "edit-playlist" | "voice-search";

  isListening?: boolean;
  startListening?: () => void;
  stopListening?: ({ isClearResult }: { isClearResult?: boolean }) => void;
  transcript?: string;
  errorMessage?: string;
};

const Popup = ({
  isPopup,
  setIsPopup,
  id,
  variant,
  playlistTitle,
  playlistVisibility,
  isListening,
  startListening,
  stopListening,
  transcript,
  errorMessage,
}: Props) => {
  const { session, authToken } = useGlobalContext();
  const [isAddNewPlaylist, setIsAddNewPlaylist] = useState(false);

  const [isPlaylistSaving, setIsPlaylistSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const saveFormRef = useRef<HTMLFormElement>(null);
  const createFormRef = useRef<HTMLFormElement>(null);

  const songFetcher = () => getSongs({ id });
  const { data: songData, isLoading } = useSWR(
    isPopup && variant === "song-info" ? "/song-info" : null,
    songFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const userId = session?.user?.id ?? "";

  const playlistFetcher = () =>
    session && authToken ? getUserAllPlaylist({ authToken, userId }) : null;
  const { data: userPlaylistData, isLoading: isPlaylistLoading } = useSWR(
    isPopup && variant === "add-playlist" ? "/user-playlist" : null,
    playlistFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const urlSlug = (path: string, title: string, id: string) =>
    `/${path}/${encodeURIComponent(
      title.replaceAll(" ", "-").toLowerCase()
    )}-${id}`;

  const handleSaveToPlaylist = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!saveFormRef.current || !session || !authToken || !id) return;
    try {
      setIsPlaylistSaving(true);
      setAlertMessage(null);
      const formData = new FormData(saveFormRef.current);
      const playlistId = formData.get("playlist")?.toString();
      const res = await updateUserPlaylistSongs({
        authToken,
        userId,
        playlistId,
        playlistSongIds: [id],
      });
      setAlertMessage({ message: res?.message ?? "success", type: "success" });
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage({ message: error.message, type: "error" });
      }
    } finally {
      setIsPlaylistSaving(false);
    }
  };
  const handleCreateOrUpdatePlaylist = async (
    e: ChangeEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!createFormRef.current || !session || !authToken || !id) return;
    try {
      setIsPlaylistSaving(true);
      setAlertMessage(null);
      const formData = new FormData(createFormRef.current);
      const title = formData.get("title")?.toString();
      const visibility = formData.get("visibility")?.toString();

      const res =
        variant === "edit-playlist"
          ? await updateUserPlaylistSongs({
              authToken,
              userId,
              playlistTitle: title,
              playlistId: id,
              playlistVisibility: visibility,
            })
          : await createUserPlaylist({
              authToken,
              userId,
              playlistTitle: title,
              playlistSongIds: [id],
              playlistVisibility: visibility,
            });
      setAlertMessage({ message: res?.message ?? "success", type: "success" });
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage({ message: error.message, type: "error" });
      }
    } finally {
      setIsPlaylistSaving(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full z-20 backdrop-blur-sm flex items-center justify-center">
      {/* close popup */}
      <div
        className="h-full w-full absolute top-0"
        onClick={() => {
          setIsPopup(false),
            stopListening && stopListening({ isClearResult: true });
        }}
      ></div>

      <div className="flex flex-col gap-2 p-4 bg-primary rounded-md w-10/12 max-w-md min-h-40 max-h-[500px] z-[2] overflow-scroll">
        <div className="border-b pb-2 flex justify-between items-center">
          <p className="text-lg font-semibold">
            {variant === "song-info"
              ? "Song Info"
              : isAddNewPlaylist
              ? "Create New Playlist"
              : variant === "edit-playlist"
              ? "Edit Playlist info"
              : variant === "add-playlist"
              ? "Add to Playlist"
              : "Speak to Search"}
          </p>
          <button
            type="button"
            title="close"
            className="bg-action p-1 rounded-lg"
            onClick={() => {
              setIsPopup(false),
                stopListening && stopListening({ isClearResult: true });
            }}
          >
            <CrossIcon className="w-4 h-4" />
          </button>
        </div>
        {!isLoading && !isPlaylistLoading ? (
          variant === "song-info" ? (
            <div>
              {songData?.data.map((song) => (
                <div key={song.id} className="flex flex-col gap-2">
                  <p>Song Title: {song.name}</p>
                  <p>ReleaseAt: {song.releaseDate} </p>
                  <p>Language: {song.language} </p>
                  <p>Lable: {song.label}</p>
                  <p>Copyright: {song.copyright}</p>
                  <p>
                    Album:{" "}
                    <Link
                      href={urlSlug("album", song.album.name, song.album.id)}
                      className="underline underline-offset-4"
                    >
                      {song.album.name}
                    </Link>
                  </p>
                  <div className="border-t pt-2 flex flex-col gap-2">
                    <p>Artists info:</p>
                    {song.artists.all.map((artist, index) => (
                      <div key={index}>
                        <Link
                          href={urlSlug("artists", artist.name, artist.id)}
                          className="underline underline-offset-4"
                        >
                          {artist.name}
                        </Link>
                        <small className="text-neutral-400 pl-1">
                          {artist.role}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : // add to playlist
          !isAddNewPlaylist &&
            variant !== "edit-playlist" &&
            userPlaylistData &&
            userPlaylistData.length > 0 ? (
            <form
              className="flex flex-col gap-2"
              ref={saveFormRef}
              onSubmit={handleSaveToPlaylist}
            >
              <div className="flex justify-end items-center">
                <button
                  type="button"
                  title="create new"
                  onClick={() => {
                    setIsAddNewPlaylist(true),
                      setAlertMessage(null),
                      setIsPlaylistSaving(false);
                  }}
                  className="text-primary hover:text-action "
                >
                  {`+ Create New`}
                </button>
              </div>

              <p className="text-lg">Select Playlist</p>
              <div className="select-playlists flex flex-col gap-1 overflow-y-scroll max-h-52">
                {userPlaylistData?.map((playlist) => (
                  <label
                    key={playlist._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="playlist"
                      value={playlist._id}
                      className="w-4 h-4 accent-action cursor-pointer"
                    />
                    {playlist.title}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                title="save"
                disabled={userPlaylistData?.length === 0}
                className="bg-neutral-800 w-full mt-2 text-primary rounded-lg p-1.5 border hover:bg-action"
              >
                {isPlaylistSaving ? <Loading width="6" height="6" /> : "Save"}
              </button>
            </form>
          ) : null
        ) : (
          <Loading loadingText="Loading" />
        )}

        {isAddNewPlaylist ||
        variant === "edit-playlist" ||
        (userPlaylistData && userPlaylistData.length === 0) ? (
          <form
            className="flex flex-col gap-2"
            ref={createFormRef}
            onSubmit={handleCreateOrUpdatePlaylist}
          >
            <Input
              type="text"
              name="title"
              label="Playlist Title"
              defaultValue={playlistTitle}
              minLength={3}
              required
            />
            <label className="flex flex-col gap-2">
              Visibility
              <select
                name="visibility"
                className="bg-secondary p-2 px-3 rounded-lg cursor-pointer focus:ring-1 focus:ring-inset focus-visible:outline-none"
                defaultValue={playlistVisibility}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <div className="flex flex-col text-neutral-400">
              <small>Private playlist: Only you can see it.</small>
              <small>Public playlist: Anyone can see it.</small>
            </div>
            <button
              type="submit"
              title="create"
              className="bg-neutral-800 w-full mt-2 text-primary rounded-lg p-1.5 border hover:bg-action"
            >
              {isPlaylistSaving ? (
                <Loading width="6" height="6" />
              ) : variant === "edit-playlist" ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </form>
        ) : null}

        {variant === "voice-search" ? (
          <div className="flex items-center justify-center gap-2 flex-col py-4">
            <p className="">{errorMessage}</p>
            <p>{transcript}</p>
            {!errorMessage && (
              <>
                <button
                  type="button"
                  title="speak"
                  className={`${
                    isListening
                      ? "bg-red-600 animate-scaleSize"
                      : "bg-neutral-800"
                  } h-full p-4 rounded-full transition-all`}
                  onClick={() =>
                    isListening
                      ? stopListening && stopListening({})
                      : startListening && startListening()
                  }
                >
                  <MicIcon className="size-8" />
                </button>

                <small>
                  {isListening
                    ? "Listening... Click on mic to stop"
                    : "Click on mic then speak"}
                </small>
              </>
            )}
          </div>
        ) : null}

        {alertMessage ? (
          <p
            className={`text-sm my-2 bg-neutral-50 p-1 px-4 rounded-md text-center ${
              alertMessage.type === "error" ? "text-action" : "text-indigo-800"
            }`}
          >
            {alertMessage.message}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Popup;
