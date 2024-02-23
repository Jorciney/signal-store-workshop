import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ProgressBarComponent} from '@/shared/ui/progress-bar.component';
import {SortOrder} from '@/shared/models/sort-order.model';
import {AlbumFilterComponent} from './album-filter/album-filter.component';
import {AlbumListComponent} from './album-list/album-list.component';
import {AlbumSearchStore} from "@/albums/album-search/album-search.store";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="albumSearchStore.showProgress()"/>

    <div class="container">
      <h1>Albums ({{ albumSearchStore.totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="albumSearchStore.query()"
        [order]="albumSearchStore.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="albumSearchStore.filteredAlbums()" [showSpinner]="albumSearchStore.showSpinner()"/>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[AlbumSearchStore]
})
export default class AlbumSearchComponent  {

readonly albumSearchStore = inject(AlbumSearchStore);


  updateQuery(query: string): void {
    this.albumSearchStore.updateQuery(query);
  }

  updateOrder(order: SortOrder): void {
    this.albumSearchStore.updateOrder(order);
  }
}
