import React, { useEffect, useState } from "react";

type Props = {
  source: Date;
};

export const Timestamp = ({ source }: Props) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handle = setInterval(() => {
      const milliseconds = Date.now() - source.getTime();

      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);

      seconds = seconds % 60;
      minutes = minutes % 60;

      const timestamp = [hours, minutes, seconds]
        .map((x) => x.toString().padStart(2, "0"))
        .join(":");

      setValue(timestamp);
    }, 1000);

    return () => clearInterval(handle);
  }, [source]);

  return <>{value}</>;
};
