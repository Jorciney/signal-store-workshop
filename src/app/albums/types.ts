import {Album} from "./album.model";
import {SortOrder} from "@/shared/models/sort-order.model";

export type AlbumState = { albums: Album[], showProgress: boolean, query: string, order: SortOrder };
