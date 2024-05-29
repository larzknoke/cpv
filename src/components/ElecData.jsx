import PowerOn from "@/components/powerOn";
import Elec from "@/components/Elec";
import { socketConnection, connectSocket } from "@/lib/socketConnection";
import { useState, useEffect } from "react";

function ElecData({ workStatus }) {
  // *****
  // SOCKET
  // *****
  const states = [
    "0_userdata.0.photovoltaik.35004_Total_power_yields",
    "0_userdata.0.photovoltaik.35031_Total_active_power",
    "0_userdata.0.photovoltaik.35003_Daily_power_yields",
    "modbus.2.holdingRegisters.19026_Sum_P1+P2+P3",
  ];

  const [socket, setSocket] = useState();
  const [values, setValues] = useState({});
  const [eigen, setEigen] = useState(0);

  async function setConnection() {
    const connection = await connectSocket(socketConnection);
    setSocket(connection);
  }

  useEffect(() => {
    setConnection();
  }, []);

  useEffect(() => {
    if (socket?.isConnected) {
      socket?.subscribeState(states, (id, state) => {
        setValues((prevState) => ({
          ...prevState,
          [id]: state?.val || 0,
        }));
      });
    }

    return () => socket?.unsubscribeState(states);
  }, [socket]);

  useEffect(() => {
    const currentPower =
      values["0_userdata.0.photovoltaik.35031_Total_active_power"];
    const currentConsumed =
      values["modbus.2.holdingRegisters.19026_Sum_P1+P2+P3"];
    values["0_userdata.0.photovoltaik.35031_Total_active_power"];
    let val = (currentPower / (currentConsumed + currentPower)) * 100;
    val = val > 100 ? 100 : val; // MAX 100%
    setEigen(val);
  }, [values]);

  return (
    <>
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
            <img className="w-40" src="powerOff3.svg" alt="COLOR+ POWER OFF" />
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-bold text-[104px] leading-[1em]">
          {values[
            "0_userdata.0.photovoltaik.35031_Total_active_power"
          ]?.toFixed(1)}
        </div>
        <div className="text-5xl text-[#828282]">Aktuell (kW)</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-[104px] leading-[1em]">
          {eigen?.toFixed(0) + " %"}
        </div>
        <div className="text-5xl text-[#828282]">Eigenverbrauch Anteil</div>
      </div>
      <div className="flex justify-center gap-12">
        <div className="text-center">
          <div className="font-bold text-[104px] leading-[1em]">
            {values[
              "0_userdata.0.photovoltaik.35003_Daily_power_yields"
            ]?.toFixed(0)}
          </div>
          <div className="text-5xl text-[#828282]">Heute (kWh)</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-[104px] leading-[1em]">
            {(
              values["0_userdata.0.photovoltaik.35004_Total_power_yields"] /
              1000
            ).toFixed(1)}
          </div>
          <div className="text-5xl text-[#828282]">Gesamt (MWh)</div>
        </div>
      </div>
    </>
  );
}

export default ElecData;
