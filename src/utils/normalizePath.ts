const normalizePath = (path: string) =>
  path
    .replace(/\\/g, '/') // all '\' replaced with '/'
    .replace(/^\.\/+/, '') // remove './' from start of path
    .replace(/\/{2,}/g, '/') // collapse multiple slashes
    .replace(/\/+$/, ''); // remove trailing '/' from path

export default normalizePath;
