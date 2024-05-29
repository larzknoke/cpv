import { Bar } from "react-chartjs-2";
import React from "react";
import { optionsMonth } from "@/lib/options";
import config from "../../tailwind.config";

function MonthBar({ monthPower2 }) {
  return (
    <Bar
      options={optionsMonth}
      data={{
        datasets: [
          {
            data: monthPower2.map((data) => {
              return {
                x: new Date(data._time).toLocaleString("de-DE", {
                  month: "long",
                }),
                y: data._value,
              };
            }),
            backgroundColor: config.theme.extend.colors["color-red"],
          },
        ],
      }}
    />
  );
}

export default MonthBar;
