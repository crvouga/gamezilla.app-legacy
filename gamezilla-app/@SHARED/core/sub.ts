export type Sub<Msg> = {
	subscribe: (subscriber: (msg: Msg) => void) => () => void;
};

export type Pub<Msg> = {
	publish: (msg: Msg) => void;
	isSubscribed: () => boolean;
};

export type PubSub<Msg> = Pub<Msg> & Sub<Msg>;

const create = <Msg>(): PubSub<Msg> => {
	let runningId = 0;
	const subscribers = new Map<number, (msg: Msg) => void>();
	const queue: Msg[] = [];

	return {
		isSubscribed: () => {
			return subscribers.size > 0;
		},
		subscribe: (subscriber) => {
			runningId++;
			const id = runningId;
			subscribers.set(id, subscriber);
			return () => {
				subscribers.delete(id);
			};
		},
		publish: (msg: Msg) => {
			if (subscribers.size === 0) {
				queue.push(msg);
				return;
			}
			queue.push(msg);
			for (const subscriber of subscribers.values()) {
				for (const msg of queue) {
					subscriber(msg);
				}
			}
			queue.length = 0;
		},
	};
};

const map = <A, B>(sub: Sub<A>, f: (a: A) => B): Sub<B> => {
	return {
		subscribe: (subscriber) => {
			return sub.subscribe((a) => {
				subscriber(f(a));
			});
		},
	};
};

function flatMap<A, B>(sub: Sub<A>, fn: (value: A) => Sub<B>): Sub<B> {
	return {
		subscribe: (subscriber: (msg: B) => void) => {
			const unsubscribeFunctions: Array<() => void> = [];

			const unsubscribeA = sub.subscribe((msgA) => {
				const subB = fn(msgA);
				const unsubscribeB = subB.subscribe(subscriber);
				unsubscribeFunctions.push(unsubscribeB);
			});

			unsubscribeFunctions.push(unsubscribeA);

			return () => {
				unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
			};
		},
	};
}

const batch = <Msg>(arr: Sub<Msg>[]): Sub<Msg> => {
	return {
		subscribe: (subscriber) => {
			const unsubscribeList: (() => void)[] = [];

			for (const sub of arr) {
				unsubscribeList.push(sub.subscribe(subscriber));
			}

			return () => {
				for (const unsubscribe of unsubscribeList) {
					unsubscribe();
				}
			};
		},
	};
};

const None: Sub<never> = {
	subscribe: () => () => {},
};

const flat = <A>(sub: Sub<Iterable<A>>): Sub<A> => {
	return {
		subscribe: (subscriber) => {
			return sub.subscribe((a) => {
				for (const b of a) {
					subscriber(b);
				}
			});
		},
	};
};

const tag = <Tag extends string, Msg>(
	t: Tag,
	sub: Sub<Msg>,
): Sub<{ t: Tag; c: Msg }> => {
	return Sub.map(sub, (c) => ({ t, c }));
};

const toSub = <Msg>(pubSub: PubSub<Msg>): Sub<Msg> => {
	return {
		subscribe: (subscriber) => {
			return pubSub.subscribe(subscriber);
		},
	};
};

const toPub = <Msg>(pubSub: PubSub<Msg>): Pub<Msg> => {
	return {
		publish: (msg) => {
			pubSub.publish(msg);
		},
		isSubscribed: () => {
			return pubSub.isSubscribed();
		},
	};
};

const createSub = <Msg>(): Sub<Msg> => {
	const pubSub = create<Msg>();
	return toSub(pubSub);
};

const createPub = <Msg>(): Pub<Msg> => {
	const pubSub = create<Msg>();
	return toPub(pubSub);
};

export const Sub = {
	map,
	batch,
	create: createSub,
	None,
	flat,
	tag,

	flatMap,
};

export const Pub = {
	create: createPub,
};

export const PubSub = {
	map,
	batch,
	create,
	None,
	flatten: flat,
	tag,
	flatMap,
	toSub,
	toPub,
};
