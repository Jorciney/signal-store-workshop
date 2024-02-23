import {effect} from "@angular/core";
import {PartialStateUpdater, patchState, signalState} from "@ngrx/signals";

type User = { firstName: string, lastName: string };
type UserState = { user: User, isAdmin: boolean };
const userState = signalState<UserState>({user: {firstName: 'John', lastName: 'Doe'}, isAdmin: true});
const user = userState.user;
console.log(user());

effect(() => {
  console.log(userState());
});

const isAdmin = userState.isAdmin;
console.log(isAdmin());

const firstName = userState.user.firstName; // when we access it for the first time, the instance will be created
const firstName2 = userState.user.firstName; // this will be the same instance as the previous lines.


// partial state updater
patchState(userState, {isAdmin: false}); // patchState is a function that will update the state and trigger the effect
console.log(isAdmin()); // false


patchState(userState, () => ({isAdmin: true}));

// or you can extract the function, or have multiple functions
const updateIsAdmin = () => ({isAdmin: false});
const updateFirstName = (name: string): PartialStateUpdater<{ user: User }> => (state) => ({
  user: {
    ...state.user,
    lastName: name
  }
});
patchState(userState, updateIsAdmin, updateFirstName('Name'));
