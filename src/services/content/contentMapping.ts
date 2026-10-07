const fields: Record<string, Record<string, string>> = {
  "/achievements": {
    title: "title",
    description: "description",
    category: "category",
    type: "type",
    studentName: "student_name",
    teamName: "team_name",
    teamMembers: "team_members",
    organization: "organization",
    eventName: "event_name",
    date: "date",
    year: "year",
    technologies: "technologies",
    externalUrl: "external_url",
    projectUrl: "project_url",
    featured: "featured",
  },
  "/updates": {
    title: "title",
    summary: "summary",
    content: "content",
    category: "category",
    source: "source",
    sourceUrl: "external_source_url",
    publishedAt: "published_at",
    readingTime: "read_time",
    tags: "tags",
    featured: "featured",
  },
  "/projects": {
    title: "title",
    shortDescription: "short_description",
    description: "overview",
    category: "category",
    difficulty: "difficulty",
    status: "status",
    problem: "problem",
    approach: "approach",
    expectedOutcome: "expected_outcome",
    technologies: "technologies",
    tags: "tags",
    features: "features",
    skills: "skills",
    resources: "resources",
    featured: "featured",
  },
  "/courses": {
    title: "title",
    provider: "provider",
    description: "description",
    category: "category",
    difficulty: "difficulty",
    duration: "duration",
    courseUrl: "course_url",
    skills: "skills",
    topics: "topics",
    whyThisCourse: "why_this_course",
    featured: "featured",
  },
};
type RecordData = Record<string, unknown>;
function dateOnly(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10) : value;
}
export function fromApi(endpoint: string, data: RecordData): RecordData {
  if (!fields[endpoint]) return data;
  const result: RecordData = { ...data };
  for (const [front, back] of Object.entries(fields[endpoint]))
    if (data[back] !== undefined) result[front] = data[back];
  for (const name of [
    "tags",
    "skills",
    "topics",
    "technologies",
    "features",
    "teamMembers",
    "resources",
  ])
    result[name] ??= [];
  result.createdAt = data.created_at ?? data.createdAt;
  result.updatedAt = data.updated_at ?? data.updatedAt;
  if (endpoint === "/achievements") {
    result.year = String(data.year || "");
    result.date = dateOnly(data.date);
    result.type = data.type || (data.team_name ? "team" : "individual");
  }
  if (endpoint === "/updates") {
    result.publishedAt = dateOnly(result.publishedAt);
    result.readingTime ??= "";
  }
  if (endpoint === "/projects") {
    result.shortDescription ??= "";
    result.description ??= "";
    result.interestedCount = Number(
      data.interested_count ?? data.interestedCount ?? 0,
    );
  }
  if (endpoint === "/courses")
    result.tracking = {
      method: data.tracking_method || "none",
      status: data.tracking_status || "unsupported",
      provider: data.tracking_provider || "",
    };
  return result;
}
export function toApi(endpoint: string, data: RecordData): RecordData {
  if (!fields[endpoint]) return data;
  const result: RecordData = {};
  for (const [front, back] of Object.entries(fields[endpoint]))
    if (data[front] !== undefined) result[back] = data[front];
  if (endpoint === "/achievements") {
    if (result.year) result.year = Number(result.year);
    else if (result.date)
      result.year = new Date(String(result.date)).getFullYear();
    else delete result.year;
    if (result.date === "") delete result.date;
  }
  if (endpoint === "/courses" && data.tracking) {
    const tracking = data.tracking as RecordData;
    result.tracking_method = tracking.method;
    result.tracking_status = tracking.status;
    result.tracking_provider = tracking.provider || "";
  }
  return result;
}
