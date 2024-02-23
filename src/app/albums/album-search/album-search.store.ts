import {patchState, signalStore, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {AlbumState} from "@/albums/types";
import {computed, inject} from "@angular/core";
import {searchAlbums, sortAlbums} from "@/albums/album.model";
import {SortOrder} from "@/shared/models/sort-order.model";
import {AlbumsService} from "@/albums/albums.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {exhaustMap, filter, pipe, take, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatusFeature
} from "@/shared/state/request-status.feature";

export const AlbumSearchStore = signalStore(
  withState<AlbumState>({
    albums: [],
    query: '',
    order: 'asc',
    showProgress: false,
  }),
  withRequestStatusFeature(),
  withComputed(({albums, query, order, showProgress}) => {
    const filteredAlbums = computed(() => sortAlbums(searchAlbums(albums(), query()), order()));
    const totalAlbums = computed(() => filteredAlbums().length);
    const showSpinner = computed(() => showProgress() && albums().length === 0);
    return {filteredAlbums, totalAlbums, showSpinner};
  }),
  withMethods((store, albumsService = inject(AlbumsService), snackBar = inject(MatSnackBar)) => ({
      updateQuery(query: string): void {
        patchState(store, {query});
      },
      updateOrder(order: SortOrder): void {
        patchState(store, {order});
      },
      loadAllAlbums: rxMethod<void>(pipe(
        take(1),
        tap(() => patchState(store, setPending())),
        exhaustMap(() => albumsService.getAll()),
        tapResponse( // this is a custom operator that keeps the subscription alive when there's an error
          (albums) => patchState(store, {albums}, setFulfilled()),
          (error: { message: string }) => {
            patchState(store, setFulfilled(), setError('Some error:'+ error.message));
            snackBar.open('Failed to load albums', 'Dismiss', {duration: 3_000});
          }
        ),
      )),
      notifyOnError: rxMethod<string | null>(
        pipe(
          filter(Boolean),
          tap((message) => snackBar.open(message, 'Close', {duration: 5_000}))
        )
      ),
    })
  ),
  withHooks(({ //this will also be used in an injection context
      onInit(store) {
          store.loadAllAlbums();
          store.notifyOnError(store.error);
        }
      }
    )
  )
);

