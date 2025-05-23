"use client";
import { useGlobalContext } from "@/app/GlobalContex";
import ImageWithFallback from "@/components/ImageWithFallback";
import Loading from "@/components/Loading";
import PlayAllSongs from "@/components/PlayAllSongs";
import SongsCollection from "@/components/SongsCollection";
import RefreshIcon from "@/public/icons/refresh.svg";
import {
  deleteUserPlaylistSongs,
  getSongs,
  getUserPlaylist,
  getUserPublicPlaylist,
  updateUserPlaylistSongs,
} from "@/utils/api";
import { use, useCallback, useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import ThreeDotsIcon from "@/public/icons/three-dots.svg";
import DeleteIcon from "@/public/icons/delete.svg";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import Popup from "@/components/Player/Popup";
import PencilIcon from "@/public/icons/pencil.svg";
import { TSong } from "@/utils/api.d";
import ReorderIcon from "@/public/icons/reorder.svg";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Props = {
  params: Promise<{ playlistslug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const UserPlaylistSongs = ({ params, searchParams }: Props) => {
  const { playlistslug } = use(params);
  const searchParamsRes = use(searchParams);
  const id = playlistslug.split("-").pop() as string;
  const type = searchParamsRes["type"] as "public" | "private";
  const { session, authToken, setGlobalState } = useGlobalContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMoreBtnClick, setIsMoreBtnClick] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const router = useRouter();
  const moreInfoRef = useRef<HTMLDivElement>(null);

  const [isReordering, setIsRerodering] = useState(false);

  const [userPlaylistSongs, setUserPlaylistSongs] = useState<TSong[]>([]);

  useEffect(() => {
    document.title = `User ${type} playlist • Okv-Tunes`;
  }, []);

  const userId = session?.user?.id ?? "";

  const userPlaylistFetcher = () =>
    authToken
      ? type === "public"
        ? getUserPublicPlaylist({ authToken, userId, playlistId: id })
        : getUserPlaylist({ authToken, userId, playlistId: id })
      : null;
  const { data: userPlaylist } = useSWR(
    session ? `/user-playlist?id=${id}` : null,
    userPlaylistFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const playlistSongsFetcher = () =>
    userPlaylist && userPlaylist?.songIds.length > 0
      ? getSongs({ id: userPlaylist.songIds })
      : null;
  const {
    data: playlistSongs,
    isLoading,
    error,
  } = useSWR(
    userPlaylist ? `/playlist-songs?id=${id}` : null,
    playlistSongsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (playlistSongs?.success) {
      setUserPlaylistSongs(playlistSongs.data);
    }
  }, [playlistSongs]);

  const hanldeRefresh = async () => {
    setIsRefreshing(true);
    await mutate(`/user-playlist?id=${id}`);
    if (!isReordering) {
      await mutate(`/playlist-songs?id=${id}`);
    }
    setIsRefreshing(false);
  };

  const handleDeletePlaylist = async () => {
    try {
      if (!session || !id || !authToken) return;
      const userId = session?.user?.id ?? "";

      const res = await deleteUserPlaylistSongs({
        authToken,
        userId,
        playlistId: id,
        isFullDeletePlaylist: true,
      });
      setGlobalState((prev) => ({
        ...prev,
        alertMessage: {
          isAlertVisible: true,
          message: res?.message ?? "Success",
        },
      }));
      setIsMoreBtnClick(false);
      router.replace("/profile");
    } catch (error) {
      if (error instanceof Error)
        setGlobalState((prev) => ({
          ...prev,
          alertMessage: { isAlertVisible: true, message: error.message },
        }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setUserPlaylistSongs((prev) => {
      const updatedList = [...prev];
      const [movedSong] = updatedList.splice(dragIndex, 1);
      updatedList.splice(hoverIndex, 0, movedSong);
      return updatedList;
    });
  }, []);

  const handleUpdateList = async () => {
    if (!authToken) return;
    const songIds = userPlaylistSongs.map((item) => item.id);
    await updateUserPlaylistSongs({
      authToken,
      userId,
      playlistId: id,
      playlistSongIds: songIds,
      isReorder: true,
    });
    await hanldeRefresh();
  };

  return (
    <div className="inner-container flex flex-col gap-6 relative">
      <BackButton />

      <div className="flex justify-end items-center absolute right-4">
        {type === "private" ? (
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
        ) : null}

        <div
          className={`absolute top-4 right-6 bg-neutral-800 w-36 p-1 border flex-col rounded-md z-[5]  ${
            isMoreBtnClick ? "flex" : "hidden"
          } `}
          ref={moreInfoRef}
        >
          <button
            type="button"
            title="edit playlist"
            className="flex items-center gap-1 text-xs p-2 rounded-md hover:bg-secondary"
            onClick={() => setIsPopup(true)}
          >
            <PencilIcon className="w-4 h-4" />
            Edit Info
          </button>
          <button
            type="button"
            title="delete playlist"
            className="flex items-center gap-1 text-xs p-2 rounded-md hover:bg-secondary"
            onClick={handleDeletePlaylist}
          >
            <DeleteIcon className="w-4 h-4" />
            Delete playlist
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-col flex-wrap sm:flex-row items-center">
        <div className="w-[200px] h-[200px]">
          <ImageWithFallback
            id={
              playlistSongs?.data && playlistSongs?.data.length > 0
                ? playlistSongs.data[0].id
                : id
            }
            src={
              playlistSongs?.data && playlistSongs?.data.length > 0
                ? playlistSongs?.data[0].image.find(
                    (item) => item.quality === "500x500"
                  )?.url
                : "/logo-circle.svg"
            }
            alt={
              playlistSongs?.data && playlistSongs?.data.length > 0
                ? playlistSongs?.data[0].name
                : "poster" + "-okv tunes"
            }
            width={200}
            height={200}
            className="w-full h-full object-cover rounded-md "
          />
        </div>
        <div className="flex flex-col gap-2 items-center sm:items-start w-full max-w-sm">
          <h1 className="capitalize text-xl sm:text-2xl font-bold text-center sm:text-start">
            {userPlaylist?.title}
          </h1>
          <div className="flex flex-col gap-1 items-center sm:items-start">
            <small className="text-neutral-300 text-center sm:text-start capitalize">
              Visibility: {userPlaylist?.visibility}
            </small>
            <small className="text-neutral-300 text-center sm:text-start capitalize flex items-center gap-2">
              <span className="uppercase bg-neutral-800 border text-primary rounded-full flex justify-center items-center h-8 w-8 text-center font-bold">
                {userPlaylist?.createdBy?.at(0) ?? "G"}
              </span>
              Playlist Created By: {userPlaylist?.createdBy}
            </small>
          </div>
          {playlistSongs?.data && playlistSongs?.data.length > 0 ? (
            <PlayAllSongs
              firstSong={playlistSongs?.data[0]}
              suggestionSongIds={playlistSongs?.data
                .slice(1, 16)
                .map((item) => item.id)}
            />
          ) : null}
        </div>
      </div>
      {error ? (
        <div className="flex items-center justify-center bg-white text-action">
          <p>{error.message}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 my-4">
          {!isLoading && userPlaylist ? (
            <div className="flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRerodering(!isReordering)}
                className="flex items-center justify-center gap-2 text-xs border bg-neutral-800 hover:bg-secondary rounded-md p-1 px-2"
              >
                <ReorderIcon
                  className={`w-4 h-4 transition-colors ${
                    isReordering ? "text-[#00ff0a]" : ""
                  }`}
                />
                Reorder
              </button>
              <button
                type="button"
                onClick={!isReordering ? hanldeRefresh : handleUpdateList}
                className="flex items-center justify-center gap-2 text-xs border bg-neutral-800 hover:bg-secondary rounded-md p-1 px-2"
              >
                <RefreshIcon
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {!isReordering ? "Refresh" : "Update"}
              </button>
            </div>
          ) : null}
          <DndProvider backend={HTML5Backend}>
            {!isLoading && userPlaylist ? (
              playlistSongs && playlistSongs?.data?.length > 0 ? (
                userPlaylistSongs.map((song, index) => (
                  <SongsCollection
                    key={song.id}
                    song={song}
                    playlistId={userPlaylist._id}
                    index={index}
                    type={type}
                    moveRow={moveRow}
                    isReordering={isReordering}
                  />
                ))
              ) : (
                <div className="text-center flex flex-col items-center justify-center gap-2 min-h-40">
                  <p className="text-lg font-bold">
                    No song found in this playlist
                  </p>
                  <small className="text-neutral-400">
                    User saved playlist songs will be displayed here. If this is
                    your playlist, please add songs to see them appear.
                  </small>
                </div>
              )
            ) : (
              <Loading loadingText="Loading" />
            )}
          </DndProvider>
        </div>
      )}
      {isPopup ? (
        <Popup
          isPopup={isPopup}
          setIsPopup={setIsPopup}
          id={id}
          variant="edit-playlist"
          playlistTitle={userPlaylist?.title}
          playlistVisibility={userPlaylist?.visibility}
        />
      ) : null}
    </div>
  );
};

export default UserPlaylistSongs;
