export async function getLeadReportData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      avatar: "/images/user/user-17.png",
      name: "Charlie Donin",
      email: "wdavis@aol.com",
      project: {
        startDate: "2024-12-25T18:00:00.000Z",
        endDate: "2024-12-28T18:00:00.000Z",
      },
      duration: "3 days",
      status: "lost lead",
    },
    {
      avatar: "/images/user/user-15.png",
      name: "Makenna Carder",
      email: "ltorres@aol.com",
      project: {
        startDate: "2024-12-25T18:00:00.000Z",
        endDate: "2024-12-28T18:00:00.000Z",
      },
      duration: "3 days",
      status: "active",
    },
    {
      avatar: "/images/user/user-19.png",
      name: "Talan Dokidis",
      email: "rtaylor@aol.com",
      project: {
        startDate: "2024-12-25T18:00:00.000Z",
        endDate: "2024-12-28T18:00:00.000Z",
      },
      duration: "3 days",
      status: "active",
    },
    {
      avatar: "/images/user/user-14.png",
      name: "Cheyenne Levin",
      email: "ebrown@aol.com",
      project: {
        startDate: "2024-12-25T18:00:00.000Z",
        endDate: "2024-12-28T18:00:00.000Z",
      },
      duration: "3 days",
      status: "active",
    },
    {
      avatar: "/images/user/user-21.png",
      name: "James Aminoff",
      email: "slee@aol.com",
      project: {
        startDate: "2024-12-25T18:00:00.000Z",
        endDate: "2024-12-28T18:00:00.000Z",
      },
      duration: "3 days",
      status: "lost lead",
    },
  ];
}

export async function getTodoList() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      logo: "/images/todo/uideck.svg",
      title: "Next.js Uideck Yearly Meetings",
      datetime: {
        start: "2025-02-14T10:20:00.000Z",
        end: "2025-02-14T15:00:00.000Z",
      },
      status: "Completed",
    },
    {
      logo: "/images/todo/dribble.svg",
      title: "Next.js 2025 Dribbble Meet Up",
      datetime: {
        start: "2025-02-14T10:20:00.000Z",
        end: "2025-02-14T15:00:00.000Z",
      },
      status: "Upcoming",
    },
    {
      logo: "/images/todo/linkdin.svg",
      title: "Next.js 2025 Linkedin Meet Up",
      datetime: {
        start: "2025-02-14T10:20:00.000Z",
        end: "2025-02-14T15:00:00.000Z",
      },
      status: "Canceled",
    },
  ];
}

export async function getCampaignsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    chart: [
      {
        name: "Series One",
        data: [
          { x: "M", y: 268 },
          { x: "T", y: 385 },
          { x: "W", y: 201 },
          { x: "T", y: 298 },
          { x: "F", y: 187 },
          { x: "S", y: 195 },
          { x: "S", y: 291 },
        ],
      },
      {
        name: "Series Two",
        data: [
          { x: "M", y: 345 },
          { x: "T", y: 160 },
          { x: "W", y: 291 },
          { x: "T", y: 187 },
          { x: "F", y: 195 },
          { x: "S", y: 298 },
          { x: "S", y: 201 },
        ],
      },
    ],
  };
}
