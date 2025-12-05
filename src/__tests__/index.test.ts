import { greet } from '../index.js';

describe('greet', () => {
  it('should return a greeting message', () => {
    expect(greet('TypeScript')).toBe('Hello, TypeScript!');
  });

  it('should handle empty string', () => {
    expect(greet('')).toBe('Hello, !');
  });
});
