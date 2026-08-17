type Course = {
  id: number;
  title: string;
  tutor_name: string;
  location: string;
  fee: number;
  mode: "online" | "offline" | "both";
};

type CourseCardProps = {
  course: Course;
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16 }}>{course.title}</h3>
      <p style={{ margin: "8px 0 0", color: "#4b5563", fontSize: 14 }}>
        Tutor: {course.tutor_name || "Tutor"}
      </p>
      <p style={{ margin: "4px 0 0", color: "#4b5563", fontSize: 14 }}>
        Location: {course.location}
      </p>
      <p style={{ margin: "4px 0 0", color: "#4b5563", fontSize: 14 }}>
        Mode: {course.mode}
      </p>
      <p style={{ margin: "8px 0 0", fontWeight: 700, color: "#059669" }}>
        LKR {course.fee.toLocaleString()}
      </p>
    </article>
  );
}
