function findActiveVideo() {
  const videos = [
    ...Array.from(document.querySelectorAll("video")),
    ...Array.from(document.querySelectorAll("iframe")).flatMap((iframe) => {
      try {
        return Array.from(
          iframe.contentWindow.document.querySelectorAll("video"),
        );
      } catch (e) {
        return [];
      }
    }),
  ]
    .filter((video) => video.readyState != 0)
    .map((video) => {
      video.disablePictureInPicture = false;
      const rect = video.getBoundingClientRect();
      return { video, area: rect.width * rect.height };
    })
    .filter(({ area }) => area > 0)
    .sort((a, b) => b.area - a.area)
    .map((item) => item.video);

  return videos[0] || null;
}

async function togglePictureInPicture(video) {
  try {
    if (video.hasAttribute("__pip__")) {
      await document.exitPictureInPicture();
      video.removeAttribute("__pip__");
      return;
    }

    await video.requestPictureInPicture();
    video.setAttribute("__pip__", true);
    video.addEventListener(
      "leavepictureinpicture",
      () => {
        video.removeAttribute("__pip__");
      },
      { once: true },
    );
  } catch (error) {
    // Silently ignore errors for now
  }
}

(async () => {
  const video = findActiveVideo();
  if (!video) return;
  await togglePictureInPicture(video);
})();
