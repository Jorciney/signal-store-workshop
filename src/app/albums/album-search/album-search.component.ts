import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {ProgressBarComponent} from '@/shared/ui/progress-bar.component';
import {SortOrder} from '@/shared/models/sort-order.model';
import {searchAlbums, sortAlbums} from '@/albums/album.model';
import {AlbumFilterComponent} from './album-filter/album-filter.component';
import {AlbumListComponent} from './album-list/album-list.component';
import {patchState, signalState} from "@ngrx/signals";
import {AlbumState} from "@/albums/types";
import {AlbumsService} from "@/albums/albums.service";
import {exhaustMap, pipe, take, tap} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {tapResponse} from "@ngrx/operators";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="albumSearchState.showProgress()"/>

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="albumSearchState.query()"
        [order]="albumSearchState.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="filteredAlbums()" [showSpinner]="showSpinner()"/>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent implements OnInit {
  readonly albumSearchState = signalState<AlbumState>({
    albums: [],
    query: '',
    order: 'asc',
    showProgress: false
  });
  readonly filteredAlbums = computed(() => sortAlbums(searchAlbums(this.albumSearchState.albums(), this.albumSearchState.query()), this.albumSearchState.order()));
  readonly totalAlbums = computed(() => this.filteredAlbums().length);
  readonly showSpinner = computed(() => this.albumSearchState.showProgress() && this.albumSearchState.albums().length === 0);
  readonly albumsService = inject(AlbumsService);
  readonly loadAllAlbums = rxMethod<void>(pipe(
    take(1),
    tap(() => patchState(this.albumSearchState, {showProgress: true})),
    exhaustMap(() => this.albumsService.getAll()),
    tapResponse( // this is a custom operator that keeps the subscription alive when there's an error
      (albums) => patchState(this.albumSearchState, {albums, showProgress: false}),
      error => {
        patchState(this.albumSearchState, {showProgress: false});
        inject(MatSnackBar).open('Failed to load albums', 'Dismiss', {duration: 3000});
      }
    ),
  ));

  ngOnInit(): void {
    this.loadAllAlbums();
  }

  updateQuery(query: string): void {
    patchState(this.albumSearchState, {query});
  }

  updateOrder(order: SortOrder): void {
    patchState(this.albumSearchState, {order});
  }
}
