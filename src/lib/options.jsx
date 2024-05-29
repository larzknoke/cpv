import { Titillium_Web } from "next/font/google";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const optionsWeek = {
  responsive: true,
  aspectRatio: 2.5,
  scales: {
    x: {
      ticks: {
        font: {
          size: 22,
        },
        color: "#828282",
      },
    },
    y: {
      ticks: {
        font: {
          size: 20,
        },
        color: "#828282",
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
    title: {
      display: true,
      text: "Tagesertrag (kWh)",
      color: "#828282",
      position: "left",
      font: {
        size: 28,
      },
      padding: {
        bottom: 50,
      },
    },
    datalabels: {
      color: "white",
      display: true,
      font: {
        weight: 600,
        size: "48px",
        family: titillium.style.fontFamily,
      },
      formatter: function (value, context) {
        return value.y > 0 ? Math.round(value.y) : "";
      },
    },
  },
};
export const optionsMonth = {
  responsive: true,
  aspectRatio: 2.5,
  scales: {
    x: {
      ticks: {
        font: {
          size: 22,
        },
        color: "#828282",
      },
    },
    y: {
      ticks: {
        font: {
          size: 20,
        },
        color: "#828282",
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
    title: {
      display: true,
      text: "Monatsertrag (kWh)",
      color: "#828282",
      position: "left",
      font: {
        size: 28,
      },
      padding: {
        bottom: 50,
      },
    },
    datalabels: {
      rotation: 270,
      color: "white",
      display: true,
      font: {
        weight: 600,
        size: "36px",
        family: titillium.style.fontFamily,
      },
      formatter: function (value, context) {
        return value.y > 0 ? Math.round(value.y) : "";
      },
    },
  },
};
