export type Option<T> = Some<T> | None

export type Some<T> = { type: "Some"; value: T }

export const Some = <T>(value: T): Some<T> => ({ type: "Some", value })

export type None = { type: "None" }

export const None: None = { type: "None" }

export const map =
  <A, B>(mapper: (value: A) => B) =>
  (option: Option<A>): Option<B> => {
    switch (option.type) {
      case "None":
        return None

      case "Some":
        return Some(mapper(option.value))
    }
  }
