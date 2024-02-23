import {Component, computed, effect, inject, Injectable, OnInit} from "@angular/core";
import {
  PartialStateUpdater,
  patchState,
  signalState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState
} from "@ngrx/signals";

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


/// SIGNAL STORE

type Todo = { id: number, text: string, completed: boolean };
type TodoState = { todos: Todo[] };
export const TodosStore = signalStore(
  // {providedIn: 'root'}, // if you pass this, it will be a singleton for the whole app and not just the component
  withState<TodoState>({todos: []}),
  withComputed(({todos}) =>
    ({completedTodos: computed(() => todos().filter(todo => todo.completed))})
  ),
  withMethods((store) => ({ //here you can also inject dependencies as it will be in an injection context
    addTodo: (todo: Todo) => patchState(store, {todos: [...store.todos(), todo]})
  })),
  withHooks((store) => ({ //this will also be used in an injection context
      onInit() {
        console.log('this will be used onInit of the component initialized');
      },
      onDestroy() {
        console.log('this will be used onDestroy of the component destroyed');
      }
    })
  ));


const initialState: TodoState ={
  todos:[],
}
@Injectable
class MyTodoStore extends signalStore(withState(initialState)) implements OnInit{
  ngOnInit() {
    console.log(this.todos()); // todos is available because we are extending the store
  }
}

@Component({selector: '',
  template: ``,
  standalone: true,
  providers: [TodosStore]})
export class TodoComponent {
  todoStore = inject(TodosStore);
}
