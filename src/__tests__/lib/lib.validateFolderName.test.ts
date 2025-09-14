import { describe, it, expect } from 'vitest';
import { validateFolderName } from '../../lib/validateFolderName';

describe('validateFolderName', () => {
  it('rejects empty and dot-only', () => {
    expect(validateFolderName('')).toMatch(/enter a folder name./i);
    expect(validateFolderName('.')).toMatch(/reserved name./i);
    expect(validateFolderName('..')).toMatch(/reserved name./i);
  });
  it('rejects illegal chars', () => {
    expect(validateFolderName('foo\\bar')).toMatch(
      /illegal character: \ : * ? " < > |/i,
    );
    expect(validateFolderName('foo*bar')).toMatch(
      /illegal character: \ : * ? " < > |/i,
    );
  });
  it('accepts normal names', () => {
    expect(validateFolderName('src')).toBeNull();
    expect(validateFolderName('my-folder_123')).toBeNull();
  });
});
