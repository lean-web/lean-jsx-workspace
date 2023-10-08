export type PromiseStatus = "pending" | "fulfilled" | "rejected";
export interface PendingPromise {
  status: "pending";
  value: unknown;
  error: unknown;
}

export interface FulfilledPromise<T> {
  status: "fulfilled";
  value: T;
  error: unknown;
}

export interface RejectedPromise<E> {
  status: "rejected";
  value: undefined;
  error: E;
}

export type TrackablePromiseState<T, E> =
  | PendingPromise
  | FulfilledPromise<T>
  | RejectedPromise<E>;

export class TrackablePromise<T, E> extends Promise<T> {
  private _status: PromiseStatus = "pending";
  private _promise: Promise<T>;
  private _value: T | undefined;
  private _id?: string;

  constructor(p: Promise<T>, id?: string) {
    super(async (resolve, reject) => {
      try {
        const result = await p;
        this._status = "fulfilled";
        this._value = result;
        resolve(result);
      } catch (err) {
        this._status = "rejected";
        reject(err);
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!p) {
      throw new Error(`Promise must be present`);
    }
    this._id = id;
    this._promise = p;
  }

  isFulfilled(): this is FulfilledPromise<T> {
    return this.status === "fulfilled";
  }

  isRejected(): this is RejectedPromise<E> {
    return this.status === "rejected";
  }

  isPending(): this is PendingPromise {
    return this.status === "pending";
  }

  get status(): PromiseStatus {
    return this._status;
  }

  get promise(): Promise<T> {
    return this._promise;
  }

  get value() {
    if (this.status === "fulfilled") {
      return this._value;
    } else {
      return undefined;
    }
  }

  get id() {
    return this._id;
  }

  get error(): E {
    return undefined as E;
  }
}