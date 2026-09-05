import type {
  backendInterface,
  InternshipApplication,
  MockInterviewAnswer,
  MockInterviewQuestion,
  PracticeQuestion,
  ReminderSettings,
  ResumeData,
  RoadmapProgress,
  Skill,
  SolvedQuestion,
  UserProfile,
} from "../backend";

const STORAGE_PREFIX = "grasx_mock_";

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw, (_k, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v)) {
        return BigInt(v.slice(0, -1));
      }
      return v;
    });
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? `${v.toString()}n` : v,
    );
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch {
    // Ignore storage quota errors
  }
}

const DEFAULT_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "pq1",
    title: "Calculate Sum",
    difficulty: "Easy",
    description: "Find the sum of two numbers.",
    category: "Math",
  },
  {
    id: "pq2",
    title: "Reverse String",
    difficulty: "Easy",
    description: "Reverse a given string in-place.",
    category: "Strings",
  },
  {
    id: "pq3",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers and a target, return indices of the two numbers that add up to target.",
    category: "Arrays",
  },
  {
    id: "pq4",
    title: "Valid Palindrome",
    difficulty: "Easy",
    description: "Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases.",
    category: "Strings",
  },
  {
    id: "pq11",
    title: "Find Median",
    difficulty: "Medium",
    description: "Find the median value of a numerical array.",
    category: "Math",
  },
  {
    id: "pq12",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes values.",
    category: "Trees",
  },
  {
    id: "pq13",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Find the length of the longest substring without duplicate characters.",
    category: "Strings",
  },
  {
    id: "pq16",
    title: "Longest Palindrome",
    difficulty: "Hard",
    description: "Find the longest palindromic substring in a given string.",
    category: "Strings",
  },
  {
    id: "pq17",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description: "Given n non-negative integers representing an elevation map, compute how much water it can trap.",
    category: "Dynamic Programming",
  },
];

const DEFAULT_MOCK_QUESTIONS: MockInterviewQuestion[] = [
  {
    id: "miq1",
    category: "HR",
    question: "Tell me about yourself and your background in computer science.",
    subcategory: "General",
  },
  {
    id: "miq2",
    category: "HR",
    question: "What is your greatest technical achievement, and what obstacles did you overcome?",
    subcategory: "Experience",
  },
  {
    id: "miq3",
    category: "HR",
    question: "Where do you see your engineering career in three to five years?",
    subcategory: "Goals",
  },
  {
    id: "miq8",
    category: "Technical",
    question: "Explain binary search and its logarithmic time complexity.",
    subcategory: "Algorithms",
  },
  {
    id: "miq9",
    category: "Technical",
    question: "Explain the difference between a process and a thread, and how concurrency is handled.",
    subcategory: "Operating Systems",
  },
  {
    id: "miq10",
    category: "Technical",
    question: "How do database indexes work internally, and when should you avoid indexing?",
    subcategory: "Databases",
  },
];

const DEFAULT_SKILLS: Skill[] = [
  {
    skillName: "Data Structures",
    level: 3n,
    progressPercent: 75n,
    lastPracticedDate: new Date().toISOString().split("T")[0],
  },
  {
    skillName: "Algorithms",
    level: 2n,
    progressPercent: 60n,
    lastPracticedDate: new Date().toISOString().split("T")[0],
  },
  {
    skillName: "Web Development",
    level: 4n,
    progressPercent: 85n,
    lastPracticedDate: new Date().toISOString().split("T")[0],
  },
  {
    skillName: "Database Systems",
    level: 3n,
    progressPercent: 70n,
    lastPracticedDate: new Date().toISOString().split("T")[0],
  },
  {
    skillName: "System Design",
    level: 1n,
    progressPercent: 40n,
    lastPracticedDate: new Date().toISOString().split("T")[0],
  },
];

const DEFAULT_APPLICATIONS: InternshipApplication[] = [
  {
    id: "app-1",
    company: "Google",
    role: "Software Engineering Intern",
    dateApplied: "2026-02-15",
    status: "Interviewing",
  },
  {
    id: "app-2",
    company: "Microsoft",
    role: "Frontend Developer Intern",
    dateApplied: "2026-02-20",
    status: "Applied",
  },
  {
    id: "app-3",
    company: "Stripe",
    role: "Infrastructure Engineering Intern",
    dateApplied: "2026-02-10",
    status: "Offer Received",
  },
];

class MockBackend implements backendInterface {
  private profile: UserProfile | null = null;
  private skills: Skill[] = [];
  private practiceQuestions: PracticeQuestion[] = [];
  private solvedQuestions: SolvedQuestion[] = [];
  private mockInterviewQuestions: MockInterviewQuestion[] = [];
  private mockInterviewAnswers: Record<string, MockInterviewAnswer> = {};
  private internshipApplications: InternshipApplication[] = [];
  private reminderSettings: ReminderSettings | null = null;
  private resumeData: ResumeData | null = null;
  private roadmapProgressMap: Record<string, RoadmapProgress> = {};
  private initialized = false;

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    this.profile = loadStorage<UserProfile | null>("profile", {
      name: "GrasX Student",
      totalSolvedQuestions: 7n,
      lastActiveDate: new Date().toISOString().split("T")[0],
      currentStreak: 4n,
    });
    this.skills = loadStorage<Skill[]>("skills", DEFAULT_SKILLS);
    this.practiceQuestions = loadStorage<PracticeQuestion[]>(
      "practiceQuestions",
      DEFAULT_PRACTICE_QUESTIONS,
    );
    this.solvedQuestions = loadStorage<SolvedQuestion[]>("solvedQuestions", [
      {
        questionId: "pq1",
        solvedDate: new Date().toISOString().split("T")[0],
        notes: "Solved with standard addition logic.",
      },
    ]);
    this.mockInterviewQuestions = loadStorage<MockInterviewQuestion[]>(
      "mockQuestions",
      DEFAULT_MOCK_QUESTIONS,
    );
    this.mockInterviewAnswers = loadStorage<Record<string, MockInterviewAnswer>>(
      "mockAnswers",
      {},
    );
    this.internshipApplications = loadStorage<InternshipApplication[]>(
      "applications",
      DEFAULT_APPLICATIONS,
    );
    this.reminderSettings = loadStorage<ReminderSettings | null>(
      "reminderSettings",
      {
        dailyEnabled: true,
        dailyTime: "09:00",
        weeklyEnabled: true,
        weeklyDay: "Monday",
        monthlyEnabled: false,
        monthlyDay: 1n,
      },
    );
    this.resumeData = loadStorage<ResumeData | null>("resumeData", {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 234-5678",
      summary:
        "Motivated Computer Science student with strong fundamentals in data structures, algorithms, and full-stack development.",
      education: "B.S. in Computer Science & Engineering (2022 - 2026)",
      skills: "TypeScript, React, Node.js, Python, SQL, Git, Docker, System Design",
      projects:
        "GrasX - Placement Companion: Built an all-in-one preparation portal with quiz arena and code editor.",
    });
    this.roadmapProgressMap = loadStorage<Record<string, RoadmapProgress>>(
      "roadmapProgress",
      {},
    );
    this.initialized = true;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      this.loadAll();
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return this.profile;
  }

  async updateUserProfile(profile: UserProfile): Promise<void> {
    this.profile = profile;
    saveStorage("profile", profile);
  }

  async getSkills(): Promise<Skill[]> {
    return this.skills;
  }

  async updateSkills(newSkills: Skill[]): Promise<void> {
    this.skills = newSkills;
    saveStorage("skills", newSkills);
  }

  async getAllPracticeQuestions(): Promise<PracticeQuestion[]> {
    return this.practiceQuestions;
  }

  async getPracticeQuestionsByDifficulty(): Promise<PracticeQuestion[]> {
    const order: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
    return [...this.practiceQuestions].sort(
      (a, b) => (order[a.difficulty] || 9) - (order[b.difficulty] || 9),
    );
  }

  async getSolvedQuestions(): Promise<SolvedQuestion[]> {
    return this.solvedQuestions;
  }

  async markQuestionSolved(solved: SolvedQuestion): Promise<void> {
    const exists = this.solvedQuestions.some(
      (q) => q.questionId === solved.questionId,
    );
    if (!exists) {
      this.solvedQuestions.push(solved);
      saveStorage("solvedQuestions", this.solvedQuestions);
      if (this.profile) {
        this.profile = {
          ...this.profile,
          totalSolvedQuestions: this.profile.totalSolvedQuestions + 1n,
          lastActiveDate: solved.solvedDate,
        };
        saveStorage("profile", this.profile);
      }
    }
  }

  async getRoadmapProgress(month: bigint): Promise<RoadmapProgress | null> {
    const key = month.toString();
    return this.roadmapProgressMap[key] ?? null;
  }

  async updateRoadmapProgress(progress: RoadmapProgress): Promise<void> {
    const key = progress.monthIndex.toString();
    this.roadmapProgressMap[key] = progress;
    saveStorage("roadmapProgress", this.roadmapProgressMap);
  }

  async getAllMockInterviewQuestions(): Promise<MockInterviewQuestion[]> {
    return this.mockInterviewQuestions;
  }

  async saveMockInterviewAnswer(answer: MockInterviewAnswer): Promise<void> {
    this.mockInterviewAnswers[answer.questionId] = answer;
    saveStorage("mockAnswers", this.mockInterviewAnswers);
  }

  async getInternshipApplications(): Promise<InternshipApplication[]> {
    return this.internshipApplications;
  }

  async getInternshipApplicationsSortedByCompany(): Promise<InternshipApplication[]> {
    return [...this.internshipApplications].sort((a, b) =>
      a.company.localeCompare(b.company),
    );
  }

  async getInternshipApplicationsSortedByDate(): Promise<InternshipApplication[]> {
    return [...this.internshipApplications].sort((a, b) =>
      b.dateApplied.localeCompare(a.dateApplied),
    );
  }

  async addInternshipApplication(app: InternshipApplication): Promise<void> {
    this.internshipApplications.push(app);
    saveStorage("applications", this.internshipApplications);
  }

  async updateInternshipApplication(app: InternshipApplication): Promise<void> {
    this.internshipApplications = this.internshipApplications.map((existing) =>
      existing.id === app.id ? app : existing,
    );
    saveStorage("applications", this.internshipApplications);
  }

  async deleteInternshipApplication(id: string): Promise<void> {
    this.internshipApplications = this.internshipApplications.filter(
      (app) => app.id !== id,
    );
    saveStorage("applications", this.internshipApplications);
  }

  async getReminderSettings(): Promise<ReminderSettings | null> {
    return this.reminderSettings;
  }

  async updateReminderSettings(settings: ReminderSettings): Promise<void> {
    this.reminderSettings = settings;
    saveStorage("reminderSettings", settings);
  }

  async getResumeData(): Promise<ResumeData | null> {
    return this.resumeData;
  }

  async updateResumeData(data: ResumeData): Promise<void> {
    this.resumeData = data;
    saveStorage("resumeData", data);
  }
}

export const mockBackend = new MockBackend();
