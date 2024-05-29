import { Bar } from "react-chartjs-2";
import React from "react";
import { optionsWeek } from "@/lib/options";
import config from "../../tailwind.config";

function DayBar({ weeklyPower2 }) {
  return (
    <Bar
      options={optionsWeek}
      data={{
        datasets: [
          {
            data: weeklyPower2.map((data) => {
              return {
                x: new Date(data._time).toLocaleString("de-DE", {
                  weekday: "long",
                }),
                y: data._value,
              };
            }),
            backgroundColor: config.theme.extend.colors["color-green"],
          },
        ],
      }}
    />
  );
}

export default DayBar;
