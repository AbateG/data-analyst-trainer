import { describe, it, expect } from 'vitest';
import { performIdentifierValidation } from '../../components/SqlRunner';

describe('performIdentifierValidation', () => {
  const tables = [
    {
      name: 'users',
      columns: [ { name: 'user_id' }, { name: 'signup_date' }, { name: 'country' } ]
    },
    {
      name: 'transactions',
      columns: [ { name: 'transaction_id' }, { name: 'user_id' }, { name: 'amount' }, { name: 'created_at' } ]
    }
  ];

  it('flags unknown table', () => {
    const { issues } = performIdentifierValidation('SELECT x.user_id FROM x', tables as any);
    expect(issues.some(i => i.includes('Unknown table: x'))).toBe(true);
  });

  it('flags unknown column', () => {
    const { issues } = performIdentifierValidation('SELECT users.missing_col FROM users', tables as any);
    expect(issues.some(i => i.includes('Unknown column: users.missing_col'))).toBe(true);
  });

  it('accepts valid alias usage', () => {
    const { issues } = performIdentifierValidation('SELECT u.user_id, t.amount FROM users u JOIN transactions t ON u.user_id = t.user_id', tables as any);
    expect(issues.length).toBe(0);
  });

  it('supports basic CTE name resolution', () => {
    const { issues } = performIdentifierValidation('WITH x AS (SELECT user_id, amount FROM transactions) SELECT x.user_id FROM x', tables as any);
    expect(issues.length).toBe(0);
  });

  it('flags unknown column inside CTE body', () => {
    const { issues } = performIdentifierValidation('WITH x AS (SELECT transactions.bogus FROM transactions) SELECT * FROM x', tables as any);
    expect(issues.some(i => i.includes('Unknown column'))).toBe(true);
  });

  it('handles wildcard table.* reference', () => {
    const { issues } = performIdentifierValidation('SELECT u.* FROM users u', tables as any);
    expect(issues.length).toBe(0);
  });

  it('detects wildcard without from table', () => {
    const { issues } = performIdentifierValidation('SELECT *', tables as any);
    expect(issues.some(i => i.includes('Wildcard *'))).toBe(true);
  });
});
