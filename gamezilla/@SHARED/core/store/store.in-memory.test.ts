import { createStore, init } from "./store.in-memory";

const Store = createStore<{ username: string; userId: string }>();

const now = 1;
const userId = "1";

const store1 = init(now);

const store2A = Store.add(store1, userId, {
  username: "store2A",
  userId,
});

const store2B = Store.add(store1, userId, {
  username: "store2B",
  userId,
});

const store3A = Store.add(store2A, userId, {
  username: "store3A",
  userId,
});

const store3B = Store.add(store2A, userId, {
  username: "store3B",
  userId,
});

const store4 = Store.add(store3A, userId, {
  username: "bobby smith",
  userId,
});

console.log("store1", Store.find(store1, now, userId));
console.log("store2A", Store.find(store2A, now, userId));
console.log("store2B", Store.find(store2B, now, userId));
console.log("store3A", Store.find(store3A, now, userId));
console.log("store3B", Store.find(store3B, now, userId));
console.log("store4", Store.find(store4, now, userId));

/**

store1 []
store2A [ { username: 'store2B', userId: '1' } ]
store2B [ { username: 'store2B', userId: '1' } ]
store3A [
  { username: 'store2B', userId: '1' },
  { username: 'store3B', userId: '1' }
]
store3B [
  { username: 'store2B', userId: '1' },
  { username: 'store3B', userId: '1' }
]
store4 [
  { username: 'store2B', userId: '1' },
  { username: 'store3B', userId: '1' },
  { username: 'bobby smith', userId: '1' }
]

 */
