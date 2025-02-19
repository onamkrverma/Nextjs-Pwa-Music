/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Album': { kind: 'OBJECT'; name: 'Album'; fields: { 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Artist': { kind: 'OBJECT'; name: 'Artist'; fields: { 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'image': { name: 'image'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Image'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'role': { name: 'role'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'type': { name: 'type'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Artists': { kind: 'OBJECT'; name: 'Artists'; fields: { 'all': { name: 'all'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Artist'; ofType: null; }; } }; 'featured': { name: 'featured'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Artist'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Artist'; ofType: null; }; } }; }; };
    'Boolean': unknown;
    'DownloadUrl': { kind: 'OBJECT'; name: 'DownloadUrl'; fields: { 'quality': { name: 'quality'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Image': { kind: 'OBJECT'; name: 'Image'; fields: { 'quality': { name: 'quality'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Int': unknown;
    'PlaylistData': { kind: 'OBJECT'; name: 'PlaylistData'; fields: { 'artists': { name: 'artists'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Artist'; ofType: null; }; } }; 'description': { name: 'description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'explicitContent': { name: 'explicitContent'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'image': { name: 'image'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Image'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'songCount': { name: 'songCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'songs': { name: 'songs'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Song'; ofType: null; }; } }; 'type': { name: 'type'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'playlist': { name: 'playlist'; type: { kind: 'OBJECT'; name: 'PlaylistData'; ofType: null; } }; 'relatedSongs': { name: 'relatedSongs'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Song'; ofType: null; }; } }; 'searchPlaylist': { name: 'searchPlaylist'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'SearchResults'; ofType: null; }; } }; 'searchSongs': { name: 'searchSongs'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Song'; ofType: null; }; } }; 'songs': { name: 'songs'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Song'; ofType: null; }; } }; }; };
    'SearchResults': { kind: 'OBJECT'; name: 'SearchResults'; fields: { 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'image': { name: 'image'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Image'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'role': { name: 'role'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'type': { name: 'type'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'Song': { kind: 'OBJECT'; name: 'Song'; fields: { 'album': { name: 'album'; type: { kind: 'OBJECT'; name: 'Album'; ofType: null; } }; 'artists': { name: 'artists'; type: { kind: 'OBJECT'; name: 'Artists'; ofType: null; } }; 'copyright': { name: 'copyright'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'downloadUrl': { name: 'downloadUrl'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'DownloadUrl'; ofType: null; }; } }; 'duration': { name: 'duration'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'explicitContent': { name: 'explicitContent'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; 'hasLyrics': { name: 'hasLyrics'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'image': { name: 'image'; type: { kind: 'LIST'; name: never; ofType: { kind: 'OBJECT'; name: 'Image'; ofType: null; }; } }; 'label': { name: 'label'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'language': { name: 'language'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'lyricsId': { name: 'lyricsId'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'playCount': { name: 'playCount'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'releaseDate': { name: 'releaseDate'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'type': { name: 'type'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'year': { name: 'year'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'String': unknown;
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: 'Query';
  mutation: never;
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}