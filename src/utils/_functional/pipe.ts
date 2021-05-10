type Func<A, B> = (...args: A[]) => B;
export function pipe<A, B>(fn1: Func<A, B>): Func<A, B>;
export function pipe<A, B, C>(fn1: Func<A, B>, fn2: Func<B, C>): Func<A, C>;
export function pipe<A, B, C, D>(
  fn1: Func<A, B>,
  fn2: Func<B, C>,
  fn3: Func<C, D>
): Func<A, D>;
export function pipe<A, B, C, D, E>(
  fn1: Func<A, B>,
  fn2: Func<B, C>,
  fn3: Func<C, D>,
  fn4: Func<D, E>
): Func<A, E>;
export function pipe<A, B, C, D, E, F>(
  fn1: Func<A, B>,
  fn2: Func<B, C>,
  fn3: Func<C, D>,
  fn4: Func<D, E>,
  fn5: Func<E, F>
): Func<A, F>;
export function pipe<A, B, C, D, E, F>(
  fn1: Func<A, B>,
  fn2: Func<B, C>,
  fn3: Func<C, D>,
  fn4: Func<D, E>,
  fn5: Func<E, F>,
  ...operations: Func<any, any>[]
): Func<A, unknown>;
export function pipe(...fns: any) {
  return (x: any): any => fns.reduce((v: any, f: any) => f(v), x);
}
