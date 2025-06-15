import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { TabContent, TabList, Tabs, TabTrigger } from ".";

export default function TabOne() {
  const tabs = getTabsContent();

  return (
    <ShowcaseSection title="Tab Style 1" className="p-4 sm:p-6 xl:p-7.5">
      <Tabs defaultValue="home" variants="styleOne">
        <TabList>
          <TabTrigger value="home">Home</TabTrigger>
          <TabTrigger value="about-us">About Us</TabTrigger>
          <TabTrigger value="our-team">Our Team</TabTrigger>
          <TabTrigger value="company-details">Company Details</TabTrigger>
        </TabList>

        <TabContent value="home">{tabs[0].content}</TabContent>
        <TabContent value="about-us">{tabs[1].content}</TabContent>
        <TabContent value="our-team">{tabs[2].content}</TabContent>
        <TabContent value="company-details">{tabs[3].content}</TabContent>
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
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit mollitia nam eligendi reprehenderit reiciendis saepe laboriosam maiores voluptas. Quo, culpa amet fugiat ipsam sed quod hic, veritatis ducimus recusandae repellat quasi eaque, suscipit praesentium totam?",
    },
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.",
    },
  ];
}
