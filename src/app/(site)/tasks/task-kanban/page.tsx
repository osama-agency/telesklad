import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TaskHeader from "@/components/Tasks/TaskHeader";
import TaskKanban from "@/components/Tasks/TaskKanban";
import { structuredAlgoliaHtmlData } from "@/libs/crawlIndex";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Kanban Page",
};

export default async function Page() {
  await structuredAlgoliaHtmlData({
    pageUrl: `${process.env.SITE_URL}tasks/task-kanban`,
    htmlString: "",
    title: "Next.js Task Kanban Page",
    type: "page",
    imageURL: "",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumb pageName="Task Kanban" />

      <TaskHeader />
      <TaskKanban />
    </div>
  );
}
