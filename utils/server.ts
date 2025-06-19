const mainServerUrl = process.env.MAIN_SERVER_URL;

export const randomServer = () => {
  if (!mainServerUrl) return;
  const urls = mainServerUrl.split(",");
  const randomNumber = Math.floor(Math.random() * urls.length);
  return urls[randomNumber];
};

export const secureURL = (url: string) =>
  url?.startsWith("http://") ? url.replace("http://", "https://") : url;
