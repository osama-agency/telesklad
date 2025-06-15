import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Notification } from "@/components/ui-elements/notifications/notification";
import {
  getNotifications,
  NotificationsList,
} from "@/components/ui-elements/notifications/notifications-list";
import { UpdateNotification } from "@/components/ui-elements/notifications/update-notification";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Notifications" />

      <div className="flex flex-col gap-7.5">
        <ShowcaseSection title="Notifications Style 1">
          <Notification
            title="Congratulations"
            description="Your message sent successfully"
            type="success"
          />
        </ShowcaseSection>

        <ShowcaseSection title="Notifications Style 2">
          <Notification
            title="Uh oh, something went wrong"
            description="Sorry! There was a problem with your request"
            type="error"
          />
        </ShowcaseSection>

        <ShowcaseSection title="Notifications Style 3">
          <UpdateNotification
            title="New update available!"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec
            ligula at dolor aliquam mollis."
          />
        </ShowcaseSection>

        <ShowcaseSection title="Notifications Style 4">
          <NotificationsList data={getNotifications()} />
        </ShowcaseSection>
      </div>
    </>
  );
}
