import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import CalendarBox from "../../../components/CalenderBox";

export const metadata: Metadata = {
  title: "Calender Page",
};

const CalendarPage = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Calendar" />

      <CalendarBox />
    </div>
  );
};

export default CalendarPage;
