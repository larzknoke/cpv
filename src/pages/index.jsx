import { Titillium_Web } from "next/font/google";
import { InfluxDB } from "@influxdata/influxdb-client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import config from "../../tailwind.config";
import PowerOn from "../components/powerOn";
import Elec from "../components/Elec";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

ChartJS.defaults.font.family = titillium.style.fontFamily;

// INIT CURRENT WEEK
const currentWeek = Array.from(Array(7).keys()).map((idx) => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + idx + 1);
  return { _time: d, _value: 0 };
});

// INIT CURRENT YEAR
function getCurrentYear() {
  const year = new Date().getFullYear();
  const yearDates = [];
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
    const d = new Date(year, month - 1, 1);
    yearDates.push({ _time: d, _value: 0 });
  });
  return yearDates;
}

export default function Home() {
  const [workStatus, setWorkStatus] = useState(0);
  const [power, setPower] = useState(0);
  const [dayPower, setDayPower] = useState(0);
  const [weeklyPower, setWeeklyPower] = useState([]);
  const [weeklyPower2, setWeeklyPower2] = useState([]);
  const [monthPower, setMonthPower] = useState([]);
  const [monthPower2, setMonthPower2] = useState([]);
  const [currentMonthPower, setCurrentMonthPower] = useState(0);
  const [totalPower, setTotalPower] = useState(0);

  // FLUX API
  const client = new InfluxDB({
    url: process.env.NEXT_PUBLIC_INFLUX_URL,
    token: process.env.NEXT_PUBLIC_INFLUX_TOKEN,
  });
  const queryClient = client.getQueryApi(process.env.NEXT_PUBLIC_INFLUX_ORG);

  // Work Status
  const wortStatusQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35140_Work_status")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

  // Aktuelle Leistung
  const currentPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35031_Total_active_power")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

  // Ertrag "Heute"
  const dailyPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35003_Daily_power_yields")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

  // Ertrag "Tag" für eine Woche
  const weeklyPowerQuery = `
        import "experimental/date/boundaries"
        currentWeek = boundaries.week(week_offset: 0)
        from(bucket: "iobroker")
            |> range(start: currentWeek.start, stop: currentWeek.stop)
            |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.Tagesmenge")
            |> filter(fn: (r) => r["_field"] == "value")
          `;

  // Ertrag "Tag" für eine Woche
  const totalPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35004_Total_power_yields")
          |> filter(fn: (r) => r["_field"] == "value")
          `;

  // Ertrag "Tag" für eine Woche
  const monthPowerQuery = `
        import "date"
        currentYear = date.year(t: now())
        from(bucket: "iobroker")
            |> range(start: currentYear-01-01)
            |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.Monatsmenge")
            |> filter(fn: (r) => r["_field"] == "value")
          `;

  // Ertrag "aktueller Monat"
  const currentMonthPowerQuery = `
        from(bucket: "iobroker")
          |> range(start: 0)
          |> filter(fn: (r) => r._measurement == "0_userdata.0.photovoltaik.35128_Monthly power yields")
          |> filter(fn: (r) => r["_field"] == "value")
          |> last()`;

  // Aktuelle Leistung
  const getWorkStatus = () => {
    queryClient.queryRows(wortStatusQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        setWorkStatus(data._value);
      },
      complete: () => {},
    });
  };

  // Aktuelle Leistung
  const getCurrentPower = () => {
    queryClient.queryRows(currentPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        setPower(data._value);
      },
      complete: () => {},
    });
  };

  // Ertrag "Heute"
  const getDayPower = () => {
    queryClient.queryRows(dailyPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        setDayPower(data._value);
      },
      complete: () => {},
    });
  };

  // Ertrag "Tag" für eine Woche
  const getWeeklyPower = async () => {
    queryClient.queryRows(weeklyPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        setWeeklyPower((prevWeekly) => [...prevWeekly, data]);
      },
      error: (err) => {
        console.log("error", err);
      },
      complete: () => {},
    });
  };

  // Woche zusammenbauen
  useEffect(() => {
    let newWeek = [
      ...weeklyPower,
      {
        _time: new Date(),
        _value: dayPower,
      },
    ];
    newWeek = newWeek.concat(currentWeek.slice(weeklyPower.length + 1));
    setWeeklyPower2(newWeek);
  }, [weeklyPower, dayPower]);

  // Jahr zusammenbauen
  useEffect(() => {
    let newMonth = [
      ...monthPower,
      {
        _time: new Date(),
        _value: currentMonthPower,
      },
    ];
    newMonth = newMonth.concat(monthPower.slice(monthPower.length + 1));
    setMonthPower2(newMonth);
  }, [monthPower, currentMonthPower]);

  // Ertrag "Total"
  const getTotalPower = () => {
    queryClient.queryRows(totalPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        setTotalPower(data._value);
      },
      complete: () => {},
    });
  };

  // Ertrag "Tag" für eine Woche
  const getMonthlyPower = async () => {
    queryClient.queryRows(monthPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        console.log("data", data);
        setMonthPower((prevMonth) => [...prevMonth, data]);
      },
      error: (err) => {
        console.log("error", err);
      },
      complete: () => {},
    });
  };

  // Ertrag "aktueller Monat"
  const getCurrentMonthPower = () => {
    queryClient.queryRows(currentMonthPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
        console.log("data", data);
        setCurrentMonthPower(data._value);
      },
      complete: () => {},
    });
  };

  // Jahr zusammenbauen
  useEffect(() => {
    const year = getCurrentYear();
    setMonthPower(year);
  }, []);

  // Aktuelle Leistung
  useEffect(() => {
    getCurrentPower();
    const powerInterval = setInterval(() => {
      getCurrentPower();
    }, 15000); // every 15 seconds
    return () => clearInterval(powerInterval);
  }, []);

  // Work Status
  useEffect(() => {
    getWorkStatus();
    const powerInterval = setInterval(() => {
      getWorkStatus();
    }, 15000); // every 15 seconds
    return () => clearInterval(powerInterval);
  }, []);

  // Ertrag "Heute"
  useEffect(() => {
    getDayPower();
    const powerInterval = setInterval(() => {
      getDayPower();
    }, 15000); // every 15 seconds
    return () => clearInterval(powerInterval);
  }, []);

  // Ertrag "Tag" für eine Woche
  useEffect(() => {
    getWeeklyPower();
    const powerInterval = setInterval(() => {
      getWeeklyPower();
    }, 1000 * 60 * 60 * 24); // daily
    return () => {
      clearInterval(powerInterval);
      setWeeklyPower([]);
    };
  }, []);

  // Ertrag "Total"
  useEffect(() => {
    getTotalPower();
    const powerInterval = setInterval(() => {
      getTotalPower();
    }, 15000); // every 15 seconds
    return () => clearInterval(powerInterval);
  }, []);

  // Ertrag Monat für Jahr
  useEffect(() => {
    getMonthlyPower();
    const powerInterval = setInterval(() => {
      getMonthlyPower();
    }, 1000 * 60 * 60 * 24); // daily
    return () => {
      clearInterval(powerInterval);
      setMonthPower([]);
    };
  }, []);

  // Ertrag aktueller Monat
  useEffect(() => {
    getCurrentMonthPower();
    const powerInterval = setInterval(() => {
      getCurrentMonthPower();
    }, 15000); // every 15 seconds
    return () => clearInterval(powerInterval);
  }, []);

  return (
    <main className={`flex  p-12 ${titillium.className}`}>
      <div className="flex flex-col w-1/2 ">
        <Bar
          options={optionsWeek}
          data={{
            // labels: [2, 3, 4, 5, 6, 7, 8],
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
        <Bar
          style={{ marginTop: "4em" }}
          options={optionsMonth}
          data={{
            // labels: [2, 3, 4, 5, 6, 7, 8],
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
        <div></div>
      </div>
      <div className="w-1/2 flex flex-col p-12 gap-12">
        <div className="flex justify-center">
          {workStatus == 1 ? (
            <div className="relative">
              <div className="w-6 right-0 -top-8 absolute">
                <Elec />
              </div>
              <div className="w-44">
                <PowerOn />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <img
                className="w-40"
                src="powerOff3.svg"
                alt="COLOR+ POWER OFF"
              />
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-bold text-[104px] leading-[1em]">
            {power.toFixed(1)}
          </div>
          <div className="text-5xl text-[#676767]">Aktuell (kW)</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-[104px] leading-[1em]">
            {dayPower.toFixed(1)}
          </div>
          <div className="text-5xl text-[#676767]">Heute (kWh)</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-[104px] leading-[1em]">
            {totalPower.toFixed(1)}
          </div>
          <div className="text-5xl text-[#676767]">Gesamt (kWh)</div>
        </div>
        {/* <div className="flex justify-center">
          <img className="w-24" src="logo_white.svg" alt="COLOR+ Logo" />
        </div> */}
      </div>
    </main>
  );
}

export const optionsWeek = {
  responsive: true,
  scales: {
    x: {
      ticks: {
        font: {
          size: 20,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 16,
        },
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
      color: "#606060",
      position: "left",
      font: {
        size: 28,
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
  scales: {
    x: {
      ticks: {
        font: {
          size: 20,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 16,
        },
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
      color: "#606060",
      position: "left",
      font: {
        size: 28,
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
