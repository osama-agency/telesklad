import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { TabContent, TabList, Tabs, TabTrigger } from ".";

export default function TabThree() {
  const tabs = getTabsContent();

  return (
    <ShowcaseSection title="Tab Style 3" className="p-4 sm:p-6 xl:p-7.5">
      <Tabs defaultValue="profile" variants="styleThree">
        <TabList className="gap-10">
          <TabTrigger value="profile">Profile</TabTrigger>
          <TabTrigger value="password">Password</TabTrigger>
          <TabTrigger value="team">Team</TabTrigger>
          <TabTrigger value="notification">Notification</TabTrigger>
          <TabTrigger value="integration">Integrations</TabTrigger>
          <TabTrigger value="licenses">Licenses</TabTrigger>
        </TabList>

        <TabContent value="profile">{tabs[0].content}</TabContent>
        <TabContent value="password">{tabs[1].content}</TabContent>
        <TabContent value="team">{tabs[2].content}</TabContent>
        <TabContent value="notification">{tabs[3].content}</TabContent>
        <TabContent value="integration">{tabs[4].content}</TabContent>
        <TabContent value="licenses">{tabs[5].content}</TabContent>
      </Tabs>
    </ShowcaseSection>
  );
}

function getTabsContent() {
  return [
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Unde ex dolorum voluptate cupiditate adipisci doloremque, vel quam praesentium nihil veritatis.",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit mollitia nam eligendi reprehenderit reiciendis saepe laboriosam maiores voluptas. Quo, culpa amet fugiat ipsam sed quod hic, veritatis ducimus recusandae repellat quasi eaque, suscipit praesentium totam.",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.",
    },
  ];
}
