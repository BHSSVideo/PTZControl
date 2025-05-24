export const timestamp = (source: number) => {
  let seconds = Math.floor(source / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return [hours, minutes, seconds]
    .map((x) => x.toString().padStart(2, "0"))
    .join(":");
};
