import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  useAchievementTracker,
  ActivityTracker,
} from "@/stores/achievementTracker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  Shield,
  Target,
  Users,
  Star,
  Plus,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export const AchievementTracker = () => {
  const { user } = useAuthStore();
  const tracker = useAchievementTracker();
  const [activityTracker, setActivityTracker] = useState<ActivityTracker>(
    tracker.getActivityTracker()
  );

  const updateTracker = () => {
    setActivityTracker(tracker.getActivityTracker());
  };

  const handleTrackActivity = (
    activityType: keyof ActivityTracker,
    value?: number
  ) => {
    switch (activityType) {
      // Learning activities
      case "articlesRead":
        tracker.trackArticleRead();
        toast.success("Article read tracked! 📚");
        break;
      case "coursesCompleted":
        tracker.trackCourseCompleted();
        toast.success("Course completed! 🎓");
        break;
      case "researchPapers":
        tracker.trackResearchPaper();
        toast.success("Research paper tracked! 🧠");
        break;
      case "blogPosts":
        tracker.trackBlogPost();
        toast.success("Blog post tracked! ✍️");
        break;

      // Coding activities
      case "linesOfCode":
        if (value) {
          tracker.trackLinesOfCode(value);
          toast.success(`${value} lines of code tracked! ⚔️`);
        }
        break;
      case "projectsCompleted":
        tracker.trackProjectCompleted();
        toast.success("Project completed! 🏗️");
        break;
      case "bugsFound":
        tracker.trackBugFound();
        toast.success("Bug found and tracked! 🐛");
        break;
      case "unitTests":
        tracker.trackUnitTest();
        toast.success("Unit test tracked! 🧪");
        break;
      case "deployments":
        tracker.trackDeployment();
        toast.success("Deployment tracked! 🚀");
        break;

      // Security activities
      case "securityChallenges":
        tracker.trackSecurityChallenge();
        toast.success("Security challenge completed! 🛡️");
        break;
      case "vulnerabilitiesFound":
        tracker.trackVulnerabilityFound();
        toast.success("Vulnerability found! 🕵️");
        break;
      case "ctfWins":
        tracker.trackCTFWin();
        toast.success("CTF win tracked! 🏆");
        break;
      case "auditsCompleted":
        tracker.trackAuditCompleted();
        toast.success("Audit completed! 📋");
        break;
      case "disclosures":
        tracker.trackDisclosure();
        toast.success("Disclosure tracked! 🚨");
        break;

      // Technical activities
      case "rustBasics":
        tracker.trackRustBasics();
        toast.success("Rust basics mastered! 🦀");
        break;
      case "memoryAllocator":
        tracker.trackMemoryAllocator();
        toast.success("Memory allocator implemented! 💾");
        break;
      case "concurrentApp":
        tracker.trackConcurrentApp();
        toast.success("Concurrent app built! ⚡");
        break;
      case "cryptoAlgorithm":
        tracker.trackCryptoAlgorithm();
        toast.success("Crypto algorithm implemented! 🔐");
        break;
      case "smartContractVuln":
        tracker.trackSmartContractVuln();
        toast.success("Smart contract vulnerability found! 🔍");
        break;

      // Community activities
      case "forumAnswers":
        tracker.trackForumAnswer();
        toast.success("Forum answer tracked! 🤝");
        break;
      case "mentees":
        tracker.trackMentee();
        toast.success("Mentee guided! 👨‍🏫");
        break;
      case "presentations":
        tracker.trackPresentation();
        toast.success("Presentation tracked! 🎤");
        break;
      case "connections":
        tracker.trackConnection();
        toast.success("Connection made! 🌐");
        break;
      case "followers":
        tracker.trackFollower();
        toast.success("Follower gained! 📢");
        break;

      // Character activities
      case "earlySessions":
        tracker.trackEarlySession();
        toast.success("Early session tracked! 🌅");
        break;
      case "focusSessions":
        tracker.trackFocusSession();
        toast.success("Focus session tracked! 🎯");
        break;
      case "failureLessons":
        tracker.trackFailureLesson();
        toast.success("Failure lesson documented! 📈");
        break;
    }
    updateTracker();
  };

  const ActivityCard = ({
    title,
    description,
    icon,
    value,
    activityType,
    isBoolean = false,
    showInput = false,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    value: number | boolean;
    activityType: keyof ActivityTracker;
    isBoolean?: boolean;
    showInput?: boolean;
  }) => {
    const [inputValue, setInputValue] = useState("");

    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {icon}
              <div>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                <CardDescription className='text-xs'>
                  {description}
                </CardDescription>
              </div>
            </div>
            <Badge variant='outline'>
              {isBoolean ? (value ? "Completed" : "Not Done") : `${value}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          {showInput ? (
            <div className='flex gap-2'>
              <Input
                type='number'
                placeholder='Enter value'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className='flex-1'
              />
              <Button
                onClick={() => {
                  const numValue = parseInt(inputValue);
                  if (numValue > 0) {
                    handleTrackActivity(activityType, numValue);
                    setInputValue("");
                  }
                }}
                disabled={!inputValue || parseInt(inputValue) <= 0}
                size='sm'
              >
                Track
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleTrackActivity(activityType)}
              className='w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              disabled={isBoolean && value === true}
            >
              <CheckCircle2 className='mr-2 h-4 w-4' />
              {isBoolean && value ? "Completed" : "Track Activity"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <Award className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-500'>Please log in to track achievements</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          Activity Tracker
        </h2>
        <p className='text-gray-600 mt-1'>
          Track your activities and progress towards achievements
        </p>
      </div>

      <Tabs defaultValue='learning' className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='learning' className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            Learning
          </TabsTrigger>
          <TabsTrigger value='coding' className='flex items-center gap-2'>
            <Code className='h-4 w-4' />
            Coding
          </TabsTrigger>
          <TabsTrigger value='security' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Security
          </TabsTrigger>
          <TabsTrigger value='technical' className='flex items-center gap-2'>
            <Target className='h-4 w-4' />
            Technical
          </TabsTrigger>
          <TabsTrigger value='community' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Community
          </TabsTrigger>
          <TabsTrigger value='character' className='flex items-center gap-2'>
            <Star className='h-4 w-4' />
            Character
          </TabsTrigger>
        </TabsList>

        <TabsContent value='learning' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Articles Read'
              description="Track technical articles you've read"
              icon={<BookOpen className='h-5 w-5 text-blue-600' />}
              value={activityTracker.articlesRead}
              activityType='articlesRead'
            />
            <ActivityCard
              title='Courses Completed'
              description="Track online courses you've finished"
              icon={<TrendingUp className='h-5 w-5 text-green-600' />}
              value={activityTracker.coursesCompleted}
              activityType='coursesCompleted'
            />
            <ActivityCard
              title='Research Papers'
              description="Track research papers you've studied"
              icon={<Award className='h-5 w-5 text-purple-600' />}
              value={activityTracker.researchPapers}
              activityType='researchPapers'
            />
            <ActivityCard
              title='Blog Posts'
              description="Track blog posts you've written"
              icon={<CheckCircle2 className='h-5 w-5 text-orange-600' />}
              value={activityTracker.blogPosts}
              activityType='blogPosts'
            />
          </div>
        </TabsContent>

        <TabsContent value='coding' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Lines of Code'
              description='Track lines of code written'
              icon={<Code className='h-5 w-5 text-green-600' />}
              value={activityTracker.linesOfCode}
              activityType='linesOfCode'
              showInput={true}
            />
            <ActivityCard
              title='Projects Completed'
              description='Track completed projects'
              icon={<Target className='h-5 w-5 text-blue-600' />}
              value={activityTracker.projectsCompleted}
              activityType='projectsCompleted'
            />
            <ActivityCard
              title='Bugs Found'
              description='Track bugs found in your code'
              icon={<CheckCircle2 className='h-5 w-5 text-red-600' />}
              value={activityTracker.bugsFound}
              activityType='bugsFound'
            />
            <ActivityCard
              title='Unit Tests'
              description='Track unit tests written'
              icon={<TrendingUp className='h-5 w-5 text-purple-600' />}
              value={activityTracker.unitTests}
              activityType='unitTests'
            />
            <ActivityCard
              title='Deployments'
              description='Track production deployments'
              icon={<Award className='h-5 w-5 text-orange-600' />}
              value={activityTracker.deployments}
              activityType='deployments'
            />
          </div>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Security Challenges'
              description='Track security challenges completed'
              icon={<Shield className='h-5 w-5 text-blue-600' />}
              value={activityTracker.securityChallenges}
              activityType='securityChallenges'
            />
            <ActivityCard
              title='Vulnerabilities Found'
              description='Track security vulnerabilities found'
              icon={<CheckCircle2 className='h-5 w-5 text-red-600' />}
              value={activityTracker.vulnerabilitiesFound}
              activityType='vulnerabilitiesFound'
            />
            <ActivityCard
              title='CTF Wins'
              description='Track CTF competition wins'
              icon={<Award className='h-5 w-5 text-yellow-600' />}
              value={activityTracker.ctfWins}
              activityType='ctfWins'
            />
            <ActivityCard
              title='Audits Completed'
              description='Track security audits completed'
              icon={<Target className='h-5 w-5 text-purple-600' />}
              value={activityTracker.auditsCompleted}
              activityType='auditsCompleted'
            />
            <ActivityCard
              title='Disclosures'
              description='Track responsible disclosures'
              icon={<TrendingUp className='h-5 w-5 text-green-600' />}
              value={activityTracker.disclosures}
              activityType='disclosures'
            />
          </div>
        </TabsContent>

        <TabsContent value='technical' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Rust Basics'
              description='Master Rust fundamentals'
              icon={<Target className='h-5 w-5 text-orange-600' />}
              value={activityTracker.rustBasics}
              activityType='rustBasics'
              isBoolean={true}
            />
            <ActivityCard
              title='Memory Allocator'
              description='Implement custom memory allocator'
              icon={<TrendingUp className='h-5 w-5 text-blue-600' />}
              value={activityTracker.memoryAllocator}
              activityType='memoryAllocator'
              isBoolean={true}
            />
            <ActivityCard
              title='Concurrent App'
              description='Build concurrent application'
              icon={<Code className='h-5 w-5 text-green-600' />}
              value={activityTracker.concurrentApp}
              activityType='concurrentApp'
              isBoolean={true}
            />
            <ActivityCard
              title='Crypto Algorithm'
              description='Implement cryptographic algorithm'
              icon={<Shield className='h-5 w-5 text-purple-600' />}
              value={activityTracker.cryptoAlgorithm}
              activityType='cryptoAlgorithm'
              isBoolean={true}
            />
            <ActivityCard
              title='Smart Contract Vuln'
              description='Find smart contract vulnerability'
              icon={<CheckCircle2 className='h-5 w-5 text-red-600' />}
              value={activityTracker.smartContractVuln}
              activityType='smartContractVuln'
              isBoolean={true}
            />
          </div>
        </TabsContent>

        <TabsContent value='community' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Forum Answers'
              description='Track forum questions answered'
              icon={<Users className='h-5 w-5 text-blue-600' />}
              value={activityTracker.forumAnswers}
              activityType='forumAnswers'
            />
            <ActivityCard
              title='Mentees'
              description='Track junior developers mentored'
              icon={<Target className='h-5 w-5 text-green-600' />}
              value={activityTracker.mentees}
              activityType='mentees'
            />
            <ActivityCard
              title='Presentations'
              description='Track presentations given'
              icon={<Award className='h-5 w-5 text-purple-600' />}
              value={activityTracker.presentations}
              activityType='presentations'
            />
            <ActivityCard
              title='Connections'
              description='Track professional connections'
              icon={<TrendingUp className='h-5 w-5 text-orange-600' />}
              value={activityTracker.connections}
              activityType='connections'
            />
            <ActivityCard
              title='Followers'
              description='Track social media followers'
              icon={<Star className='h-5 w-5 text-yellow-600' />}
              value={activityTracker.followers}
              activityType='followers'
            />
          </div>
        </TabsContent>

        <TabsContent value='character' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <ActivityCard
              title='Early Sessions'
              description='Track early morning sessions'
              icon={<Star className='h-5 w-5 text-orange-600' />}
              value={activityTracker.earlySessions}
              activityType='earlySessions'
            />
            <ActivityCard
              title='Focus Sessions'
              description='Track distraction-free sessions'
              icon={<Target className='h-5 w-5 text-blue-600' />}
              value={activityTracker.focusSessions}
              activityType='focusSessions'
            />
            <ActivityCard
              title='Failure Lessons'
              description='Track documented failures and lessons'
              icon={<TrendingUp className='h-5 w-5 text-green-600' />}
              value={activityTracker.failureLessons}
              activityType='failureLessons'
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
