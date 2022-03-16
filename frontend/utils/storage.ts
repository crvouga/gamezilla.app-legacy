export type IEncoderDecoder<TValue> = {
  encode: (decoded: TValue) => string;
  decode: (encoded: string) => TValue;
};

export type IStorage<TValue> = {
  read: (key: string) => TValue | null;
  write: (key: string, value: TValue | null) => void;
};

export const createStorageLocal = <TValue>({
  encode,
  decode,
}: IEncoderDecoder<TValue>): IStorage<TValue> => {
  return {
    read: (key) => {
      const item = localStorage.getItem(key);

      if (item) {
        return decode(item);
      }

      return null;
    },
    write: (key, value) => {
      localStorage.setItem(key, value ? encode(value) : String(null));
    },
  };
};

export const createStorageLocalJSON = <TValue>() => {
  return createStorageLocal<TValue>({
    encode: (decoded) => JSON.stringify(decoded),
    decode: (encoded) => JSON.parse(encoded) as TValue,
  });
};
