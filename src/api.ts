export const API = {
  fetch: async (url: string, options: any) => {
    if (options.params) {
      const params = new URLSearchParams(options.params);
      url = `${url}?${params.toString()}`;
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      return { err: true, data: {} };
    }
    return res.json();
  },
};
