function getZIndex(element) {
  const z = window.getComputedStyle(element).zIndex;
  const zi = parseInt(z, 10);
  return Number.isNaN(zi) ? 0 : zi;
}

function findActiveVideo() {
  console.log("findActiveVideo");
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
      return {
        video,
        area: rect.width * rect.height,
        zIndex: getZIndex(video),
        paused: video.paused,
      };
    })
    .filter(({ area }) => area > 0)
    .sort((a, b) => {
      if (a.paused !== b.paused) return a.paused ? 1 : -1;
      if (b.zIndex !== a.zIndex) return b.zIndex - a.zIndex;
      return b.area - a.area;
    })
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
