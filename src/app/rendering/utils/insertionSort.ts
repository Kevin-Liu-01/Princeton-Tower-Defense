/**
 * In-place insertion sort optimized for nearly-sorted arrays.
 * O(n) best-case when already sorted; O(n^2) worst-case but with tiny
 * constant factor and no allocations. Ideal for depth-sorted renderables
 * where entity order barely changes frame-to-frame.
 */
export function insertionSortBy<T>(arr: T[], key: (item: T) => number): void {
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    const currentKey = key(current);
    let j = i - 1;
    while (j >= 0 && key(arr[j]) > currentKey) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = current;
  }
}
