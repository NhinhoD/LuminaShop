import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getPageNumbers } from './PaginationControls';

describe('PaginationControls - getPageNumbers windowing algorithm', () => {
  it('returns single page array when totalPages is 1 or less', () => {
    assert.deepStrictEqual(getPageNumbers(1, 1), [1]);
    assert.deepStrictEqual(getPageNumbers(1, 0), [1]);
  });

  it('returns all page numbers directly when totalPages is 7 or less', () => {
    assert.deepStrictEqual(getPageNumbers(1, 5), [1, 2, 3, 4, 5]);
    assert.deepStrictEqual(getPageNumbers(3, 7), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepStrictEqual(getPageNumbers(7, 7), [1, 2, 3, 4, 5, 6, 7]);
  });

  it('renders start window with trailing ellipsis when currentPage <= 4 in large list', () => {
    assert.deepStrictEqual(getPageNumbers(1, 10), [1, 2, 3, 4, 5, '...', 10]);
    assert.deepStrictEqual(getPageNumbers(2, 10), [1, 2, 3, 4, 5, '...', 10]);
    assert.deepStrictEqual(getPageNumbers(3, 10), [1, 2, 3, 4, 5, '...', 10]);
    assert.deepStrictEqual(getPageNumbers(4, 10), [1, 2, 3, 4, 5, '...', 10]);
  });

  it('renders end window with leading ellipsis when currentPage >= totalPages - 3 in large list', () => {
    assert.deepStrictEqual(getPageNumbers(7, 10), [1, '...', 6, 7, 8, 9, 10]);
    assert.deepStrictEqual(getPageNumbers(8, 10), [1, '...', 6, 7, 8, 9, 10]);
    assert.deepStrictEqual(getPageNumbers(9, 10), [1, '...', 6, 7, 8, 9, 10]);
    assert.deepStrictEqual(getPageNumbers(10, 10), [1, '...', 6, 7, 8, 9, 10]);
  });

  it('renders middle window with dual ellipses when currentPage is in the middle', () => {
    assert.deepStrictEqual(getPageNumbers(5, 10), [1, '...', 4, 5, 6, '...', 10]);
    assert.deepStrictEqual(getPageNumbers(6, 10), [1, '...', 5, 6, 7, '...', 10]);
    assert.deepStrictEqual(getPageNumbers(10, 20), [1, '...', 9, 10, 11, '...', 20]);
  });
});
