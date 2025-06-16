import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TaskHeader from "@/components/Tasks/TaskHeader";
import TaskList from "@/components/Tasks/TaskList";
import { structuredAlgoliaHtmlData } from "@/libs/crawlIndex";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task List Page",
};
const TaskListPage = async () => {
  await structuredAlgoliaHtmlData({
    pageUrl: `${process.env.SITE_URL}tasks/task-list`,
    htmlString: "",
    title: "Next.js Task List Page",
    type: "page",
    imageURL: "",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumb pageName="Task List" />

      <TaskHeader />
      <TaskList />
    </div>
  );
};

export default TaskListPage;
