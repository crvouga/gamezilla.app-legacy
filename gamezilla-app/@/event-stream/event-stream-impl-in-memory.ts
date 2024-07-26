import type {IEventStreamConfig, IEventStream} from './event-stream';

export type Instance<
	TEventId extends string,
	TEvent,
	TIndexName extends string,
> = {
	/**
	 * Order of msgEvts in the stream
	 */
	_ordering: TEventId[];
	/**
	 * Events in the stream
	 */
	_msgEvts: {
		[msgEvtId in TEventId]?: TEvent;
	};
	/**
	 * Custom indexes of msgEvts in the stream
	 */
	_indexes: {
		[indexName in TIndexName]?: {
			[
				indexKey: string
			]: EventStreamIndex<TEventId>;
		};
	};
	/**
	 * Unique hash of the stream. Used for equality and memoization.
	 */
	_hash: string | number;
};

type EventStreamIndex<TEventId extends string> = {
	_ordering: TEventId[];
	_msgEvts: {
		[msgEvtId in TEventId]?: TEventId;
	};
};

export const EventStreamInMemory = <
	TEventId extends string,
	TEvent,
	TIndexName extends string,
>(): IEventStream<
	TEventId,
	TEvent,
	TIndexName,
	Instance<TEventId, TEvent, TIndexName>
> => {
	type Model = Instance<TEventId, TEvent, TIndexName>;
	return {
		config(config) {
			return config;
		},

		async init(_config) {
			return {
				_msgEvts: {},
				_hash: 0,
				_indexes: {},
				_ordering: [],
			};
		},

		toHash(instance) {
			return instance._hash;
		},

		async latest(_config, instance) {
			const msgEvtId =
				instance
					._ordering[
					instance
						._ordering
						.length -
						1
				];
			if (!msgEvtId) {
				return null;
			}
			const msgEvt =
				instance
					._msgEvts[
					msgEvtId
				];
			if (!msgEvt) {
				return null;
			}
			return msgEvt;
		},

		async get(instance, msgEvtId) {
			return (
				instance
					._msgEvts[
					msgEvtId
				] ?? null
			);
		},

		async append(config, stream, msgEvt) {
			if (
				config.toId(
					msgEvt,
				) in
				stream._msgEvts
			) {
				return stream;
			}

			const newOrdering = [];
			let inserted = false;

			for (
				let i = 0;
				i <
				stream._ordering
					.length;
				i++
			) {
				if (
					!inserted &&
					config.toOrdering(
						stream
							._msgEvts[
							stream
								._ordering[
								i
							]!
						]!,
					) >
						config.toOrdering(
							msgEvt,
						)
				) {
					newOrdering.push(
						config.toId(
							msgEvt,
						),
					);
					inserted =
						true;
				}
				newOrdering.push(
					stream
						._ordering[
						i
					]!,
				);
			}

			if (!inserted) {
				newOrdering.push(
					config.toId(
						msgEvt,
					),
				);
			}

			const newEvents = {
				...stream._msgEvts,
				[config.toId(
					msgEvt,
				)]: msgEvt,
			};

			return {
				_ordering: newOrdering,
				_msgEvts: newEvents,
				_indexes: updateIndexes(
					config,
					{
						_ordering: newOrdering,
						_msgEvts: newEvents,
						_indexes: stream._indexes,
						_hash: stream._hash,
					},
					msgEvt,
				)._indexes,
				_hash: hash(
					newOrdering,
				),
			};
		},

		async mergeLeft(config, left, right) {
			let stream = await this.init(
				config,
			);

			for (const msgEvtId of left._ordering) {
				const msgEvt =
					left
						._msgEvts[
						msgEvtId
					]!;
				stream =
					await this.append(
						config,
						stream,
						msgEvt,
					);
			}

			for (const msgEvtId of right._ordering) {
				const msgEvt =
					right
						._msgEvts[
						msgEvtId
					]!;
				stream =
					await this.append(
						config,
						stream,
						msgEvt,
					);
			}

			return stream;
		},

		async has(instance, msgEvtId) {
			return (
				msgEvtId in
				instance._msgEvts
			);
		},

		async equals(left, right) {
			return (
				left._hash ===
				right._hash
			);
		},

		async subset(
			config,
			instance,
			indexName,
			targetIndexVal,
		) {
			let streamNew = await this.init(
				config,
			);

			const index: EventStreamIndex<TEventId> =
				instance
					._indexes[
					indexName
				]?.[
					targetIndexVal
				] ?? {
					_msgEvts: {},
					_ordering: [],
				};

			for (const msgEvtId of index._ordering) {
				const msgEvt =
					instance
						._msgEvts[
						msgEvtId as TEventId
					];
				if (msgEvt) {
					streamNew =
						await this.append(
							config,
							streamNew,
							msgEvt,
						);
				}
			}

			return streamNew;
		},

		async startingAt(config, instance, msgEvtId) {
			const orderingIndex =
				instance._ordering.indexOf(
					msgEvtId,
				);

			if (
				orderingIndex ===
				undefined
			) {
				return instance;
			}

			const newOrdering =
				instance._ordering.slice(
					orderingIndex,
				);

			const newEvents: Model['_msgEvts'] =
				{};
			let newIndexes: Model['_indexes'] =
				{};

			for (const msgEvtId of newOrdering) {
				newEvents[
					msgEvtId
				] =
					instance._msgEvts[
						msgEvtId
					];
				const updated =
					updateIndexes(
						config,
						{
							_msgEvts: newEvents,
							_indexes: newIndexes,
							_ordering: newOrdering,
							_hash: 0,
						},
						instance
							._msgEvts[
							msgEvtId
						]!,
					);
				newIndexes =
					updated._indexes;
			}

			return {
				_msgEvts: newEvents,
				_hash: hash(
					newOrdering,
				),
				_indexes: newIndexes,
				_ordering: newOrdering,
			};
		},

		async endingAt(config, instance, msgEvtId) {
			const orderingIndex =
				instance._ordering.indexOf(
					msgEvtId,
				);

			if (
				orderingIndex ===
				undefined
			) {
				return instance;
			}

			const newOrdering =
				instance._ordering.slice(
					0,
					orderingIndex +
						1,
				);

			const newEvents: Model['_msgEvts'] =
				{};
			let newIndexes: Model['_indexes'] =
				{};

			for (const msgEvtId of newOrdering) {
				newEvents[
					msgEvtId
				] =
					instance._msgEvts[
						msgEvtId
					];
				const updated =
					updateIndexes(
						config,
						{
							_msgEvts: newEvents,
							_indexes: newIndexes,
							_ordering: newOrdering,
							_hash: 0,
						},
						instance
							._msgEvts[
							msgEvtId
						]!,
					);
				newIndexes =
					updated._indexes;
			}

			return {
				_msgEvts: newEvents,
				_hash: hash(
					newOrdering,
				),
				_indexes: newIndexes,
				_ordering: newOrdering,
			};
		},

		toIterable(instance) {
			return {
				[Symbol.asyncIterator]() {
					let currentIndex = 0;
					return {
						async next() {
							if (
								currentIndex >=
								instance
									._ordering
									.length
							) {
								return {
									done: true,
									value: undefined,
								};
							}

							const msgEvtId =
								instance
									._ordering[
									currentIndex
								]!;

							const msgEvt =
								instance
									._msgEvts[
									msgEvtId
								]!;

							currentIndex++;

							return {
								done: false,
								value: msgEvt,
							};
						},

						return() {
							return Promise.resolve(
								{
									done: true,
									value: undefined,
								},
							);
						},

						throw(
							error,
						) {
							throw error;
						},
					};
				},
			};
		},

		async fromArray(config, msgEvts) {
			let instance = await this.init(
				config,
			);

			for (const msgEvt of msgEvts) {
				instance =
					await this.append(
						config,
						instance,
						msgEvt,
					);
			}

			return instance;
		},

		async toArray(instance) {
			const msgEvts: TEvent[] = [];

			for (const msgEvtId of instance._ordering) {
				msgEvts.push(
					instance
						._msgEvts[
						msgEvtId
					]!,
				);
			}

			return msgEvts;
		},
	};
};

const updateIndexes = <
	TEventId extends string,
	TEvent,
	TIndexName extends string,
>(
	config: IEventStreamConfig<TEventId, TEvent, TIndexName>,
	stream: Instance<TEventId, TEvent, TIndexName>,
	msgEvt: TEvent,
): Instance<TEventId, TEvent, TIndexName> => {
	const indexesNew = {...stream._indexes};

	for (const indexName in config.indexes) {
		const indexKey =
			config.indexes[indexName](
				msgEvt,
			);
		const index = indexesNew[indexName] || {};
		const indexEvents = index[indexKey] || {
			_ordering: [],
			_msgEvts: {},
		};

		let inserted = false;
		const newOrdering = [];
		for (
			let i = 0;
			i <
			indexEvents._ordering.length;
			i++
		) {
			const msgEvt =
				stream
					._msgEvts?.[
					indexEvents
						?._ordering?.[
						i
					]!
				]!;
			if (
				!inserted &&
				(config.toOrdering(
					msgEvt,
				) ??
					Number.NEGATIVE_INFINITY) >
					config.toOrdering(
						msgEvt,
					)
			) {
				newOrdering.push(
					config.toId(
						msgEvt,
					),
				);
				inserted = true;
			}
			newOrdering.push(
				indexEvents
					._ordering[
					i
				]!,
			);
		}
		if (!inserted) {
			newOrdering.push(
				config.toId(
					msgEvt,
				),
			);
		}

		indexEvents._ordering = newOrdering;
		indexEvents._msgEvts = {
			...indexEvents._msgEvts,
			[config.toId(msgEvt)]:
				config.toId(
					msgEvt,
				),
		};
		index[indexKey] = indexEvents;
		indexesNew[indexName] = index;
	}

	return {
		...stream,
		_indexes: indexesNew,
	};
};

function hash<TEventId extends string>(ordering: TEventId[]): string | number {
	return djb2Hash(ordering.join(''));
}

function djb2Hash(str: string) {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash =
			(hash << 5) +
			hash +
			char; /* hash * 33 + c */
	}
	return hash;
}
