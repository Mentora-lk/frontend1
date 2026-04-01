export type Course = {
  id: number;
  title: string;
  tutor: string;
  location: string;
  rating: number;
  subject: string;
  mode: "online" | "offline" | "both";
  fee: number;
};

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Advanced Level: Physics",
    tutor: "Thilak Perera",
    location: "Moratuwa",
    rating: 4.8,
    subject: "Physics",
    mode: "offline",
    fee: 2500,
  },
  {
    id: 2,
    title: "Advanced Level: ICT",
    tutor: "Nimesh Dissanayake",
    location: "Piliyandala",
    rating: 4.6,
    subject: "ICT",
    mode: "online",
    fee: 3000,
  },
  {
    id: 3,
    title: "Web Development From Basics",
    tutor: "Isaac Rudansky",
    location: "Online",
    rating: 4.9,
    subject: "ICT",
    mode: "online",
    fee: 4500,
  },
];

export const POPULAR_TAGS = ["IT", "Music", "Physics", "Accounting", "English"];

export const TESTIMONIALS = [
  {
    quote: "Found the perfect tutor quickly and saw excellent progress.",
    name: "Sonal Perera",
    rating: 5,
  },
  {
    quote: "Great platform with verified tutors and flexible schedules.",
    name: "Priya Wickramasinghe",
    rating: 5,
  },
];
