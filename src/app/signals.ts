import {computed, effect, signal} from "@angular/core";
import {BehaviorSubject, map} from "rxjs";

const count = signal(0);
console.log(count()); // 0
const countPlus1 = computed(() => count() + 1);
console.log(countPlus1()); // 1
count.set(11);
console.log(count()); // 11


count.update(val => val -1);

console.log(countPlus1()); // 10

const count2 = signal(2);
effect(() => {
  console.log('This will be executed everytime that one of those signals changes', count(), count2());
});

count.set(3); // This will trigger the effect
count2.set(4); // This will trigger the effect

// Computed signals can be compared with BehaviorSubject
const count$ = new BehaviorSubject(0);
const countPlus1$ = count$.pipe(map(val => val + 1));

countPlus1$.subscribe(val => console.log(val)); // Its similar to effects
