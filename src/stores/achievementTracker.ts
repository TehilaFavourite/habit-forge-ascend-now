import { useAchievementsStore } from "./achievementsStore";
import { useAuthStore } from "./authStore";

export interface ActivityTracker {
  // Learning activities
  articlesRead: number;
  coursesCompleted: number;
  researchPapers: number;
  blogPosts: number;

  // Coding activities
  linesOfCode: number;
  projectsCompleted: number;
  bugsFound: number;
  unitTests: number;
  deployments: number;

  // Security activities
  securityChallenges: number;
  vulnerabilitiesFound: number;
  ctfWins: number;
  auditsCompleted: number;
  disclosures: number;

  // Technical activities
  rustBasics: boolean;
  memoryAllocator: boolean;
  concurrentApp: boolean;
  cryptoAlgorithm: boolean;
  smartContractVuln: boolean;

  // Community activities
  forumAnswers: number;
  mentees: number;
  presentations: number;
  connections: number;
  followers: number;

  // Character activities
  earlySessions: number;
  focusSessions: number;
  failureLessons: number;
}

export class AchievementTracker {
  private static instance: AchievementTracker;
  private activityTracker: ActivityTracker;
  private userId: string | null = null;

  private constructor() {
    this.activityTracker = this.loadActivityTracker();
  }

  static getInstance(): AchievementTracker {
    if (!AchievementTracker.instance) {
      AchievementTracker.instance = new AchievementTracker();
    }
    return AchievementTracker.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private loadActivityTracker(): ActivityTracker {
    const stored = localStorage.getItem("activity-tracker");
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      articlesRead: 0,
      coursesCompleted: 0,
      researchPapers: 0,
      blogPosts: 0,
      linesOfCode: 0,
      projectsCompleted: 0,
      bugsFound: 0,
      unitTests: 0,
      deployments: 0,
      securityChallenges: 0,
      vulnerabilitiesFound: 0,
      ctfWins: 0,
      auditsCompleted: 0,
      disclosures: 0,
      rustBasics: false,
      memoryAllocator: false,
      concurrentApp: false,
      cryptoAlgorithm: false,
      smartContractVuln: false,
      forumAnswers: 0,
      mentees: 0,
      presentations: 0,
      connections: 0,
      followers: 0,
      earlySessions: 0,
      focusSessions: 0,
      failureLessons: 0,
    };
  }

  private saveActivityTracker() {
    localStorage.setItem(
      "activity-tracker",
      JSON.stringify(this.activityTracker)
    );
  }

  private updateAchievement(achievementId: string, progress: number) {
    if (!this.userId) return;

    const updateAchievementProgress =
      useAchievementsStore.getState().updateAchievementProgress;
    updateAchievementProgress(this.userId, achievementId, progress);
  }

  // Learning achievements
  trackArticleRead() {
    this.activityTracker.articlesRead++;
    this.saveActivityTracker();
    this.updateAchievement("bookworm", this.activityTracker.articlesRead);
  }

  trackCourseCompleted() {
    this.activityTracker.coursesCompleted++;
    this.saveActivityTracker();
    this.updateAchievement("scholar", this.activityTracker.coursesCompleted);
  }

  trackResearchPaper() {
    this.activityTracker.researchPapers++;
    this.saveActivityTracker();
    this.updateAchievement("deep-thinker", this.activityTracker.researchPapers);
  }

  trackBlogPost() {
    this.activityTracker.blogPosts++;
    this.saveActivityTracker();
    this.updateAchievement("author", this.activityTracker.blogPosts);
  }

  trackResearchPublication() {
    this.activityTracker.researchPapers++;
    this.saveActivityTracker();
    this.updateAchievement("researcher", this.activityTracker.researchPapers);
  }

  // Coding achievements
  trackLinesOfCode(lines: number) {
    this.activityTracker.linesOfCode += lines;
    this.saveActivityTracker();
    this.updateAchievement("code-warrior", this.activityTracker.linesOfCode);
  }

  trackProjectCompleted() {
    this.activityTracker.projectsCompleted++;
    this.saveActivityTracker();
    this.updateAchievement("architect", this.activityTracker.projectsCompleted);
  }

  trackBugFound() {
    this.activityTracker.bugsFound++;
    this.saveActivityTracker();
    this.updateAchievement("bug-hunter", this.activityTracker.bugsFound);
  }

  trackUnitTest() {
    this.activityTracker.unitTests++;
    this.saveActivityTracker();
    this.updateAchievement("test-master", this.activityTracker.unitTests);
  }

  trackDeployment() {
    this.activityTracker.deployments++;
    this.saveActivityTracker();
    this.updateAchievement("deployer", this.activityTracker.deployments);
  }

  // Security achievements
  trackSecurityChallenge() {
    this.activityTracker.securityChallenges++;
    this.saveActivityTracker();
    this.updateAchievement("guardian", this.activityTracker.securityChallenges);
  }

  trackVulnerabilityFound() {
    this.activityTracker.vulnerabilitiesFound++;
    this.saveActivityTracker();
    this.updateAchievement(
      "detective",
      this.activityTracker.vulnerabilitiesFound
    );
  }

  trackCTFWin() {
    this.activityTracker.ctfWins++;
    this.saveActivityTracker();
    this.updateAchievement("champion", this.activityTracker.ctfWins);
  }

  trackAuditCompleted() {
    this.activityTracker.auditsCompleted++;
    this.saveActivityTracker();
    this.updateAchievement("auditor", this.activityTracker.auditsCompleted);
  }

  trackDisclosure() {
    this.activityTracker.disclosures++;
    this.saveActivityTracker();
    this.updateAchievement("whistleblower", this.activityTracker.disclosures);
  }

  // Technical achievements
  trackRustBasics() {
    this.activityTracker.rustBasics = true;
    this.saveActivityTracker();
    this.updateAchievement("rust-basics", 1);
  }

  trackMemoryAllocator() {
    this.activityTracker.memoryAllocator = true;
    this.saveActivityTracker();
    this.updateAchievement("memory-master", 1);
  }

  trackConcurrentApp() {
    this.activityTracker.concurrentApp = true;
    this.saveActivityTracker();
    this.updateAchievement("async-architect", 1);
  }

  trackCryptoAlgorithm() {
    this.activityTracker.cryptoAlgorithm = true;
    this.saveActivityTracker();
    this.updateAchievement("crypto-craftsman", 1);
  }

  trackSmartContractVuln() {
    this.activityTracker.smartContractVuln = true;
    this.saveActivityTracker();
    this.updateAchievement("contract-auditor", 1);
  }

  // Community achievements
  trackForumAnswer() {
    this.activityTracker.forumAnswers++;
    this.saveActivityTracker();
    this.updateAchievement("helper", this.activityTracker.forumAnswers);
  }

  trackMentee() {
    this.activityTracker.mentees++;
    this.saveActivityTracker();
    this.updateAchievement("mentor", this.activityTracker.mentees);
  }

  trackPresentation() {
    this.activityTracker.presentations++;
    this.saveActivityTracker();
    this.updateAchievement("speaker", this.activityTracker.presentations);
  }

  trackConnection() {
    this.activityTracker.connections++;
    this.saveActivityTracker();
    this.updateAchievement("connector", this.activityTracker.connections);
  }

  trackFollower() {
    this.activityTracker.followers++;
    this.saveActivityTracker();
    this.updateAchievement("influencer", this.activityTracker.followers);
  }

  // Character achievements
  trackEarlySession() {
    this.activityTracker.earlySessions++;
    this.saveActivityTracker();
    this.updateAchievement(
      "discipline-demon",
      this.activityTracker.earlySessions
    );
  }

  trackFocusSession() {
    this.activityTracker.focusSessions++;
    this.saveActivityTracker();
    this.updateAchievement(
      "focus-fortress",
      this.activityTracker.focusSessions
    );
  }

  trackFailureLesson() {
    this.activityTracker.failureLessons++;
    this.saveActivityTracker();
    this.updateAchievement(
      "growth-mindset",
      this.activityTracker.failureLessons
    );
  }

  // Get current progress
  getActivityTracker(): ActivityTracker {
    return { ...this.activityTracker };
  }

  // Reset tracker (for testing or user reset)
  resetTracker() {
    this.activityTracker = this.loadActivityTracker();
    this.saveActivityTracker();
  }
}

// Hook to use the achievement tracker
export const useAchievementTracker = () => {
  const { user } = useAuthStore();
  const tracker = AchievementTracker.getInstance();

  if (user?.id) {
    tracker.setUserId(user.id);
  }

  return tracker;
};
