import {signalStoreFeature, withComputed, withState} from "@ngrx/signals";
import {computed} from "@angular/core";

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export type RequestStatusState = { requestStatus: RequestStatus };

export const withRequestStatusFeature = () => signalStoreFeature(
  withState<RequestStatusState>({
    requestStatus: 'idle'
  }),
  withComputed(({requestStatus}) => ({
    isPending: computed(() => requestStatus() === 'pending'),
    isFulfilled: computed(() => requestStatus() === 'fulfilled'),
    error: computed(() => {
      const status = requestStatus();
      return typeof status === 'object' ? status.error : null
    })
  }))
);

export function setPending(): RequestStatusState {
  return {requestStatus: 'pending'};
}


export function setFulfilled(): RequestStatusState {
  return ({requestStatus: 'fulfilled'})
}

export function setError(errorMessage: string): RequestStatusState {
  return ({requestStatus: {error: errorMessage}})
}
