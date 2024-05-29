import dynamic from "next/dynamic";
import Head from "next/head";
import { Titillium_Web } from "next/font/google";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import DayBar from "@/components/DayBar";
import MonthBar from "@/components/MonthBar";
import { currentWeek, getCurrentYear } from "@/lib/helper";
import {
  wortStatusQuery,
  dailyPowerQuery,
  currentMonthPowerQuery,
  weeklyPowerQuery,
  monthPowerQuery,
} from "@/lib/queries";
import { queryClient } from "@/lib/flux";

const ElecData = dynamic(() => import("@/components/ElecData"), {
  ssr: false,
});

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

export default function Home() {
  const [workStatus, setWorkStatus] = useState(0);
  const [dayPower, setDayPower] = useState(0);
  const [weeklyPower, setWeeklyPower] = useState([]);
  const [weeklyPower2, setWeeklyPower2] = useState([]);
  const [monthPower, setMonthPower] = useState([]);
  const [monthPower2, setMonthPower2] = useState([]);
  const [currentMonthPower, setCurrentMonthPower] = useState(0);

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
        console.log(row);
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
    let cleanWeek = [];
    weeklyPower.filter((item) => {
      let date = item._time.split("T")[0];

      if (cleanWeek.map((day) => day._time.split("T")[0]).includes(date)) {
        return false;
      }
      cleanWeek.push(item);
      return true;
    });

    let newWeek = [
      ...cleanWeek,
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

  // Ertrag "Monat" für ein Jahr
  const getMonthlyPower = async () => {
    queryClient.queryRows(monthPowerQuery, {
      next: (row, tableMeta) => {
        const data = tableMeta.toObject(row);
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
    <>
      <Head>
        {/* Page reload every day */}
        <meta httpEquiv={"refresh"} content="21600" />
      </Head>
      <main className={`flex  p-12 ${titillium.className}`}>
        <div className="flex flex-col w-3/5 gap-20 ">
          <DayBar weeklyPower2={weeklyPower2} />
          <MonthBar monthPower2={monthPower2} />
        </div>
        <div className="w-2/5 flex flex-col gap-12 self-center">
          <ElecData workStatus={workStatus} />
        </div>
      </main>
    </>
  );
}
