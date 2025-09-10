export const validateFolderName = (name: string) => {
  if (!name) return 'Enter a folder name.';
  if (name === '.' || name === '..') return 'Reserved name.';
  if (name.trim() !== name)
    return 'Name cannot contain leading or trailing whitespace.';
  const nonoRegex = /[\\:*?"<>|]/;
  if (nonoRegex.test(name)) return 'Illegal character: \\ : * ? " < > |';
  return null;
};
